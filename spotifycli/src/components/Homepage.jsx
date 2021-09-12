import Header from "./Header";
// import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
// import SpotifyArtists from "./SpotifyArtists";
// import SpotifyTracks from "./SpotifyTracks";
import Example from './Examples/Exam';
const HomePage = () => {
  const [user, setUser] = useState('hello')
  const [authenticated, setAuthenticated] = useState(false)
  const [error, setError] = useState({ error: null })
  useEffect(() => {
    const fetchData = async () => {
      fetch("http://localhost:3001/auth", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true
        }
      })
        .then(response => {
          if (response.status === 200) return response.json();
          throw new Error("failed to authenticate user");
        })
        .then(responseJson => {
          setAuthenticated(true)
          setUser(responseJson.user)
          console.log(responseJson.user)
        })
        .catch(error => {
          setAuthenticated(false);
          setError("Failed to authenticate user");
        });
    }
    fetchData();
  }, [])
  const _handleNotAuthenticated = () => {
    setAuthenticated(false);
  }
 
  return (
    <div>
      <Header
        authenticated={authenticated}
        handleNotAuthenticated={_handleNotAuthenticated}
      />
      <div>
        {!authenticated ? (
          null
        ) : (
          <div>
            {/* <h1>Login success, welcome {user}!</h1> */}
            {/* <SpotifyArtists/> */}
            {/* <SpotifyTracks/> */}
            <Example/>
          </div>
        )}
      </div>
    </div>
  );
}
export default HomePage