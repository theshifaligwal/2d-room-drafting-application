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

export const createElement = (id, x1, y1, x2, y2, elementType) => {
  const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
    roughness: 0.1,
    fill: colorDecider(elementType),
    fillStyle: "solid", // solid fill
    strokeLineDash: 0,
  });
  return { id, x1, y1, x2, y2, roughElement, elementType };
};

export const generateHexColorCode = (p) => {
  return "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
};

export const colorDecider = (elementType) => {
  switch (elementType) {
    case "Floor":
      return floorColor;
    case "Cubicle":
      return cubicleColor;
    case "Chair":
      return chairColor;

    default:
      break;
  }
};

export const rgbToHex = (r, g, b) => {
  if (r > 255 || g > 255 || b > 255) {
    console.log("Invalid color component");
  }
  return ((r << 16) | (g << 8) | b).toString(16);
};

export const checkCubicleColor = (hexCodeColor) => {
  return hexCodeColor === floorColor || hexCodeColor === outlineColor;
};
export const checkChairColor = (hexCodeColor) => {
  return hexCodeColor === cubicleColor || hexCodeColor === outlineColor;
};
