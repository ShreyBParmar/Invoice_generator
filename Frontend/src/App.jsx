import {BrowserRouter, Routes, Route} from "react-router-dom"
import HomePage from './pages/HomePage'
import Business from "./components/Business"
import Dashboard from "./pages/Dashboard"

function App (){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup"  element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App