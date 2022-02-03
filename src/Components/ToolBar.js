import React from "react";

const ToolBar = ({ setElementType, elementType }) => {
  // handel onClick
  const handelOnClick = (event) => {
    event.preventDefault();
    setElementType(event.target.innerHTML);
  };

  const handleActiveCss = (value) => {
    return elementType === value ? "active" : "";
  };

  // On Download
  const onDownload = () => {
    var download = document.getElementById("download");
    var image = document
      .getElementById("canvas")
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    download.setAttribute("href", image);
  };

  return (
    <div className="toolbarContainer">
      <ul>
        <li onClick={handelOnClick} className={handleActiveCss("Floor")}>
          Floor
        </li>
        <li onClick={handelOnClick} className={handleActiveCss("Cubicle")}>
          Cubicle
        </li>
        <li onClick={handelOnClick} className={handleActiveCss("Chair")}>
          Chair
        </li>
      </ul>
      <a id="download" download="canvas.png">
        <button type="button" onClick={onDownload}>
          Download Image
        </button>
      </a>
    </div>
  );
};

export default ToolBar;
