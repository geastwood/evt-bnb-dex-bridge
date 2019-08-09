import "mocha";
import { expect } from "chai";
import { convertBinanceAmountToEvt, adjustAmountWithFee } from "./utils";

describe("convert amount from Binance to EVT", () => {
  it("1 -> 1.00000", () => {
    expect(convertBinanceAmountToEvt("1")).to.equal("1.00000");
  });

  it("1.00000 -> 1.00000", () => {
    expect(convertBinanceAmountToEvt("1.00000")).to.equal("1.00000");
  });

  it("1.0 -> 1.00000", () => {
    expect(convertBinanceAmountToEvt("1.00000")).to.equal("1.00000");
  });

  it("1.000001 -> 1.00000", () => {
    expect(convertBinanceAmountToEvt("1.000001")).to.equal("1.00000");
  });

  it("9999.9999 -> 9999.9999", () => {
    expect(convertBinanceAmountToEvt("9999.9999")).to.equal("9999.99990");
  });

  it("9999999.999995 -> 9999999.99999", () => {
    expect(convertBinanceAmountToEvt("9999999.999995")).to.equal("9999999.99999");
  });

  it("10_000_000_000.99999999 -> 10_000_000_000.99999", () => {
    expect(convertBinanceAmountToEvt("10000000000.99999999")).to.equal("10000000000.99999");
  });
});

describe("Adjust amount with fee", () => {
  it("0.01000", () => {
    expect(adjustAmountWithFee("0.01000")).to.equal("0.00000");
  });
  it("3.01000", () => {
    expect(adjustAmountWithFee("3.01000")).to.equal("0.01000");
  });
  it("3.99999", () => {
    expect(adjustAmountWithFee("3.99999")).to.equal("0.99999");
  });
});
