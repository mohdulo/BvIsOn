// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App'
// import './index.css'   // si tu utilises Tailwind ou d'autres styles

// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// )
import './i18n/i18n'; // S'assurer que le fichier est bien chargé
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// @ts-ignore
import "./index.css";

import { CountryContext, countryList } from "./contexts/CountryContext";

const root = ReactDOM.createRoot(document.getElementById("root")!);

// 🔐 Vérifie aussi le chemin d’URL courant
const currentPath = window.location.pathname;
const code = localStorage.getItem("country") as keyof typeof countryList;

if ((!code || !countryList[code]) && currentPath !== "/select-country") {
  window.location.href = "/select-country";
} else {
  root.render(
    <React.StrictMode>
      <CountryContext.Provider value={countryList[code ?? "fr"]}>
        <App />
      </CountryContext.Provider>
    </React.StrictMode>
  );
}

