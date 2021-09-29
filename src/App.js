// import logo from './logo.svg';
import React, {useEffect, useState} from 'react';
import ShowMetaForm from './components/show-meta-form';
import './App.css';
import configData from './config.json';
import { GoogleLogout, GoogleLogin } from 'react-google-login';



/**
 * Main application information. Provides Google login button and form updating features as children.
 * 
 * @returns Google login bar at the top, with ShowMetaForm component.
 *
 */
function App() {
  const clientId = configData.FIREBASE.clientId;
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [name, setName] = useState("guest");
  const [id, setId] = useState("0");

  /// Handle Google login request.
  const responseGoogle = response => {
    setIsLoggedIn(true);
    setName(response.profileObj.name);
  }

  /// Handle an error in the Google response.
  const responseFail = response => {
    console.log(response);
    setIsLoggedIn(false);
  }

  const logout = response => {
    setIsLoggedIn(false);
    setName("guest");
    setId("0");
  }

  useEffect(() => {

  });

  return (
      <div className="App">
        {isLoggedIn ? (
                              <div>
                                    Signed in as: <a href="#login">{name}</a>
                                    
                                <GoogleLogout
                                clientId={clientId}
                                buttonText="Logout"
                                onLogoutSuccess={logout}
                                  isSignedIn={isLoggedIn}>
                                </GoogleLogout></div>
                            ) : (
                                <div><GoogleLogin
                                clientId={clientId}
                                buttonText="Login with Google"
                                onSuccess={responseGoogle}
                                onFailure={responseFail}
                                cookiePolicy={'single_host_origin'}></GoogleLogin></div>
                            )}
                    
           <ShowMetaForm user={name} />
        </div>
    
  );
}

export default App;
