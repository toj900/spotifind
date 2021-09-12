const router = require("express").Router();
const passport = require("passport");
const CLIENT_HOME_PAGE_URL = "http://localhost:3000/";


router.get("/login/success", (req, res) => {
    console.log("login success")
    if (req.user) {
      res.json({
        success: true,
        message: "user has successfully authenticated",
        user: req.user,
        cookies: req.cookies
      });
    }
  });

  router.get("/login/failed", (req, res) => {
    console.log("calling login success")
    res.status(401).json({
      success: false,
      message: "user failed to authenticate."
    });
  });

  router.get("/logout", (req, res) => {
    req.logout();
    res.redirect(CLIENT_HOME_PAGE_URL);
  });
 // router.get("/spotify", passport.authenticate("spotify"));

  router.get(
    '/spotify',
    passport.authenticate('spotify', {
      scope: ['user-read-email', 'user-read-private', 'user-top-read'],
      showDialog: true,
    })
  );
  
  router.get(
    "/spotify/callback",
    passport.authenticate('spotify', {failureRedirect: '/auth/login/failed'}),
     (req, res) =>{
         res.redirect('http://localhost:3000');
    }
  );

  // router.get(
  //   "/spotify/callback",
  //   passport.authenticate("spotify", {
  //     successRedirect: CLIENT_HOME_PAGE_URL,
  //     failureRedirect: "/auth/login/failed"
  //   })
  // );
  
  module.exports = router;