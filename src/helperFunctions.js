// Constants
import {
  floorColor,
  cubicleColor,
  chairColor,
  outlineColor,
} from "./constants";

// Rough JS
import rough from "roughjs/bundled/rough.esm";
const generator = rough.generator();

export const createElement = (x1, y1, x2, y2, elementType) => {
  const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
    roughness: 0.1,
    fill: colorDecider(elementType),
    fillStyle: "solid", // solid fill
    strokeLineDash: 0,
  });
  return { x1, y1, x2, y2, roughElement };
};

export const generateHexColorCode = (p) => {
  return "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
};

export const colorDecider = (elementType) => {
  switch (elementType) {
    case "Floor":
      return floorColor;
      break;
    case "Cubicle":
      return cubicleColor;
      break;
    case "Chair":
      return chairColor;
      break;

    default:
      break;
  }
};

export const rgbToHex = (r, g, b) => {
  if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
};

export const checkCubicleColor = (hexCodeColor) => {
  return hexCodeColor == floorColor || hexCodeColor == outlineColor;
};
export const checkChairColor = (hexCodeColor) => {
  return hexCodeColor == cubicleColor || hexCodeColor == outlineColor;
};
