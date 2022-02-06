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

const isWithinElement = (x, y, element) => {
  const { elementType, x1, x2, y1, y2 } = element;
  if (elementType === "Floor" || elementType === "Cubicle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  } else {
    //
  }
};

const getElementAtPosition = (x, y, elements) => {
  return elements.find((element) => isWithinElement(x, y, element));
};

function App() {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("Floor");
  const [selectedElement, setSelectedElement] = useState(null);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);
    if (!action)
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
        if (tool === "Cubicle" && !checkCubicleColor(hexCodeColor)) {
          let copyElement = [...elements];
          copyElement.pop();
          setElements(copyElement);
          setAction("none");
          alert(`You can not make ${tool}`);
        }
        // Check For Chairs
        if (tool === "Chair" && !checkChairColor(hexCodeColor)) {
          let copyElement = [...elements];
          copyElement.pop();
          setElements(copyElement);
          setAction("none");
          alert(`You can not make ${tool}`);
        }
        roughCanvas.draw(elements[index].roughElement);
      }
    }
  }, [elements]);

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    if (tool === "Selection") {
      // If we are moving the select actions to moving
      const element = getElementAtPosition(clientX, clientY, elements);
      if (!!element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
        setAction("moving");
      }
    } else {
      const id = !!elements ? elements.length : 0;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool
      );
      setElements((prevState) => [...prevState, element]);
      setAction("drawing");
    }
  };

  const updateElement = (id, x1, y1, x2, y2, elementType) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, elementType);

    const elementCopy = [...elements];
    elementCopy[id] = updatedElement;
    setElements(elementCopy);
  };

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;

    if (tool === "Selection") {
      event.target.style.cursor = getElementAtPosition(
        clientX,
        clientY,
        elements
      )
        ? "move"
        : "default";
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      const { id, x1, y1, x2, y2, elementType, offsetX, offsetY } =
        selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      const newX1 = clientX - offsetX;
      const newY1 = clientY - offsetY;
      updateElement(
        id,
        newX1,
        newY1,
        newX1 + width,
        newY1 + height,
        elementType
      );
    }
  };

  const handleMouseUp = () => {
    setAction("none");
    setSelectedElement(null);
  };
  return (
    <div className="appContainer">
      <ToolBar tool={tool} setTool={setTool} />
      <CanvasScreen
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
      />
    </div>
  );
}

export default App;
