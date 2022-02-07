import React, { useLayoutEffect, useState } from "react";

// Rough Js
import rough from "roughjs/bundled/rough.esm";

// Toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  drawElement,
  getElementAtPosition,
  removeOverlappingElements,
  resizedCoordinates,
  toastifyErrorMessage,
} from "./helperFunctions";

function App() {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("Floor");
  const [selectedElement, setSelectedElement] = useState(null);
  const [isRefactoringData, setIsRefactoringData] = useState(false);
  const [textInputName, setTextInputName] = useState("");

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
      let { newElementData, removedElements } =
        removeOverlappingElements(elements);
      setElements(newElementData);

      // // Throw error message for all removed elements
      // removedElements.map((element) => toastifyErrorMessage(element.type));

      // Rendering Elements
      elements.forEach((element) => {
        drawElement(roughCanvas, context, element);
      });
      setIsRefactoringData(true);
    } else {
      // Rendering Elements
      elements.forEach((element) => {
        drawElement(roughCanvas, context, element);
      });
      setIsRefactoringData(false);
    }
  }, [elements]);

  // Updating Element
  const updateElement = (id, x1, y1, x2, y2, type) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, type, "");
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
      const element =
        tool === "Text"
          ? createElement(
              id,
              clientX,
              clientY,
              clientX,
              clientY,
              tool,
              textInputName
            )
          : createElement(id, clientX, clientY, clientX, clientY, tool, "");
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

    if (action === "drawing" && tool !== "Text") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      updateElement(index, x1, y1, clientX, clientY, tool);
    } else if (action === "moving" && tool !== "Text") {
      const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      const newX1 = clientX - offsetX;
      const newY1 = clientY - offsetY;
      updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type);
    } else if (action === "resizing" && tool !== "Text") {
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
    if (!!selectedElement && tool !== "Text") {
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
      <ToolBar
        tool={tool}
        setTool={setTool}
        textInputName={textInputName}
        setTextInputName={setTextInputName}
      />
      <CanvasScreen
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={handleMouseUp}
      />
      <ToastContainer />
    </div>
  );
}

export default App;
