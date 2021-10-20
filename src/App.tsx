// import logo from './logo.svg';
import { useEffect, useState } from 'react';
import ShowMetaForm from './components/show-meta-form';
import './App.css';
import configData from './config.json';
import { GoogleLogin, GoogleLogout } from 'react-google-login';

/**
 * Main application information. Provides Google login button and form updating features as children.
 * 
 * @returns Google login bar at the top, with ShowMetaForm component.
 *
 */
function App() {
  const clientId: string = configData.FIREBASE.clientId;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("guest");
  const [id, setId] = useState("0");

  /// Handle Google login request.
  const responseGoogle = (response: any) => {
    setName(response.profileObj.name);
    setId(response.profileObj.googleId);
    setIsLoggedIn(true);
  }

  /// Handle an error in the Google response.
  const responseFail = (response: any) => {
    setIsLoggedIn(false);
  }

  const logout = () => {
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
            >
          </GoogleLogout>
          <ShowMetaForm user={name} id={id} />
        </div>    
      ) : (
        <div>
          <GoogleLogin
            clientId={clientId}
            isSignedIn={true}
            buttonText="Login with Google"
            onSuccess={responseGoogle}
            onFailure={responseFail}
            cookiePolicy={'single_host_origin'}>
          </GoogleLogin>
        </div>
      )}
      
      </div>

  );
}

export default App;
