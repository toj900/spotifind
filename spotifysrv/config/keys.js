require('dotenv').config();

const SPOTIFY_TOKENS = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
  };
  
  const DB_USER = process.env.USER_ID;
  const DB_PASS = process.env.DB_PASS;
  const MONGODB = {
    MONGODB_URI:`mongodb+srv://${DB_USER}:${DB_PASS}@reccomend1.yekh4.mongodb.net/spotify?retryWrites=true&w=majority`,
    MONGODB_OPTIONS:   
    {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    }
  };
  
  const SESSION = {
    COOKIE_KEY: "thisappisawesome"
  };
  
  const KEYS = {
    ...SPOTIFY_TOKENS,
    ...MONGODB,
    ...SESSION
  };
  
  module.exports = KEYS;