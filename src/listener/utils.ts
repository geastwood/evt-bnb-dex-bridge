// since Binance boosted to 8 decimals, conversion is needed here
import Big from "big.js";

export const convertBinanceAmountToEvt = (amount: string) => {
  let converted = Big(amount)
    .mul(Big(10 ** 8))
    .div(Big(10 ** 3));

  if (converted.toString().includes(".")) {
    converted = Big(converted.toString().split(".")[0]);
  }

  return Big(converted)
    .div(10 ** 5)
    .toFixed(5);
};

export const adjustAmountWithFee = (amount: string) => Math.max(0, parseFloat(amount) - 3).toFixed(5);
