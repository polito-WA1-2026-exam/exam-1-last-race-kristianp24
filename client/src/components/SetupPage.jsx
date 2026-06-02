import React from "react";
import NetworkMap from "./NetowrkMap"; // Watch out for the typo in the filename here!
import Button from "react-bootstrap/Button";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useNavigate } from "react-router";

function SetupPage(){
    const navigate = useNavigate()

    function handleClick(){
        navigate('/playGame')
    }

    return (
        <>
            <NetworkMap />
            
            <Container style={{ marginTop: '20px' , marginBottom: '20px'}}>
                <Row className="justify-content-center"> 
                    <Col md={4}>
                        <Button variant="primary" size="lg" className="w-100" onClick={handleClick}>
                            Play Game
                        </Button>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default SetupPage;