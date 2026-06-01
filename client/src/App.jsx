import { useContext, useState } from 'react'
import UserContext from './context/userContext'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import GameRulesCard from './components/RulesDisplayer';

function App() {
  const [user, setUser] = useState()
  const setLogedInUser = (user) => {
    setUser({id: user.id, name: user.name, email: user.email})
  }

  

  return (
    <>
      <UserContext.Provider value = {user}>
        <Routes>
          <Route path='/' element={<Header />}>
             <Route index element={<GameRulesCard />} />
          </Route>

        <Route path = '/login' element={<LoginForm userSetter = {setLogedInUser} />}></Route>

      </Routes>


      </UserContext.Provider>
    </>
  )
}

export default App
