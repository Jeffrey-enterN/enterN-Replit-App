import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from '@/context/theme-context';

// Render the app
createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="entern-ui-theme">
    <App />
  </ThemeProvider>
);
