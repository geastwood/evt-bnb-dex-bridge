import Binance from "./binance";
import config from "./config";
import { get } from "lodash";

export const transfer = async (privateKey: string, from: string, to: string, amount: string) => {
  const client = await Binance.createClientWithPrivateKey(config.api, privateKey);
  const trx = await client.transfer(from, to, amount, "BNB");
  console.log(trx);
};

export const getMemoFromTransaction = (trx: Object) => get(trx, "tx.value.memo", "");
