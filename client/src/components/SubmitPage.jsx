import { useEffect, useState, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { getRandomEvents, recordScore } from "../apis/fetches";
import { Container, Card, Button, ProgressBar, Alert, Badge } from "react-bootstrap";
import UserContext from '../context/userContext.js';

function SubmitPage() {
    const { segmentslength } = useParams();
    const [randomEvents, setRandomEvents] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [coins, setCoins] = useState(20);
    const location = useLocation();
    const user = useContext(UserContext);
    const navigate = useNavigate();


    const stationsArray = location.state?.connections || [];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const limit = Number(segmentslength);
                const data = await getRandomEvents(limit);
                const arrayOfEvents = Object.values(data);
                setRandomEvents(arrayOfEvents);
            } catch (error) {
                console.error("Failed to fetch events:", error);
            }
        };

        if (segmentslength) {
            fetchEvents();
        }
    }, [segmentslength]);

    const handleNextStep = () => {
        if (currentIndex >= randomEvents.length - 1) {
            if (user && user.id) {
                if (coins < 0){
                    setCoins(0)
                }
                recordScore(user.id, coins)
                    .then(response => {
                        console.log("Score recorded:", response);
                    })
                    .catch(error => {
                        console.error("Failed to record score:", error);
                    });
                }
        }
        const currentEvent = randomEvents[currentIndex];

        if (currentEvent && typeof currentEvent.effect === 'number') {
            setCoins(prevCoins => prevCoins + currentEvent.effect);
        }

        setCurrentIndex(prevIndex => prevIndex + 1);
    };

    const currentEvent = randomEvents[currentIndex];

    const currentSegment = stationsArray[currentIndex];

    const isJourneyComplete = currentIndex >= randomEvents.length;

    const progressPercentage = randomEvents.length > 0
        ? Math.round((currentIndex / randomEvents.length) * 100)
        : 0;

    return (
        <Container className="d-flex justify-content-center mt-5" style={{ marginBottom: "50px" }}>
            <Card style={{ width: "100%", maxWidth: "500px" }} className="shadow-sm border-0">

                <Card.Header className="bg-primary text-white text-center py-3 rounded-top">
                    <Card.Title className="mb-0 fw-bold fs-4">Journey Progress</Card.Title>
                </Card.Header>

                <Card.Body className="p-4 text-center">
                    <div className="mb-4">
                        <span className="text-muted d-block uppercase small fw-bold tracking-wider">Current Balance</span>
                        <h2 className="display-6 fw-bold text-warning m-0"> {coins} <span className="fs-6 text-muted">coins</span></h2>
                    </div>

                    {randomEvents.length > 0 && (
                        <div className="mb-4">
                            <div className="d-flex justify-content-between small text-muted mb-1">
                                <span>Progress</span>
                                <span>{progressPercentage}%</span>
                            </div>
                            <ProgressBar animated now={progressPercentage} variant="success" style={{ height: "10px" }} />
                        </div>
                    )}

                    {randomEvents.length > 0 && !isJourneyComplete && currentEvent ? (
                        <div>
                            <Badge bg="secondary" className="mb-2 px-3 py-2 fs-6 rounded-pill">
                                Step {currentIndex + 1} of {randomEvents.length}
                            </Badge>

                            {/* Added Segment Info Display */}
                            {currentSegment && (
                                <div className="my-3 fw-bold text-primary fs-5">
                                    Current Segment: <span className="text-dark d-block mt-1">{currentSegment}</span>
                                </div>
                            )}

                            <Alert variant="warning" className="text-start border-start border-danger border-4 my-3 py-3">
                                <Alert.Heading className="fs-5 d-flex align-items-center">
                                    Unexpected Event!
                                </Alert.Heading>
                                <p className="mb-2 text-dark">
                                    {currentEvent.description || "Something unexpected happened on the tracks..."}
                                </p>
                                <hr />
                                <p className="mb-0 fw-bold text-end">
                                    Effect: {" "}
                                    <span className={currentEvent.effect >= 0 ? "text-success" : "text-danger"}>
                                        {currentEvent.effect > 0 ? `+${currentEvent.effect}` : currentEvent.effect} coins
                                    </span>
                                </p>
                            </Alert>

                            <Button
                                onClick={handleNextStep}
                                variant="primary"
                                size="lg"
                                className="w-100 shadow-sm mt-2 fw-semibold"
                            >
                                {currentIndex === randomEvents.length - 1 ? "Finish Journey" : "Next Step"}
                            </Button>
                        </div>
                    ) : (
                        randomEvents.length > 0 && (
                            <div className="py-3">
                                <h3 className="fw-bold text-success mb-2">Journey Complete!</h3>
                                <p className="text-muted mb-4">
                                    You safely navigated all hazards and arrived at the final destination with a grand total of <strong>{coins} coins</strong>.
                                </p>
                                <Button variant="outline-primary" size="lg" className="w-100 fw-semibold"
                                    onClick={() => navigate('/leaderboard')}
                                >
                                    See Leaderboard
                                </Button>
                            </div>
                        )
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}

export default SubmitPage;