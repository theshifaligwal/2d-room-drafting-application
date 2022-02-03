// CSS
import "./App.css";

// Components
import CanvasScreen from "./Components/CanvasScreen";
import ToolBar from "./Components/ToolBar";

function App() {
  return (
    <div className="appContainer">
      <ToolBar />
      <CanvasScreen />
    </div>
  );
}

export default App;
