import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import TableWithTTS from "./TableWithTTS.jsx"; // <-- Import here

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Wrap in a React fragment or a div */}
    <>
      <App />
      <h1>CSV Table with Long-Press Text-to-Speech</h1>
      <TableWithTTS />
    </>
  </StrictMode>
);
