import "mocha";
import { expect } from "chai";
import { convertBinanceAmountToEvt } from "./utils";

describe("convert amount from Binance to EVT", () => {
  it("should work", () => {
    expect(convertBinanceAmountToEvt("1")).to.equal("1.00000");
  });
});
