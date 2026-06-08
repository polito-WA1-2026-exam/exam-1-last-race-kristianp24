import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card"; 
import NetworkMap from "./NetowrkMap";
import ListGroup from 'react-bootstrap/ListGroup';
import { useEffect, useState } from "react";
import { fetchConnections, fetchStartEndStations } from "../apis/fetches";

function PlayPage(){
    const [connections, setConnections] = useState([])
    const [selectedConnections, setSelectedConnections] = useState([]) 
    const [startStation, setStartStation] = useState("Tap to Start") 
    const [endStation, setEndStation] = useState("Tap to Start")   
    const [hideButton, setHideButton] = useState(false)
            

    useEffect(() => {
        const loadConnections = async () => {
            const data = await fetchConnections();
            setConnections(data)
        }
        loadConnections();
    }, [])

    async function handleClickStart(ev){
        ev.preventDefault()
        try{
            const response = await fetchStartEndStations()
            setStartStation(response.nameStartStation)
            setEndStation(response.nameEndStation)
            setHideButton(true)
        }
        catch(err){
            console.log(err)
        }
    }

    function handleRowClick(connection) {
        if (selectedConnections.includes(connection)) {
            setSelectedConnections(selectedConnections.filter(item => item !== connection));
        } else {
            setSelectedConnections([...selectedConnections, connection]);
        }
    }

   return (
        <>
        <Container className="mt-4">
            <Row>
                <Col md={6}>
                   <NetworkMap lines={false}/>
                </Col>

                <Col md={6}>
                    <Card className="p-3 shadow-sm border-0 bg-light text-center ms-auto mb-3" style={{ maxWidth: "600px" }}>
                        <Card.Body className="p-2">
                            <Row className="align-items-center">
                                <Col xs={5}>
                                    <span className="text-muted small uppercase d-block fw-bold mb-1">Start Station</span>
                                    <span className="fs-5 fw-semibold text-dark">{startStation || "—"}</span>
                                </Col>
                                
                                <Col xs={2} className="d-flex justify-content-center pink-divider">
                                    <div style={{ borderLeft: "2px solid #dee2e6", height: "40px" }}></div>
                                </Col>
                                
                                <Col xs={5}>
                                    <span className="text-muted small uppercase d-block fw-bold mb-1">End Station</span>
                                    <span className="fs-5 fw-semibold text-dark">{endStation || "—"}</span>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                   <div 
        className="shadow-sm border rounded ms-auto" 
        style={{ 
            maxWidth: "600px", 
            maxHeight: "350px", 
            overflowY: "auto"   
        }}
    >
        <ListGroup variant="flush"> 
            {connections.map((connection, index) => (
                <ListGroup.Item
                    key={index}
                    action
                    active={selectedConnections.includes(connection)} 
                    onClick={() => handleRowClick(connection)}
                    style={{ cursor: "pointer" }}
                >
                    {connection} 
                </ListGroup.Item>
            ))}
        </ListGroup>
    </div>
                </Col>
            </Row>

            <Row className="mt-4 justify-content-center">
                <Col xs="auto">
                    <Button 
                        disabled={hideButton} 
                        variant="primary" 
                        size="lg" 
                        className="px-5 py-2 fw-bold" 
                        onClick={(ev) => handleClickStart(ev)}
                    > 
                        Start Game 
                    </Button>
                </Col>
            </Row>
        </Container>
        </>
    )
}

export default PlayPage;