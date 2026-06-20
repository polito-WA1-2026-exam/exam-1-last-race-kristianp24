import React, { useState, useEffect } from 'react';
import { Table, Container, Button } from 'react-bootstrap'; 
import {useNavigate} from 'react-router';
const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    fetch('http://localhost:3001/api/scores')
      .then(response => response.json())
      .then(data => setScores(data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4">Leaderboard</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((player, index) => (
            <tr key={player.userID || index}>
              <td>{index + 1}</td>
              <td>{player.username || `User ${player.userID}`}</td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-center mt-4">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => navigate('/playGame')} 
        >
          Play Again
        </Button>
      </div>
      
    </Container>
  );
};

export default Leaderboard;