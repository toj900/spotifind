import { Link } from "react-router-dom";
// import PropTypes from "prop-types";
import React from "react";


const Header = ({handleNotAuthenticated, authenticated}) => {
  const _handleSignInClick = () => {
    // Authenticate using via passport api in the backend
    // Open Twitter login page
    // Upon successful login, a cookie session will be stored in the client
    window.open("http://localhost:3001/auth/spotify", "_self");
  };

  const _handleLogoutClick = () => {
    // Logout using Twitter passport api
    // Set authenticated state to false in the HomePage
    window.open("http://localhost:3001/auth/logout", "_self");
    handleNotAuthenticated();
  };
  return(
    <div>
            <ul className="menu">
        <li>
          <Link to="/">Home</Link>
        </li>
        {authenticated ?  (<li> <Link to="/artists">artists</Link> </li>): ("")}
        {authenticated ?  (<li> <Link to="/tracks">tracks</Link> </li>): ("")}
       
        {authenticated ? (
          <li onClick={_handleLogoutClick}>Logout</li>
        ) : (
          <li onClick={_handleSignInClick}>Login</li>
        )}
      </ul>
    </div>
  )
}
export default Header