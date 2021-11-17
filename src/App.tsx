// import logo from './logo.svg';
import { useEffect, useState } from 'react';
import ShowMetaForm from './components/show-meta-form';
import './App.css';
import Button from '@mui/material/Button';
import googleLogin from "./assets/googleImages/btn_google_signin_dark_normal_web.png"
import { signInWithGoogle, signOutGoogle } from './services/firebase';

/**
 * Main application information. Provides Google login button and form updating features as children.
 * 
 * @returns Google login bar at the top, with ShowMetaForm component.
 *
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState<string | null>(localStorage.getItem('userName'));
  const [id, setId] = useState(localStorage.getItem('userId'));

  /// Handle Google login request.
  const responseGoogle = async () => {
    const auth = await signInWithGoogle();
    if (auth) {
      setName(auth.user.displayName);
      setId(auth.user.uid);
      setIsLoggedIn(true);
      localStorage.setItem('userName', auth.user.displayName ? auth.user.displayName : "guest");
      localStorage.setItem('userId', auth.user.uid ? auth.user.uid : '0');
    } 
  }

  const logout = async () => {
    await signOutGoogle();
    setIsLoggedIn(false);
    setName("guest");
    setId("0");
    localStorage.setItem('userName', "guest");
    localStorage.setItem('userId', '0');
  }

  useEffect(() => {

  });

  return (
    <div className="App">
      {isLoggedIn ? (
        <div>
          Signed in as: <a href="#login">{name}</a>
          <Button
          onClick={() => logout()}

            > SignOut
          </Button>
          <ShowMetaForm user={name!} id={id!} />
        </div>    
      ) : (
        <div>
          <Button
            onClick={async () => {await responseGoogle();}}
          >
            <img src={googleLogin} alt="Google Sign-In Button"></img>
          </Button>
        </div>
      )}
      
      </div>

  );
}

export default App;
