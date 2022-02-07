import React, { useLayoutEffect, useState } from "react";

// Rough Js
import rough from "roughjs/bundled/rough.esm";

// Components
import ToolBar from "./Components/ToolBar";
import CanvasScreen from "./Components/CanvasScreen";

// CSS
import "./App.css";

// Helper Function
import {
  adjustElementCoordinates,
  createElement,
  cursorForPosition,
  getElementAtPosition,
  removeOverlappingElements,
  resizedCoordinates,
} from "./helperFunctions";

function App() {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("Floor");
  const [selectedElement, setSelectedElement] = useState(null);
  const [isRefactoringData, setIsRefactoringData] = useState(false);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    if (
      elements.length > 0 &&
      action === "none" &&
      isRefactoringData === false
    ) {
      // Removing Overlapping elements
      const { newElementData, errorElements } =
        removeOverlappingElements(elements);
      setElements(newElementData);

      // Rendering Elements
      elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
      setIsRefactoringData(true);
    } else {
      // Rendering Elements
      elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));
      setIsRefactoringData(false);
    }
  }, [elements]);

  // Updating Element
  const updateElement = (id, x1, y1, x2, y2, type) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, type);
    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement;
    setElements(elementsCopy);
  };

  // Handel Mouse Down Event
  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;
    if (tool === "Selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });

        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resizing");
        }
      }
    } else {
      const id = elements.length;
      const element = createElement(
        id,
        clientX,
        clientY,
        clientX,
        clientY,
        tool
      );
      setElements((prevState) => [...prevState, element]);
      setSelectedElement(element);

      setAction("drawing");
    }
  };

  // Handel Mouse Move Event
  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;

    if (tool === "Selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      event.target.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }

    if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving") {
      const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      const newX1 = clientX - offsetX;
      const newY1 = clientY - offsetY;
      updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type);
    } else if (action === "resizing") {
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );
      updateElement(id, x1, y1, x2, y2, type);
    }
  };

  // Handel Mouse Up Event
  const handleMouseUp = () => {
    if (selectedElement) {
      const index = selectedElement.id;
      const { id, type } = elements[index];
      if (action === "drawing" || action === "resizing") {
        const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
        updateElement(id, x1, y1, x2, y2, type);
      }
    }
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
