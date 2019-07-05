import development from "./development";
import production from "./production";

const environment = process.env.NODE_ENV || "development";

export default (environment === "development" ? development : production);
