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

  // return undefined if none found
  getLastLib = async (): Promise<number> => {
    const lib = await this.conn("lib").max("lib as lib");
    return get(lib, "[0].lib", 0);
  };

  static getInstance = async () => {
    if (instance === null) {
      const connection = await new Connection(config.db).connect();
      instance = new DB(connection);
    }

    return instance;
  };
}
export default DB;

// const run = async () => {
//   const db = await DB.getInstance();
//   const d = await db.getLastLib();

//   console.log(d[0].lib, "done");
// };

// run();
