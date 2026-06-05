// imports
import express from "express";
import passport from "passport";
import LocalStrategy from 'passport-local';
import session from 'express-session';
import { retrieve_station, check_user_password, retrieve_connections, retrieve_stations, getNetworkGraph, findValidDestinations } from "./db_queries.js";
import cors from "cors";

// init express
const app = new express();
const port = 3001;

app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true
};
app.use(cors(corsOptions))

app.use(session({
  secret: "its a secret!",
  resave: false,
  saveUninitialized: false,
}));

// Set up passport 
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await check_user_password(username, password);
  
  if(!user)
    return cb(null, false, "Incorrect username or password."); 
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: "Not authorized"});
}


app.use(passport.authenticate("session"));

// POST /api/sessions
app.post("/api/sessions", passport.authenticate("local"), function(req, res) {
  return res.status(201).json(req.user);
});

// GET /api/sessions/current
app.get("/api/sessions/current", (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: "Not authenticated"});
});

// DELETE /api/session/current
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// GET /api/stations
app.get("/api/stations", async (req, res) => {
  try {
    const stations = await retrieve_stations();
    
    return res.json(stations);
  } catch (err) {
    return res.status(500).json({ error: err.message || err });
  }
});

// GET /api/connections
app.get("/api/connections", async(req, res) => {
  try{
      const connections = await retrieve_connections()
      return res.json(connections)
  }
  catch (err){
    return res.status(500).json({ error: err.message || err });

  }
})

// GET /api/randomStations
app.get('/api/randomStations', async (req, res) => {
  try {
    const graph = await getNetworkGraph();
    const stations = Object.keys(graph);

    if (stations.length < 4) {
      console.log(stations)
      return res.status(500).json({ error: "Network graph is too small." });
    }

    console.log(graph)
    let startStation = "";
    let validDestinations = [];

   
    while (validDestinations.length === 0) {
      const randomIndex = Math.floor(Math.random() * stations.length);
      startStation = stations[randomIndex];
      
      validDestinations = findValidDestinations(graph, startStation);
    }

    const randomDestIndex = Math.floor(Math.random() * validDestinations.length);
    const destinationStation = validDestinations[randomDestIndex];

    const nameStartStation = await retrieve_station(startStation)
    const nameEndStation = await retrieve_station(destinationStation)

    return res.json({
      nameStartStation,
      nameEndStation,
      startStation,
      destinationStation,
      initialCoins: 20 
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error initiating game." });
  }
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});