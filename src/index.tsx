import React from "react";
import ReactDOM from "react-dom/client";
import { PrimeReactProvider } from "primereact/api";
import "./App.css";
import Tailwind from "primereact/passthrough/tailwind";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
  <PrimeReactProvider value={{ unstyled: false, pt: Tailwind }}>
    <App />
  </PrimeReactProvider>
  // </React.StrictMode>
);

reportWebVitals();
