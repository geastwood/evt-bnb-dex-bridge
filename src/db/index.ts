import Connection from "./connection";
import knex from "knex";
import config from "../config";
import { get } from "lodash";

let instance: DB | null = null;
class DB {
  readonly conn: knex<any, any>;
  constructor(knex: knex<any, any>) {
    this.conn = knex;
  }

  addLib = async (lib: number) => {
    await this.conn.table("lib").insert({ lib });
  };

  completeLib = async (lib: number) => {
    await this.conn
      .table("lib")
      .where({ lib: lib })
      .update({
        processed: true,
      });
  };

  // return undefined if none found
  getLastLib = async (): Promise<number> => {
    const lib = await this.conn("lib").max("lib as lib");
    return get(lib, "[0].lib", config.defaultProcessBlockNum);
  };

  addAct = async (trxId: string, seq: number, lib: number) => {
    await this.conn.table("acts").insert({ trx_id: trxId, seq, lib });
  };

  updateAct = async (trxId: string, seq: number, status: string, data: string) => {
    await this.conn
      .table("acts")
      .where({ trx_id: trxId, seq })
      .update({
        status,
        data,
      });
  };
  addBinanceTrx = async (hash: string) => this.conn.table("binance_trx").insert({ hash });

  updateBinanceTrx = async (hash: string, status: string, data: string) =>
    this.conn
      .table("binance_trx")
      .where({ hash })
      .update({ status, data });

  static getInstance = async () => {
    if (instance === null) {
      const connection = await new Connection(config.db).connect();
      instance = new DB(connection);
    }

    return instance;
  };
}

export default DB;
