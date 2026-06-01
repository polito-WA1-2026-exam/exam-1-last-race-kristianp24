// imports
import express from "express";
import passport from "passport";
import LocalStrategy from 'passport-local';
import session from 'express-session';
import { check_user_password } from "./db_queries.js";
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

app.use(session({
  secret: "its a secret!",
  resave: false,
  saveUninitialized: false,
}));
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



// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});