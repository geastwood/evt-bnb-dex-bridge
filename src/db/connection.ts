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
      .createTableIfNotExists("lib", table => {
        table.increments("id");
        table
          .bigInteger("lib")
          .unique()
          .notNullable()
          .index();
        table
          .boolean("processed")
          .notNullable()
          .defaultTo(false);
        table.timestamp("created_at").defaultTo(conn.fn.now());
      })
      .createTableIfNotExists("acts", table => {
        table.increments("id");
        table.string("trx_id").notNullable();
        table.bigInteger("seq").notNullable();
        table.index(["trx_id", "seq"]);
        table
          .bigInteger("lib")
          .unique()
          .notNullable();
        table
          .string("status")
          .notNullable()
          .defaultTo("pending");
        table
          .string("data")
          .nullable()
          .defaultTo(null);
        table.timestamp("updated_at").defaultTo(conn.fn.now());
      })
      .createTableIfNotExists("binance_trx", table => {
        table.increments("id");
        table.string("hash").notNullable();
        table.index(["hash"]);
        table
          .string("status")
          .notNullable()
          .defaultTo("pending");
        table
          .string("data")
          .nullable()
          .defaultTo(null);
        table.timestamp("updated_at").defaultTo(conn.fn.now());
      })
      .then(() => {
        process.exit(0);
        console.log("success");
      })
      .catch(e => {
        console.error(e);
        process.exit(1);
      });
  };

  connect = async () =>
    knex({
      client: "pg",
      connection: this.connection
    });
}

export default Connection;
