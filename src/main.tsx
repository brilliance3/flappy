import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { startLangSync } from "./i18n";

// Mirror the SimsimPlay portal's language choice (localStorage "ssp_lang").
startLangSync();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
