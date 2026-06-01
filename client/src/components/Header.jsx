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

function Header(){

    const user = useContext(UserContext)
    const navigate = useNavigate()

    
    function goToLogin(){
        navigate('/login')
    }

    return (
        <>
        <Navbar bg="primary" data-bs-theme="dark">
        <Container>
          <Navbar.Brand > <TrainLightrailFront /> Milan Rail Race </Navbar.Brand>
          <Nav className="ms-auto">
            {user?.name != null ? <Navbar.Text> Hey {user.name} let's play </Navbar.Text> : 
                <Nav.Link  onClick={goToLogin}> Go to Login </Nav.Link>
            }
          </Nav>
        </Container>
      </Navbar>
            
            <Outlet />
        
        </>
    )

}

export default Header