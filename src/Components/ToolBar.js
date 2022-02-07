import React, { useEffect } from "react";

const ToolBar = ({ setTool, tool, textInputName, setTextInputName }) => {
  useEffect(() => {
    if (tool !== "Text") {
      setTextInputName("");
    }
  }, [tool]);

  // handel onClick
  const handelOnClick = (event) => {
    event.preventDefault();
    setTool(event.target.innerHTML);
  };

  const handleActiveCss = (value) => {
    return tool === value ? "active" : "";
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

  const handelTextInput = (e) => {
    e.preventDefault();
    setTool("Text");
    setTextInputName(e.target.value);
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
        <li onClick={handelOnClick} className={handleActiveCss("Selection")}>
          Selection
        </li>
        <li onClick={handelOnClick} className={handleActiveCss("Text")}>
          Text
        </li>
        <li>
          <input
            value={textInputName}
            onChange={handelTextInput}
            placeholder="Enter Your Text"
          ></input>
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
