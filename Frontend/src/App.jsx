import {BrowserRouter, Routes, Route} from "react-router-dom"
import HomePage from './pages/HomePage'
import Login from './components/Login'
import Dashboard from "./pages/Dashboard"

function App (){

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup"  element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/login" element={<Login />}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App