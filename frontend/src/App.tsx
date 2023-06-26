import Controller from "./components/Controller"
import Questionary from "./pages/questionary"
import { createBrowserRouter, RouterProvider, Routes, Route, BrowserRouter} from "react-router-dom";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Questionary/>,
    },
    {
      path: "/chat",
      element: <Controller/>,
    },
  ]); 

  return (
      // <RouterProvider router={router}/>
      <BrowserRouter>
      <Routes>
        <Route path="/"
        element= {<Questionary/>}
        />
      </Routes>
      </BrowserRouter>
  )
}

export default App
