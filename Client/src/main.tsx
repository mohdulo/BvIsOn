import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'   // si tu utilises Tailwind ou d'autres styles

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
