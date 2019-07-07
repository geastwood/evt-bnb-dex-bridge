import config from "../config";
import Evt from "evtjs";
import DB from "../db";
import { get } from "lodash";
import BinanceChain from "@binance-chain/javascript-sdk";
import Binance from "../binance";

class EvtListener {
  db: DB;
  words: string;

  constructor(db: DB) {
    this.words = process.env.BINANCE_ACCOUNT_WORDS;
    if (!this.words) {
      throw new Error(`"BINANCE_ACCOUNT_WORDS" needs to be set`);
    }

    this.db = db;
  }

  trxHandler = async (transactions: any[]) => {
    // extract all actions in transactions in a block
    const actions = transactions.reduce((carry, current) => {
      return carry.concat(get(current, "trx.transaction.actions", []));
    }, []);

    // filter out swap actions according to rules
    const swapActions = actions.filter(action => {
      let isSwapAction = true;
      if (action.name !== "transferft") {
        isSwapAction = false;
      }

      // only support evt
      if (Number(action.key) !== 1) {
        isSwapAction = false;
      }

      // "to" address must be in the official evt swap addresses array
      if (!config.evtSwapAddresses.includes(get(action, "data.to"))) {
        isSwapAction = false;
      }

      if (
        !BinanceChain.crypto.checkAddress(
          get(action, "data.memo", ""),
          config.prefix
        )
      ) {
        isSwapAction = false;
      }

      return isSwapAction;
    });

    for (const action of swapActions) {
      const privateKey = Binance.getPrivateKey(this.words);
      const client = await Binance.createClientWithPrivateKey(
        config.api,
        privateKey
      );
      const amount = get(action, "data.number").split(" ")[0];
      console.log(
        `Sending ${config.binanceChainSymbol} ${amount} to ${
          config.binanceSwapAddress
        }`
      );

      const trx = await client.transfer(
        config.binanceSwapAddress,
        get(action, "data.memo", ""),
        amount,
        config.binanceChainSymbol
      );

      console.log(trx);
    }
  };

  /**
   *  - get block detail of LIB
   *  - filter transactions with 'transferft' with target "Evt Address"
   *  - verify it is correct -> has memo with correct binance address
   *  - if correct -> transfer binance evt to the address with converted value
   *
   */
  run = async (endpoint: any) => {
    console.log("Evt listener started...");

    const apiCaller = Evt({
      endpoint
    });

    const nodeInfo = await apiCaller.getInfo();

    let LIB_NODE = Number(nodeInfo.last_irreversible_block_num);
    let LIB_DB = Number(await this.db.getLastLib());

    if (LIB_DB > LIB_NODE) {
      throw new Error(
        "Invalid state: LIB in database is bigger than LIB in chain"
      );
    }

    // let LIB = String(LIB_DB || LIB_NODE);
    let LIB = String(LIB_NODE);
    console.log(`Initial LIB: ${LIB}`);

    let errorCount = 0;
    // monitoring start with LIB (inclusive)
    while (true) {
      console.log(`Processing LIB: ${LIB}`);
      try {
        const detail = await apiCaller.getBlockDetail(LIB);
        await this.trxHandler(detail.transactions);
        // detail.transactions.forEach(detail => {
        //   console.log(JSON.stringify(detail.trx.transaction.actions, null, 4));
        // });

        // increase LIB by 1
        LIB = String(Number(LIB) + 1);
        // save update to date LIB to database
        this.db.addLib(Number(LIB));
        // reset error count
        errorCount = 0;
      } catch (e) {
        errorCount = errorCount + 1;
        if (get(e, "serverError.name") !== "unknown_block_exception") {
          console.log(`Error Processing LIB: ${LIB} `);
        }

        if (errorCount > 100) {
          console.log("Adding timeout, errorCount is bigger than threshold");
          Atomics.wait(
            new Int32Array(new SharedArrayBuffer(4)),
            0,
            0,
            1000 * 100
          );
        }
      }
    }
  };
}

export default EvtListener;

const run = async () => {
  const db = await DB.getInstance();
  const e = new EvtListener(db);
  e.run(config.evtNetwork);
};

run();
