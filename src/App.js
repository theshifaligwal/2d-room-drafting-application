import { useLayoutEffect, useState } from "react";
// CSS
import "./App.css";

// Constants
import {
  floorColor,
  cubicleColor,
  chairColor,
  outlineColor,
} from "./constants";

// Components
import CanvasScreen from "./Components/CanvasScreen";
import ToolBar from "./Components/ToolBar";

// Rough JS
import rough from "roughjs/bundled/rough.esm";
const generator = rough.generator();

function createElement(x1, y1, x2, y2, elementType) {
  const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
    roughness: 0.1,
    fill: colorDecider(elementType),
    fillStyle: "solid", // solid fill
    strokeLineDash: 0,
  });
  return { x1, y1, x2, y2, roughElement };
}

const colorDecider = (elementType) => {
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

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}

function App() {
  const [elements, setElements] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [elementType, setElementType] = useState("Floor");

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);
    if (!drawing)
      elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
    else {
      if (elements.length > 1) {
        for (let index = 0; index < elements.length - 1; index++) {
          roughCanvas.draw(elements[index].roughElement);
        }
      }
      if (elements.length > 0) {
        const index = elements.length - 1;
        const { x1, y1, x2, y2 } = elements[index];
        const p = context.getImageData(x2, y2, 1, 1).data;
        const hexCodeColor =
          "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        // console.log(hexCodeColor);
        if (elementType === "Cubicle") {
          // console.log(floorColor, outlineColor);
          // console.log(floorColor === hexCodeColor, outlineColor === hexCodeColor);
          if (hexCodeColor == floorColor || hexCodeColor == outlineColor) {
          } else {
            let copyElement = [...elements];
            copyElement.pop();
            setElements(copyElement);
            setDrawing(false);
            alert("You Can Not make Cubical out of floor");
          }
        }
        roughCanvas.draw(elements[index].roughElement);
      }
    }
  }, [elements]);

  const handleMouseDown = (event) => {
    setDrawing(true);
    const { clientX, clientY } = event;
    const elements = createElement(
      clientX,
      clientY,
      clientX,
      clientY,
      elementType
    );
    setElements((prevState) => [...prevState, elements]);
  };

  const handleMouseMove = (event) => {
    if (!drawing) return;

    const { clientX, clientY } = event;
    const index = elements.length - 1;
    const { x1, y1 } = elements[index];
    const updatedElement = createElement(x1, y1, clientX, clientY, elementType);

    const elementCopy = [...elements];
    elementCopy[index] = updatedElement;
    setElements(elementCopy);
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };
  return (
    <div className="appContainer">
      <ToolBar elementType={elementType} setElementType={setElementType} />
      <CanvasScreen
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
      />
    </div>
  );
}

export default App;
