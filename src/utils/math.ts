export const randomID = () => {
  const MAX_POKEMON_ID = 900; // 0~900 &  neki oko 10_000?
  const newRandomID = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
  return newRandomID;
};

export const constrain = (num: number, min: number, max: number) => {
  return Math.max(Math.min(num, max), min);
};

export const round2Decimals = (num: number) => {
  return parseFloat(num.toFixed(2));
};
