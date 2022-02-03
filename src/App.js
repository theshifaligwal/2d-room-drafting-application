import { useLayoutEffect, useState } from "react";

// CSS
import "./App.css";

// Components
import CanvasScreen from "./Components/CanvasScreen";
import ToolBar from "./Components/ToolBar";

// Helper Function
import {
  checkChairColor,
  checkCubicleColor,
  createElement,
  rgbToHex,
  generateHexColorCode,
} from "./helperFunctions";

// Rough JS
import rough from "roughjs/bundled/rough.esm";

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
        const hexCodeColor = generateHexColorCode(
          context.getImageData(x2, y2, 1, 1).data
        );
        // Check For Cubicle
        if (elementType === "Cubicle" && !checkCubicleColor(hexCodeColor)) {
          let copyElement = [...elements];
          copyElement.pop();
          setElements(copyElement);
          setDrawing(false);
          alert(`You can not make ${elementType}`);
        }
        // Check For Chairs
        if (elementType === "Chair" && !checkChairColor(hexCodeColor)) {
          let copyElement = [...elements];
          copyElement.pop();
          setElements(copyElement);
          setDrawing(false);
          alert(`You can not make ${elementType}`);
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
