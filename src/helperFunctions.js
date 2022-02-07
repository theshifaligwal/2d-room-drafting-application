// Rough Js
import rough from "roughjs/bundled/rough.esm";

// Toastify
import { toast } from "react-toastify";

// Constants
import { floorColor, cubicleColor, chairColor } from "./constants";

const generator = rough.generator();
// Decides Color of the block
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

// Return point in object
export const point = (x, y) => ({ x, y });

// Find the Distance
export const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

// Calculate Diameter of Circle
export const diameter = (x1, y1, x2, y2) =>
  distance(point(x1, y1), point(x2, y2)) * 2;

// Create the rough element
export const createElement = (id, x1, y1, x2, y2, type) => {
  const elementStyle = {
    roughness: 0,
    fill: colorDecider(type),
    fillStyle: "solid", // solid fill
    strokeLineDash: 0,
  };
  const roughElement =
    type === "Chair"
      ? generator.circle(x1, y1, diameter(x1, y1, x2, y2), elementStyle)
      : generator.rectangle(x1, y1, x2 - x1, y2 - y1, elementStyle);
  return { id, x1, y1, x2, y2, type, roughElement };
};

// Find the near Points
export const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};

// Find whether the point is on line or not
export const pointIsOnLine = (lineStart, lineEnd, point, name) => {
  const offset =
    distance(lineStart, lineEnd) -
    (distance(lineStart, point) + distance(lineEnd, point));
  return Math.abs(offset) < 1 ? name : null;
};

// Find position within the element
export const positionWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  if (type === "Floor" || type === "Cubicle") {
    const topLeft = nearPoint(x, y, x1, y1, "tl");
    const topRight = nearPoint(x, y, x2, y1, "tr");
    const bottomLeft = nearPoint(x, y, x1, y2, "bl");
    const bottomRight = nearPoint(x, y, x2, y2, "br");

    const top = pointIsOnLine(point(x1, y1), point(x2, y1), point(x, y), "t");
    const right = pointIsOnLine(point(x2, y1), point(x2, y2), point(x, y), "r");
    const bottom = pointIsOnLine(
      point(x1, y2),
      point(x2, y2),
      point(x, y),
      "b"
    );
    const left = pointIsOnLine(point(x1, y1), point(x1, y2), point(x, y), "l");

    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    return (
      topLeft ||
      topRight ||
      bottomLeft ||
      bottomRight ||
      top ||
      right ||
      bottom ||
      left ||
      inside
    );
  } else {
    const start = nearPoint(x, y, x1, y1, "start");
    const end = nearPoint(x, y, x2, y2, "end");
    const inside = pointIsOnLine(
      point(x1, y1),
      point(x2, y2),
      point(x, y),
      "inside"
    );
    return start || end || inside;
  }
};

// Find the current element that is at the position
export const getElementAtPosition = (x, y, elements) => {
  return elements
    .map((element) => ({
      ...element,
      position: positionWithinElement(x, y, element),
    }))
    .find((element) => element.position !== null);
};

// Adjust the coordinates of the element
export const adjustElementCoordinates = (element) => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "Floor" || type === "Cubicle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};

// Return the cursor according to the position
export const cursorForPosition = (position) => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    case "t":
    case "b":
      return "ns-resize";
    case "r":
    case "l":
      return "ew-resize";
    default:
      return "move";
  }
};

// return new coordinates on resizing
export const resizedCoordinates = (clientX, clientY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    case "t":
      return { x1, y1: clientY, x2, y2 };
    case "r":
      return { x1, y1, x2: clientX, y2 };
    case "b":
      return { x1, y1, x2, y2: clientY };
    case "l":
      return { x1: clientX, y1, x2, y2 };
    default:
      return null; //should not really get here...
  }
};

// Check if the inside element is inside the parameter of
// the outside element.
export const isInside = (insideElement, outsideElement) => {
  return (
    insideElement.x1 >= outsideElement.x1 &&
    insideElement.y1 >= outsideElement.y1 &&
    insideElement.x2 <= outsideElement.x2 &&
    insideElement.y2 <= outsideElement.y2
  );
};

// Removing all the overlapping elements
export const removeOverlappingElements = (elements) => {
  const floor = elements.filter((floor) => floor.type === "Floor");
  const cubicle = elements.filter((floor) => floor.type === "Cubicle");
  const chair = elements.filter((floor) => floor.type === "Chair");
  let newElementData = floor;
  let newCubicle = [];
  let removedElements = [];

  // Remove all the cubicles if they are overlapping
  cubicle.map((insideCubicleElement, index) => {
    const isCubicleInsideCubicle = cubicle.find(
      (outsideCubicleElement, insideIndex) => {
        if (
          insideIndex !== index &&
          isInside(insideCubicleElement, outsideCubicleElement)
        ) {
          return true;
        }
      }
    );
    if (!!isCubicleInsideCubicle) {
      removedElements.push(insideCubicleElement);
    } else {
      newCubicle.push(insideCubicleElement);
    }
  });

  // Remove all the cubicles which are outside of the floor
  floor.map((floorElement) => {
    newCubicle.map((cubicleElement) => {
      if (isInside(cubicleElement, floorElement)) {
        newElementData.push(cubicleElement);
      } else {
        removedElements.push(cubicleElement);
      }
    });
  });

  // Remove all the chair which are outside of the cubicle
  // Remove all the extra chair in cubicle
  newCubicle.map((cubicleElement) => {
    let chairCount = 0;
    chair.map((chairElement) => {
      if (isInside(chairElement, cubicleElement) && chairCount < 1) {
        ++chairCount;
        newElementData.push(chairElement);
      } else {
        removedElements.push(chairElement);
      }
    });
  });
  return { newElementData, removedElements };
};

export const toastifyErrorMessage = (elementType) =>
  toast.error(
    `${elementType} is removed due to its bounder's are in restricted area`,
    {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    }
  );
