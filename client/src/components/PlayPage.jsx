import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import NetworkMap from "./NetowrkMap";
import ListGroup from 'react-bootstrap/ListGroup';
import { useEffect, useState } from "react";
import { fetchConnections, fetchStartEndStations, checkRoute, recordScore } from "../apis/fetches";
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router";
import { useContext } from "react";
import UserContext from '../context/userContext.js';
import {StopwatchFill} from 'react-bootstrap-icons';

function PlayPage() {
    const [connections, setConnections] = useState([])
    const [selectedConnections, setSelectedConnections] = useState([])
    const [startStation, setStartStation] = useState("Tap to Start")
    const [endStation, setEndStation] = useState("Tap to Start")
    const [hideButton, setHideButton] = useState(false)
    const [alert, setAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")
    
    const [timer, setTimer] = useState(90)
    const [isTimerActive, setIsTimerActive] = useState(false)

    const navigate = useNavigate()
    const user = useContext(UserContext);

    useEffect(() => {
        const loadConnections = async () => {
            const data = await fetchConnections();
            setConnections(data)
        }
        loadConnections();
    }, [])

    
    useEffect(() => {
        let interval = null;

        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
            setIsTimerActive(false);
            handleTimeOut(); 
        }

        return () => clearInterval(interval);
    }, [isTimerActive, timer, selectedConnections, startStation, endStation]);

    async function executeRouteSubmission(isTimeout = false) {
    if (selectedConnections.length === 0) {
        setAlert(true);
        setAlertMessage(
            isTimeout 
                ? "Time is up! You didn't select any connections." 
                : "Please select at least one connection before submitting your route."
        );
        if (!isTimeout) return; 
    }
    
    if (!startStation || !endStation || startStation === "Tap to Start" || endStation === "Tap to Start") {
        setAlert(true);
        setAlertMessage(
            isTimeout 
                ? "Time is up! Your start or end stations were not set." 
                : "Please ensure that both start and end stations are set before submitting your route."
        );
        if (!isTimeout) return;
    }

    try {
        const shouldCheckRoute = !isTimeout && selectedConnections.length > 0;
        const response = shouldCheckRoute 
            ? await checkRoute(selectedConnections, startStation, endStation)
            : { success: false, message: "Time's up! You lost your coins. Try again." };

        if (response.success) {
            setIsTimerActive(false);
            navigate(`/submit/${selectedConnections.length}`, { 
                state: { connections: selectedConnections } 
            });                 
        } else {
            setAlertMessage(response.message || "Invalid route. You lost all your coins. Please try again.");
            setAlert(true);
            setStartStation("Tap to Start");
            setEndStation("Tap to End");
            setSelectedConnections([]);
            setHideButton(false);
            
            setIsTimerActive(false);
            setTimer(90);
            
            await recordScore(user.id, 0);
        }
    } catch (err) {
        console.log(err);
    }
}

    const handleTimeOut = () => {
         executeRouteSubmission(true);
    };

    async function handleClickStart(ev) {
        ev.preventDefault()
        try {
            const response = await fetchStartEndStations()
            setStartStation(response.nameStartStation)
            setEndStation(response.nameEndStation)
            setHideButton(true)
            
            setTimer(90)
            setIsTimerActive(true)
        }
        catch (err) {
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

    async function handleClickSubmit(ev) {
        ev.preventDefault()
        await executeRouteSubmission(false); 
    }

    return (
        <>
            {alert && (
                <Alert variant="danger" onClose={() => setAlert(false)} dismissible className="text-center">
                    {alertMessage || "Please select at least one connection and ensure that the start and end stations are set."}
                </Alert>
            )}
            <Container className="mt-4">
                <Row>
                    <Col md={6}>
                        <NetworkMap lines={false} />
                    </Col>
                    <Col md={6}>
                        {isTimerActive && (
                            <div className="text-center mb-2">
                                <span className={`fs-4 fw-bold ${timer <= 15 ? 'text-danger animate-pulse' : 'text-secondary'}`}>
                                    <StopwatchFill></StopwatchFill> Time Remaining: {timer}s
                                </span>
                            </div>
                        )}

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
                                {connections.map((connection, index) => {
                                    const selectionIndex = selectedConnections.indexOf(connection);
                                    const isSelected = selectionIndex !== -1;

                                    return (
                                        <ListGroup.Item
                                            key={index}
                                            action
                                            active={isSelected}
                                            onClick={() => handleRowClick(connection)}
                                            style={{ cursor: "pointer" }}
                                            className="d-flex justify-content-between align-content-center"
                                        >
                                            <span>{connection}</span>

                                            {isSelected && (
                                                <span className="badge bg-light text-dark border rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                    {selectionIndex + 1}
                                                </span>
                                            )}
                                        </ListGroup.Item>
                                    );
                                })}
                            </ListGroup>
                        </div>
                    </Col>
                </Row>

                <Row className="mt-4 justify-content-center gap-3">
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

                    <Col xs="auto">
                        <Button
                            variant="primary"
                            size="lg"
                            className="px-5 py-2 fw-bold"
                            onClick={(ev) => handleClickSubmit(ev)}
                        >
                            Submit Route
                        </Button>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default PlayPage;