import WebSocket from "ws";
import config from "../config";
import Evt from "evtjs";
import Binance from "../binance";
import { getMemoFromTransaction } from "../utils";
import DB from "../db";
import { get } from "lodash";

const start = () => {
  DB.getInstance().then(db => {
    new BinanceListener(config.ws, db);
  });
};

// since Binance boosted to 8 decimals, conversion is needed here
export const convertBinanceAmountToEvt = (amount: string) => {
  const converted = (((Number(amount) * 10 ** 8) / 10 ** 3) << 0) / 10 ** 5;
  return String(converted.toFixed(5));
};

class BinanceListener {
  private db: DB;
  private api: string;
  private ws: WebSocket;
  private privateKey: string;
  private pingTimeoutHandler: any;
  constructor(api: string, db: DB) {
    this.db = db;
    this.api = api;
    this.privateKey = process.env.EVT_ACCOUNT_PRIVATE_KEY;
    this.pingTimeoutHandler = null;

    if (!this.privateKey) {
      throw new Error(`"EVT_ACCOUNT_PRIVATE_KEY" is not specified`);
    }

    if (!Evt.EvtKey.isValidPrivateKey(this.privateKey)) {
      throw new Error(`Value in "EVT_ACCOUNT_PRIVATE_KEY" is not valid.`);
    }

    this.ws = new WebSocket(api);
    this.ws.on("ping", this.pingHandler);
    this.ws.on("open", this.handleOpen);
    this.ws.on("message", this.handleMessage);
    this.ws.on("close", this.handleClose);
  }

  send = (data: Object) => {
    this.ws.send(JSON.stringify(data));
  };

  pingHandler = () => {
    // reset old timeout handler
    clearTimeout(this.pingTimeoutHandler);

    // create new timeout handler
    this.pingTimeoutHandler = setTimeout(() => {
      this.ws.terminate();
    }, 30000 + 2000); // 30sec standard + 2sec latency
  };

  handleSwap = (to: string, hash: string, amount: string) => {
    // init apiCaller with private key
    const apiCaller = Evt({
      endpoint: config.evtNetwork,
      keyProvider: [this.privateKey]
    });

    const publicKey = Evt.EvtKey.privateToPublic(this.privateKey);

    this.db.updateBinanceTrx(
      hash,
      "sending",
      `Sending to ${to} with amount ${amount}`
    );

    const action = {
      from: publicKey,
      to,
      number: `${amount} S#1`,
      memo: hash
    };
    // @ts-ignore
    apiCaller
      .pushTransaction(
        { maxCharge: 10000000, payer: publicKey },
        new Evt.EvtAction("transferft", action)
      )
      .then(trx => {
        this.db.updateBinanceTrx(hash, "sent", get(trx, "transactionId", ""));
      })
      .catch(e => {
        this.db.updateBinanceTrx(
          hash,
          "failed",
          `Error sending Evt transaction: ${JSON.stringify(action)}`
        );
      });
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

    this.db.addBinanceTrx(hash);

    let addressCache = "";

    Binance.getTrx(hash)
      .then(getMemoFromTransaction)
      .then(address => {
        addressCache = address;
        const isValid = Evt.EvtKey.isValidAddress(address);

        if (!isValid) {
          this.db.updateBinanceTrx(hash, "failed", `${address} is not valid.`);
        } else {
          const convertedAmount =
            (((Number(targetSymbol.A) * 10 ** 8) / 10 ** 3) << 0) / 10 ** 5; // since Binance boosted to 8 decimals, conversion is needed here
          this.handleSwap(address, hash, String(convertedAmount.toFixed(5))); // TODO double check
        }
      })
      .catch(e => {
        this.db.updateBinanceTrx(
          hash,
          "failed",
          `getTrx failed (hash: "${hash}", address: "${addressCache}")`
        );
      });
  };

  handleOpen = () => {
    console.log(`[INFO]: websocket (${config.ws}) opened`);
    this.send({
      method: "subscribe",
      topic: "transfers",
      address: config.binanceSwapAddress
    });
  };

  handleMessage = async (raw: string) => {
    const { stream, data } = JSON.parse(raw);
    if (stream === "transfers") {
      await this.handleTransaction(data);
    }
  };

  handleClose = async (data: any) => {
    console.log("Trying to reconnect...");

    // restart websocket
    setTimeout(start, 10);
  };
}

start();
