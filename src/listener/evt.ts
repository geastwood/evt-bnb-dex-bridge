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

  trxHandler = async (transactions: any[], lib: number) => {
    // extract all actions in transactions in a block
    const actions = transactions.reduce(
      (carry, current) =>
        carry.concat(
          get(current, "trx.transaction.actions", []).map((v, seq: number) => ({
            ...v,
            seq,
            trxId: get(current, "trx.id", ""),
          })),
        ),
      [],
    );

    // filter out swap actions according to rules
    const swapActions = actions.filter(action => {
      if (action.name !== "transferft") {
        return false;
      }

      // only support evt
      if (Number(action.key) !== 1) {
        return false;
      }

      // "to" address must be in the official evt swap addresses array
      if (!config.evtSwapAddresses.includes(get(action, "data.to"))) {
        return false;
      }

      // persist trx info from now
      this.db.addAct(action.trxId, action.seq, lib);

      const memoAddress = get(action, "data.memo", "");
      if (!BinanceChain.crypto.checkAddress(memoAddress, config.prefix)) {
        this.db.updateAct(action.trxId, action.seq, "failed", `Invalid "to" address (${memoAddress})`);
        return false;
      }

      if (memoAddress === config.binanceSwapAddress) {
        console.warn(
          `Warning: Skipping Transaction which sends EVT with Binance swap address "${config.binanceSwapAddress}" as memo.`,
        );

        this.db.updateAct(
          action.trxId,
          action.seq,
          "failed",
          `Invalid "to" address: "to" address is Binance swap address (${memoAddress})`,
        );
        return false;
      }

      return true;
    });

    for (const action of swapActions) {
      const privateKey = Binance.getPrivateKey(this.words);
      const client = await Binance.createClientWithPrivateKey(config.api, privateKey);
      const amount = get(action, "data.number").split(" ")[0];

      console.log(`[INFO]: Sending ${config.binanceChainSymbol} ${amount} to ${config.binanceSwapAddress}`);

      this.db.updateAct(action.trxId, action.seq, "sending", "");

      // transfer EVT-BNB to Evt Address specified in memo
      const trx = await client.transfer(
        config.binanceSwapAddress,
        get(action, "data.memo", ""),
        amount,
        config.binanceChainSymbol,
      );

      console.log("[INFO]: Hash", get(trx, "result[0].hash"));

      this.db.updateAct(action.trxId, action.seq, "sent", get(trx, "result[0].hash"));
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
    console.log(`[INFO]: Start listening on Evt (${config.evtNetwork.host})`);

    const apiCaller = Evt({
      endpoint,
    });

    const nodeInfo = await apiCaller.getInfo();

    let LIB_NODE = Number(nodeInfo.last_irreversible_block_num);
    let LIB_DB = Number(await this.db.getLastLib());

    let LIB = String(LIB_DB + 1);

    if (LIB_DB === 0) {
      console.log(`[INFO]: First run, start with default block number: ${LIB}`);
    } else {
      console.log(`[INFO]: Resume with latest processed LIB: ${LIB}`);
    }

    let errorCount = 0;
    let shouldWaitForNewBlock = false;

    // monitoring start with LIB (inclusive)
    while (true) {
      try {
        let time = process.hrtime();

        // process
        const detail = await apiCaller.getBlockDetail(LIB);

        // record processing LIB into DB first
        await this.db.addLib(Number(LIB));
        // console.log("[DEBUG]: Processing LIB:", LIB);

        await this.trxHandler(detail.transactions, Number(LIB));

        // mark processed in DB
        await this.db.completeLib(Number(LIB));

        // increase LIB by 1
        LIB = String(Number(LIB) + 1);

        // reset error count
        errorCount = 0;

        // sleep 500ms
        let elp = process.hrtime(time)[1] / 1000000;

        if (elp < 500 && shouldWaitForNewBlock) {
          await new Promise(done => setTimeout(done, Math.max(300 - elp, 0)));
        }
      } catch (e) {
        errorCount = errorCount + 1;

        if (get(e, "serverError.name") !== "unknown_block_exception") {
          console.log(`Error Processing LIB: ${LIB} `);
        }

        // when first hit "unknown_block_exception", set "shouldWaitForNewBlock" to be true
        if (get(e, "serverError.name") === "unknown_block_exception") {
          shouldWaitForNewBlock = true;
        }

        if (errorCount > 10) {
          console.log("Adding timeout, errorCount is bigger than threshold");
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000 * 10);
        }
      }
    }
  };
}

export default EvtListener;

const run = async () => {
  const db = await DB.getInstance();
  const e = new EvtListener(db);
  await e.run(config.evtNetwork);
};

run();
