import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import LoginForm from './LoginForm';
import { useNavigate } from 'react-router';
import { useContext, useState } from 'react';
import UserContext from '../context/userContext.js';
import { TrainLightrailFront } from 'react-bootstrap-icons';
import { Outlet } from 'react-router';
import {doLogout} from '../apis/auth.js';


function Header(){

    const {user, setUser} = useContext(UserContext)
    const navigate = useNavigate()

    
    function goToLogin(){
        navigate('/login')
    }

    function handleLogout(){
        doLogout()
            .then(() => {
                setUser({id: null, name: null, email: null, surname: null})
                navigate('/')
            }   )
    }

    return (
        <>
  <Navbar bg="primary" data-bs-theme="dark">
    <Container>
      <Navbar.Brand> <TrainLightrailFront /> Milan Rail Race </Navbar.Brand>
      <Nav className="ms-auto">
        {user?.name != null ? (
          <>
            <Navbar.Text className="me-3"> Hey {user.name} let's play </Navbar.Text>  
            <Nav.Link onClick={() => navigate('/leaderboard')}> Go to Leaderboard </Nav.Link>
            <Nav.Link onClick={handleLogout}> Log Out </Nav.Link>
          
          </>
        ) : (
          <Nav.Link onClick={goToLogin}> Go to Login </Nav.Link>
        )}
      </Nav>
    </Container>

  </Navbar>
    <Outlet />
</>
    )

}

export default Header