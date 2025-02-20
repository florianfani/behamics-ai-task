import CompareTexts from "./components/CompareTexts";
import HistoryCompare from "./components/HistoryCompare";

function App() {
  return (
    <div className="flex items-center justify-between px-[12%] ">
      <div className="w-2/3">
        <CompareTexts />
      </div>
      <div className="w-1/3">
        <HistoryCompare />
      </div>
    </div>
  );
}

export default App;
