// import logo from './logo.svg';
import { useEffect, useState } from 'react';
import ShowMetaForm from './components/show-meta-form';
import './App.css';
import Button from '@mui/material/Button';
import googleLogin from "./assets/googleImages/btn_google_signin_dark_normal_web.png"
import { signInWithGoogle, signOutGoogle } from './services/firebase';
import { NavLink } from 'react-router-dom';
import About from './components/about';
import Request from './components/request';
import Spacer from './components/spacer';

/**
 * Main application information. Provides Google login button and form updating features as children.
 * 
 * @returns Google login bar at the top, with ShowMetaForm component.
 *
 */
function App(props: { body: String; }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState<string | null>(localStorage.getItem('userName'));
  const [id, setId] = useState(localStorage.getItem('userId'));
  const body = (props.body === "home" ? <ShowMetaForm user={name!} id={id!} /> :
    (props.body === "about") ? <About /> : <Request />);


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

  const navigation = () => {
    let activeStyle = { textDecoration: "underline" } as const;
    return (<nav><NavLink to="/" style={({ isActive }) => isActive ? activeStyle : {}}>Home</NavLink>
      <NavLink to="/about" style={({ isActive }) => isActive ? activeStyle : {}}>About</NavLink>
      <NavLink to="/request" style={({ isActive }) => isActive ? activeStyle : {}}>Request Access to Vitality</NavLink>
    </nav>);
  }

  const vitalityLogo = () => {
    return (<figure>
      <img
        alt="Vitality Logo"
        src="https://i0.wp.com/vitality.piscesrpm.com/wp-content/uploads/2020/11/Light_NoTag.png?resize=306%2C50&ssl=1" />
      <figcaption>Vitality Project Data Registry</figcaption>
    </figure>);
  }

  const homeText = () => {
    return (
      <>
      <h2>Welcome to the Vitality Project Data Registry.</h2>
      <p>If you have membership to Vitality, please login with your 
        Vitality-approved Google account. If you do not have a Vitality membership,
        you can learn more about the project via the About link and request access
        via the contact form.
      </p></>
    );
  }

  return (
    <article>
      {isLoggedIn ? (
        <><header>
          <Spacer />
          <div className="subheader">
            {vitalityLogo()}
            <Button
              onClick={() => logout()}

            > SignOut
            </Button>
          </div>

          <div>
            {navigation()}
            <div className="sign-in-name"> Signed in as: <a href="#login">{name}</a></div>


          </div>
        </header>
          <main>{body}</main></>
      ) : (
        <>
          <header>
            <Spacer />
            <div className="subheader">
              {vitalityLogo()}
              <Button
                onClick={async () => { await responseGoogle(); }}>
                <img src={googleLogin} alt="Google Sign-In Button"></img>
              </Button>
            </div>
            <div>
              {navigation()}
            </div>
          </header>
          <main>
            {props.body !== "home" ? body : homeText()}
          </main></>
      )}


      <footer>

      </footer>
    </article>
  );
}

export default App;
