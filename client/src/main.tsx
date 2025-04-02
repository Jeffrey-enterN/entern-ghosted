import { createRoot } from "react-dom/client";
import App from "./App";
import { GhostGuardProvider } from "./context/GhostGuardContext";
import "./index.css";

const root = document.getElementById("root");

// Check if we're running as an extension popup or as a standalone page
const isExtension = window.location.protocol === "chrome-extension:";

// In extension mode, we render the GhostGuard component directly
// In development mode, we render the full App with routing
createRoot(root!).render(
  <GhostGuardProvider>
    <App isExtension={isExtension} />
  </GhostGuardProvider>
);
