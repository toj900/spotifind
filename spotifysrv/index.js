const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const port = 3001;
const passport = require("passport");
const passportSetup = require("./config/passport-setup");
const session = require("express-session");
const authRoutes = require("./routes/auth-routes");
const spotifyRoutes = require("./routes/spotify-routes");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // parse cookie header

//connect to mongodb
// mongoose.connect(keys.MONGODB_URI,keys.MONGODB_OPTIONS, () => {
//   console.log("connected to mongo db");
// });
require('dotenv').config();
mongoose.connect(
  `mongodb+srv://tjmarsh:${process.env.DB_PASS}@reccomend1.yekh4.mongodb.net/spotify?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }

);
app.use(
  cookieSession({
    name: "session",
    keys: [keys.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100
  })
);
//parse cookies
app.use(cookieParser());

// initalize passport
app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());

// set up cors to allow us to accept requests from our client
app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
  })
);

// set up routes
app.use("/auth", authRoutes);
app.use("/spotify", spotifyRoutes);

const authCheck = (req, res, next) => {
  console.log("calling authCheck function")
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated"
    });
  } else {
    next();
  }
};

app.get("/auth", authCheck, (req, res) => {
  console.log("calling root path")
  res.status(200).send({
    authenticated: true,
    message: "user successfully authenticated",
    user: req.user.profile,
    cookies: req.cookies
  });
});


// connect react to nodejs express server
// app.listen(port, () => console.log(`Server is running on port ${port}!`));
app.listen(port, function () {
  console.log(`Example app listening at http://localhost:${port}`);
});


