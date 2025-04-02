import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the title for the extension popup
document.title = "Ghosted - Employer Ghosting Tracker";

// Update theme colors
document.documentElement.style.setProperty('--primary', '#6366F1');
document.documentElement.style.setProperty('--secondary', '#EC4899');
document.documentElement.style.setProperty('--warning', '#F59E0B');
document.documentElement.style.setProperty('--danger', '#EF4444');
document.documentElement.style.setProperty('--success', '#10B981');

// Create a custom theme meta tag for theming
const meta = document.createElement('meta');
meta.name = 'theme-color';
meta.content = '#6366F1';
document.head.appendChild(meta);

// Create a viewport meta tag for mobile
const viewportMeta = document.createElement('meta');
viewportMeta.name = 'viewport';
viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1';
document.head.appendChild(viewportMeta);

// Mount the app
createRoot(document.getElementById("root")!).render(<App />);
