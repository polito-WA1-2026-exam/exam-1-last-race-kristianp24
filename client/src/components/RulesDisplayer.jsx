import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Controller } from 'react-bootstrap-icons';

function GameRulesCard() {
  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} sm={4} md={5} lg={10}> 
          
          <Card className="border border-secondary-subtle rounded-3 overflow-hidden shadow-sm h-100">
            <Card.Body className="p-4 d-flex flex-column justify-content-between">
              <div>
                <Card.Title className="fw-bold text-primary mb-3 text-center fs-4">
                  <Controller></Controller> Game Rules
                </Card.Title>
                <Card.Subtitle className="mb-4 text-muted text-center small">
                  Read the guidelines carefully before starting your rail journey.
                </Card.Subtitle>
                
                <ListGroup>
                  <ListGroup.Item className="p-3 border-secondary-subtle">
                    <div className="mb-2"><Badge bg="info">Setup</Badge></div>
                    <small>Start with <strong>20 coins</strong>. Review the complete station network map before choosing to proceed.</small>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="p-3 border-secondary-subtle">
                    <div className="mb-2"><Badge bg="warning" text="dark">Planning</Badge></div>
                    <small>You have exactly <strong>90 seconds</strong> to trace a continuous path between your assigned stations spanning at least 3 stops.</small>
                  </ListGroup.Item>
                  
                  <ListGroup.Item className="p-3 border-secondary-subtle">
                    <div className="mb-2"><Badge bg="danger">Risk</Badge></div>
                    <small>Submitting an invalid route or letting the timer run out on an incomplete line zeroes your score instantly.</small>
                  </ListGroup.Item>

                  <ListGroup.Item className="p-3 border-secondary-subtle">
                    <div className="mb-2"><Badge bg="success">Events</Badge></div>
                    <small>Each step triggers random underground incidents modifying your total wallet balance by <strong>-4 to +4 coins</strong>.</small>
                  </ListGroup.Item>
                </ListGroup>
              </div>
            </Card.Body>
            <Card.Footer className="text-center text-muted small bg-light p-3 border-top border-secondary-subtle">
              Log in to play and lock your best score onto the global leaderboard! 
            </Card.Footer>
          </Card>

        </Col>
      </Row>
    </Container>
  );
}

export default GameRulesCard;