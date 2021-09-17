import React, {useContext} from 'react';
import {Navbar, Container} from 'react-bootstrap';
import NavbarCollapse from 'react-bootstrap/esm/NavbarCollapse';
import {auth } from '../services/firebase';
import {UserContext} from '../providers/UserProvider';
import { GoogleLogout, GoogleLogin } from 'react-google-login';




class Navigation extends React.Component {
    static contextType = UserContext;

    constructor(props) {
        super(props);
        //console.log(props);
        
        this.state = {isLoggedIn: false, userInfo: {
            id: "0", name: "guest", email: ""}
        //console.log(this.props);
        //console.log(this.state.userid);
    }}

    responseGoogleSuccess = (response) => {
        let userInfo = {
            name: response.profileObj.name,
            email: response.profileObj.email
        }
        this.setState({userInfo, isLoggedIn: true});
    }

    responseGoogleError = (response) => {
        console.log(response);
    }

    logout = (response) => {
        console.log(response);
        let userInfo = {
            name: "",
            email: ""
        }
        this.setState({userInfo, isLoggedIn: false});
    }

    render() {
        let clientId = "24606448718-ao49uhubcpnlhs9au1hm5fdppuaria03.apps.googleusercontent.com";
        return (
            <Navbar>
                <Container>
                    <Navbar.Brand href="#home">Navbar</Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                            {this.isLoggedIn ? (
                                <div>
                                    Signed in as: <a href="#login">{this.state.userInfo.name}</a>
                                    
                                <GoogleLogout
                                clientId={clientId}
                                buttonText="Logout"
                                onLogoutSuccess={this.logout}>
                                </GoogleLogout></div>
                            ) : (
                                <GoogleLogin
                                clientId={clientId}
                                buttonText="Login with Google"
                                onSuccess={this.responseGoogleSuccess}
                                onFailure={this.responseGoogleError}
                                cookiePolicy={'single_host_origin'}></GoogleLogin>
                            )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        )
    }
}

export default Navigation