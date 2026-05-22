import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CVProvider } from "./store/CVContext";
import Dashboard from "./pages/Dashboard";
import Viewer from "./pages/Viewer";
import Layout from "./components/Layout";

export default function App() {
  return (
    <CVProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
          <Route path="/cv/:id?" element={<Viewer />} />
        </Routes>
      </BrowserRouter>
    </CVProvider>
  );
}
