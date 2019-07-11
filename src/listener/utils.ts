// since Binance boosted to 8 decimals, conversion is needed here
export const convertBinanceAmountToEvt = (amount: string) => {
  const converted = (((Number(amount) * 10 ** 8) / 10 ** 3) << 0) / 10 ** 5;
  return String(converted.toFixed(5));
};
