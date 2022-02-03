import React from "react";

const CanvasScreen = ({ handleMouseDown, handleMouseMove, handleMouseUp }) => {
  return (
    <div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
};

export default CanvasScreen;
