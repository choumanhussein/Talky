import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import Controller from "./components/Controller"
import Questionary from "./pages/questionary"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from './store'
import { Provider } from 'react-redux'
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  
  <React.StrictMode>
    <Provider store={store}>
     <BrowserRouter>
      <Routes>
        <Route 
        path="/"
        element= {<Questionary/>}
        />
         <Route 
        path="/chat"
        element= {<Controller/>}
        />
      </Routes>
      </BrowserRouter>
      </Provider>
  </React.StrictMode>,
)
