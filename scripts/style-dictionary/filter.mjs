export const isColor = (token) => (token?.$type || token?.type) === "color";
export const isDimension = (token) =>
  (token?.$type || token?.type) === "dimension";
