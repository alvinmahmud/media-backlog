import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Media Backlog</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Clicked {count} times!
        </button>
      </div>
    </>
  );
}

export default App;
