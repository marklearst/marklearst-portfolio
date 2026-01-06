export const rgbChannels = (token) => {
  const value = token?.value ?? token?.$value;
  const { r, g, b, a } = parseColor(value);
  const hasAlpha = a !== undefined;
  return `${r} ${g} ${b}${hasAlpha ? " / " + a : ""}`;
};

export const dimensionValue = (token) => {
  const value = token?.value ?? token?.$value;
  if (value && typeof value === "object" && "value" in value && "unit" in value) {
    return `${value.value}${value.unit}`;
  }
  return value;
};

const parseColor = (value) => {
  if (typeof value === "string") {
    if (value.startsWith("#")) {
      return parseHex(value);
    }
    if (value.startsWith("rgb")) {
      return parseRgbString(value);
    }
  }
  if (value && typeof value === "object") {
    if (typeof value.r === "number" && typeof value.g === "number" && typeof value.b === "number") {
      return { r: value.r, g: value.g, b: value.b, a: value.alpha };
    }
  }
  throw new Error(`Value '${value}' is not a supported color format.`);
};

const parseRgbString = (value) => {
  const comma =
    /rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+%?))?\s*\)/;
  const space =
    /rgba?\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/;
  const matches = value.match(comma) || value.match(space);
  if (!matches) {
    throw new Error(`Value '${value}' is not a valid rgb or rgba format.`);
  }
  const [, r, g, b, a] = matches;
  return {
    r,
    g,
    b,
    a: a !== undefined ? parseAlpha(a) : undefined,
  };
};

const parseHex = (value) => {
  const hex = value.replace("#", "").toLowerCase();
  if (![3, 6, 8].includes(hex.length)) {
    throw new Error(`Value '${value}' is not a valid hex color.`);
  }
  const expand = (str) => (str.length === 1 ? str + str : str);
  const toInt = (str) => parseInt(str, 16);
  if (hex.length === 3) {
    return {
      r: toInt(expand(hex[0])),
      g: toInt(expand(hex[1])),
      b: toInt(expand(hex[2])),
    };
  }
  const r = toInt(hex.slice(0, 2));
  const g = toInt(hex.slice(2, 4));
  const b = toInt(hex.slice(4, 6));
  const a = hex.length === 8 ? toInt(hex.slice(6, 8)) / 255 : undefined;
  return { r, g, b, a };
};

const parseAlpha = (value) => (value.endsWith("%") ? parseFloat(value) / 100 : parseFloat(value));
