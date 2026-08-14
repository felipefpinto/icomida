import { Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Home from "./app/page";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">

      <Header />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

      </Routes>

    </div>
  );
}

export default App;