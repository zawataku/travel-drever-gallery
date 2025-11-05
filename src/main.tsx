import React from 'react'
import ReactDOM from 'react-dom/client'
import '/src/styles/index.css'
import '/src/styles/GenJyuuGothic-Medium.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)