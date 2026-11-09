import { StrictMode } from "react";
import { watchSystemTheme } from "./theme";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./style.css";

watchSystemTheme();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => {});
