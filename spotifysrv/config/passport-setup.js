const passport = require("passport");
const refresh = require('passport-oauth2-refresh');
const SpotifyStrategy = require('passport-spotify').Strategy
const keys = require("./keys");
const userModel = require('../models/users');
var authCallbackPath = '/auth/spotify/callback';

passport.serializeUser(function (user, done) {
  'Seralizing user'
  done(null, user.profile);
});

passport.deserializeUser(function (profile, done) {
  userModel.findOne({"profile": profile}, function(err, client){
    console.log(`Deseralizing: ${profile}`)
    done(err, client);
  })

});

const SpotifyAuth = 
  new SpotifyStrategy(
    {
      clientID: keys.CLIENT_ID,
      clientSecret: keys.CLIENT_SECRET,
      callbackURL: authCallbackPath,
    },
    function (accessToken, refreshToken, expires_in, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(async function () {
        // To keep the example simple, the user's spotify profile is returned to
        // represent the logged-in user. In a typical application, you would want
        // to associate the spotify account with a user record in your database,
        // and return that user instead.
        userModel.findOne(({"profile": profile.id}, async function(err, client){
          if (err) {
            console.log(`Error finding ${profile.id}`)
            {return done(err)}
          }
          if (!client){
            console.log(`No user Found matching ${profile.id}`)
            const user = new userModel({
              "profile": profile.id,
              "accessToken": accessToken,
              "refreshToken": refreshToken,
              "expires_in": expires_in
            })
            await user.save()
            //console.log( await user)
            {return done(null,  (user))}
            
          }
          console.log(`Found ${profile.id}`)
          {return done(null,  (client))}
        }))
      });
    }
)
passport.use(SpotifyAuth)
refresh.use(SpotifyAuth);