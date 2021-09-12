const fetch = require('node-fetch');
var cors = require('cors')



const mongoose = require('mongoose');
const userModel = require('./models/users');
const refresh = require('passport-oauth2-refresh');
global.Headers = fetch.Headers;
var express = require('express'),
  session = require('express-session'),
  passport = require('passport'),
  
  SpotifyStrategy = require('passport-spotify').Strategy,
  consolidate = require('consolidate');




require('dotenv').config();
mongoose.connect(
  `mongodb+srv://tjmarsh:${process.env.DB_PASS}@reccomend1.yekh4.mongodb.net/spotify?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
);
var port = 3001;
var authCallbackPath = '/auth/spotify/callback';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing. However, since this example does not
//   have a database of user records, the complete spotify profile is serialized
//   and deserialized.
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

// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, expires_in
//   and spotify profile), and invoke a callback with a user object.
const SpotifyAuth = 
  new SpotifyStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://localhost:' + port + authCallbackPath,
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

// refresh.requestNewAccessToken(
//   'spotify',
//   'some_refresh_token',
//   function (err, accessToken, refreshToken) {
//     console.log(refreshToken)

//   },
// );
var app = express();



// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(
  session({secret: 'keyboard cat', resave: true, saveUninitialized: true})
);
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));

app.engine('html', consolidate.nunjucks);

app.get('/', function (req, res) {
  res.render('index.html', {user: req.user});
});

app.get('/account', ensureAuthenticated, function (req, res) {
  res.render('account.html', {user: req.user});
});

app.get('/login', function (req, res) {
  res.render('login.html', {user: req.user});
});

app.get('/test', (req,res) =>{
  res.redirect('http://google.com')
  // res.send(    [{
  //   "userId": 1,
  //   "id": 1,
  //   "title": "delectus aut autem",
  //   "completed": false
  // }])
})

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
app.get(
  '/auth/spotify',
  passport.authenticate('spotify', {
    scope: ['user-read-email', 'user-read-private', 'user-top-read'],
    showDialog: true,
  })
);

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(
  authCallbackPath,
  passport.authenticate('spotify', {failureRedirect: '/login'}),
  function (req, res) {
    res.redirect('http://localhost:3000');
  }
);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/spotify', ensureAuthenticated, async (req, res) => {
    var user = req.user
    var accessToken = req.user.accessToken
    var limit = '10', market = 'ES', seed_artists = ['5lCekoJW9jNq01B1wiqdAb'] ,seed_tracks = ['6BdICoTty55qOtn4sOwgFk'], seed_genres = ['dubstep', 'edm']
    spotify = await get_reccomend(user, limit,market,seed_artists,seed_genres,seed_tracks,accessToken)

    res.send(await spotify.tracks)

})

app.get('/top', ensureAuthenticated, async (req, res) => {

  var user = req.user
    var limit = 10, type='artists', term='medium_term', accessToken= req.user.accessToken
    top = await get_top(user, limit, type, term, accessToken)
    res.send (await top)
})

app.listen(port, function () {
  console.log(`Example app listening at http://localhost:${port}`);
});
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


async function spotify_request(user, url, requestOptions) {
  try {
    const response = await fetch(url, requestOptions);
    if (response.status === 401) {
      console.log(response.status)
      const refreshed = await refresh_request(user)
      
      //console.log(refreshed.accessToken)
      const response2 = await fetch(url, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${refreshed.accessToken}`
        },
        redirect: 'follow'
      });
      const json2 = await response2.json();
      console.log('sending json')
      return await json2
    }
    if (response.ok) {
      const json = await response.json();
      console.log('sending json')
      return await json
    }

  } catch (error) {
    console.log(error);
    return await error
  }
};

async function get_top (user, limit, type, time_range) {
    myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${user.accessToken}`);

    var url = new URL(`https://api.spotify.com/v1/me/top/${type}`)

    params = { time_range: `${time_range}`, limit: `${limit}`}
    url.search = new URLSearchParams(params).toString();

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    
    top = await (spotify_request(user, url, requestOptions))
    return await (top)
    //res.send(await spotify_request(url, requestOptions))
}

function get_reccomend (user, limit, market, seed_artists, seed_genres, seed_tracks) {
    
    myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${user.accessToken}`);

    var url = new URL('https://api.spotify.com/v1/recommendations')

    // seed_genres=["dubstep","edm","electro_house","electronic_trap","future_bass","gaming_edm"]

    params = { limit: `${limit}`, market: `${market}`, seed_artists: [`${seed_artists}`], seed_genres: `${seed_genres}`, seed_tracks: [`${seed_tracks}`] }
    url.search = new URLSearchParams(params).toString();

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    reccomend = spotify_request(user, url, requestOptions)
    return reccomend
}

const refresh_request = (user) => {
  return new Promise ((resolve, reject) => {
    refresh.requestNewAccessToken('spotify', user.refreshToken, (err, accessToken, refreshToken) =>{
      userModel.findOneAndUpdate({ profile: user.profile }, { $set: { 'accessToken': accessToken } }, { new: true }, (err, doc) => {
        if (err) {
          console.log("Something wrong when updating data!");
          return reject(error)
        }
        console.log(`Refreshing Access for: ${doc.profile}`);
        return resolve(doc)
      });
    })
  })

}