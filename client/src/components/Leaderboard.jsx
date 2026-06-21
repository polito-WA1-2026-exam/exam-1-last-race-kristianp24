import React, { useState, useEffect } from 'react';
import { Table, Container, Button, Card } from 'react-bootstrap'; 
import { useNavigate } from 'react-router';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/scores', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => setScores(data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  const renderRank = (index) => {
    const rank = index + 1;
    if (rank === 1) return <span className="fs-5">🥇 <strong className="text-warning">1st</strong></span>;
    if (rank === 2) return <span className="fs-5">🥈 <strong className="text-secondary">2nd</strong></span>;
    if (rank === 3) return <span className="fs-5">🥉 <strong style={{ color: '#cd7f32' }}>3rd</strong></span>;
    return <span className="text-muted ms-2">{rank}</span>;
  };

  return (
    <Container className="my-5" style={{ maxWidth: "800px" }}>
      <Card className="shadow-sm border-0 bg-white p-4">
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark mb-1"> Global Leaderboard</h2>
            <p className="text-muted small">Top players routing the network efficiently</p>
          </div>

          <div className="table-responsive rounded border">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4" style={{ width: '25%' }}>Rank</th>
                  <th className="py-3">Player</th>
                  <th className="py-3 text-end px-4" style={{ width: '25%' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((player, index) => {
                  const isTopThree = index < 3;
                  return (
                    <tr 
                      key={index}
                      className={isTopThree ? "fw-semibold" : ""}
                      style={isTopThree ? { backgroundColor: 'rgba(248, 249, 250, 0.5)' } : {}}
                    >
                      <td className="py-3 px-4">
                        {renderRank(index)}
                      </td>
                      <td className="py-3">
                        <span className={isTopThree ? "text-dark" : "text-secondary"}>
                          {player.username || `User ${player.userID}`}
                        </span>
                      </td>
                      <td className="py-3 text-end px-4">
                        <span className={`badge rounded-pill fs-6 px-3 py-2 ${isTopThree ? 'bg-primary' : 'bg-light text-dark border'}`}>
                          {player.score} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <div className="d-grid gap-2 col-md-6 mx-auto mt-4 pt-2">
            <Button 
              variant="primary" 
              size="lg" 
              className="fw-bold shadow-sm"
              onClick={() => navigate('/playGame')} 
            >
              Play Again
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Leaderboard;