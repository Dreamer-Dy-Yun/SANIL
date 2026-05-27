import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./app/App";
import { FrontendServicesProvider } from "./app/FrontendServicesProvider";
import { createFrontendServices } from "./app/serviceFactory";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FrontendServicesProvider services={createFrontendServices()}>
      <HashRouter>
        <App />
      </HashRouter>
    </FrontendServicesProvider>
  </StrictMode>,
);
