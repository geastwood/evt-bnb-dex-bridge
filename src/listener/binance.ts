import WebSocket from "ws";
import config from "../config";
import Evt from "evtjs";
import Binance from "../binance";
import { getMemoFromTransaction } from "../utils";

class BinanceListener {
  private ws: WebSocket;
  private privateKey: string;
  constructor(api: string) {
    this.privateKey = process.env.EVT_ACCOUNT_PRIVATE_KEY;

    if (!this.privateKey) {
      throw new Error(`"EVT_ACCOUNT_PRIVATE_KEY" is not specified`);
    }

    if (!Evt.EvtKey.isValidPrivateKey(this.privateKey)) {
      throw new Error(`Value in "EVT_ACCOUNT_PRIVATE_KEY" is not valid.`);
    }

    this.ws = new WebSocket(api);
    this.ws.on("open", this.handleOpen);
    this.ws.on("message", this.handleMessage);
    this.ws.on("error", this.handleError);
    this.ws.on("close", this.handleClose);
  }

  send = (data: Object) => {
    this.ws.send(JSON.stringify(data));
  };

  handleSwap = (to: string, memo: string, amount: string) => {
    // init apiCaller with private key
    const apiCaller = Evt({
      endpoint: config.evtNetwork,
      keyProvider: [this.privateKey]
    });

    const publicKey = Evt.EvtKey.privateToPublic(this.privateKey);

    console.log(`[INFO]: Sending to ${to} with amount ${amount}`);
    apiCaller
      .pushTransaction(
        { maxCharge: 10000000, payer: publicKey },
        new Evt.EvtAction("transferft", {
          from: publicKey,
          to: to,
          number: `${amount} S#1`,
          memo
        })
      )
      .catch(e => console.log("pushtransaction error", e));
  };
  handleTransaction = (payload: any) => {
    // validate payload
    const { t: to, H: hash } = payload;

    // to address must be BNB swap address
    const targetTransfer = to.find(({ o }) => o === config.binanceSwapAddress);
    if (!targetTransfer) {
      return;
    }

    // symbol must have EVT-BNB token, whose amount will be considered
    const targetSymbol = targetTransfer.c.find(
      ({ a }) => a === config.binanceChainSymbol
    );

    if (!targetSymbol) {
      return;
    }

    Binance.getTrx(hash)
      .then(getMemoFromTransaction)
      .then(address => {
        const isValid = Evt.EvtKey.isValidAddress(address);
        if (!isValid) {
          throw new Error(`"${address}" is not valid`);
        }

        return address;
      })
      .then(address => {
        const convertedAmount =
          (((Number(targetSymbol.A) * 10 ** 8) / 10 ** 3) << 0) / 10 ** 5; // since Binance boosted to 8 decimals, conversion is needed here
        this.handleSwap(address, hash, String(convertedAmount.toFixed(5))); // TODO double check
      })
      .catch(e => {
        console.log("getTrx", e); // TODO handle exception
      });
  };

  handleOpen = () => {
    console.log(`[INFO]: websocket (${config.ws}) Opened`);
    this.send({
      method: "subscribe",
      topic: "transfers",
      address: config.binanceSwapAddress
    });
  };

  handleMessage = (raw: string) => {
    const { stream, data } = JSON.parse(raw);
    if (stream === "transfers") {
      this.handleTransaction(data);
    }
  };

  handleError = (data: any) => {
    console.error(data);
  };

  handleClose = (data: any) => {
    console.log("closed", data);
  };
}

const listener = new BinanceListener(config.ws);
