import React from 'react';
import { useState, useEffect } from 'react';
import { fetchStations } from '../apis/fetches.js';
import Alert from 'react-bootstrap/Alert';


const staticlinePaths = [
  { id: 'm5', color: '#9b59b6', d: 'M 313,60 L 100,130 L 200,200 L 200,270' },
  { id: 'm2', color: '#2ecc71', d: 'M 500,270 L 200,270 L 395,370 L 200,440' },
  { id: 'm3', color: '#f1c40f', d: 'M 640, 60 L 400,130 L 500,270 L 600,340 L 500,410 M 200,200 L500,270' },
  { id: 'm4', color: '#0066ff', d: 'M 200,200 L 640,200 L 640,410 L 500,410 L 500,480 L 320,550' }
];

function NetworkMap(props) {
  const [stations, setStations] = useState([]);
  const [linePaths, setLinePaths] = useState([]);
  const [alert, setAlert] = useState(false)

  const showLines = props && props.lines !== undefined ? props.lines : true;

  useEffect(() => {
    const loadMapData = async () => {
      const data = await fetchStations();

      if (data && Object.keys(data).length > 0) {
        setStations(data);
      }
      else {
        console.error("Failed to load stations data.");
      }
    };

    loadMapData();
    setLinePaths(staticlinePaths)
  }, []);

  if (alert) {
    return (
      <div className="text-center mb-4">

        <Alert key='danger' variant="danger" className="py-2 small">
          An error occured loading the map!
        </Alert>
      </div>
    )
  }

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>Metro Network Map</h2>

      <svg viewBox="0 0 800 620" style={styles.svg}>
        <g id="metro-lines">
          {showLines && linePaths.map((line) => (
            <path
              key={line.id}
              d={line.d}
              stroke={line.color}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>

        <g id="stations">
          {Object.values(stations || {}).map((station, index) => {
            const isLeftColumn = station.align === 'end';
            const textX = isLeftColumn ? station.cx - 15 : station.cx + 15;
            const textAnchor = isLeftColumn ? 'end' : 'start';

            return (
              <g key={station.id || station.name || index}>
                <circle
                  cx={station.cx}
                  cy={station.cy}
                  r="5"
                  fill="#ffffff"
                  stroke="#111111"
                  strokeWidth="2"
                />
                <text
                  x={textX}
                  y={station.cy + 4}
                  textAnchor={textAnchor}
                  style={styles.label}
                >
                  {station.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '900px',
    margin: '20px auto',
    backgroundColor: ' #0066ff ',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    fontFamily: 'monospace, Courier New, monospace',
  },
  title: {
    textAlign: 'center',
    margin: '0 0 20px 0',
    color: '#f8f0f0',
    fontWeight: '400',
    letterSpacing: '0.5px',
  },
  svg: {
    width: '100%',
    height: 'auto',
    backgroundColor: '#e0d7d7',
    borderRadius: '8px',
    border: '1px solid #ecc9c9',
  },
  label: {
    fontSize: '13px',
    fill: '#0c0707',
    userSelect: 'none',
    pointerEvents: 'none',
  }
};

export default NetworkMap;