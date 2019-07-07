import config from "../config";
import knex from "knex";

class Connection {
  readonly connection: Object;

  constructor(connection: Object) {
    this.connection = connection;
  }

  static setup = async (connection: Object) => {
    const conn = await new Connection(connection).connect();
    // can chain multiple create
    conn.schema
      .createTable("lib", table => {
        table.increments("id");
        table
          .bigInteger("lib")
          .unique()
          .notNullable()
          .index();
        table.timestamp("created_at").defaultTo(conn.fn.now());
      })
      .then(() => {
        process.exit(0);
        console.log("success");
      })
      .catch(e => {
        process.exit(1);
        console.error(e);
      });
  };

  connect = async () =>
    knex({
      client: "mysql",
      connection: this.connection
    });
}

export default Connection;
// dirty test
// Connection.setup(config.db);
