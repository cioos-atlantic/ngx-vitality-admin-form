import React from 'react';
import DatasetBrowser from './dataset-browser';

class ShowMetaForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {name: this.props.user};
    }

    getUpdatedUserName = () => this.props.user === "Ryan Deschamps" ? "admin_user" : "guest";
    getUpdatedOrgName = () => this.props.user === "Ryan Deschamps" ? "PRIMED" : "guest";

    componentDidUpdate(nextProps) {
        if (this.props !== nextProps) {
            this.setState({name: this.props.user});
        }
    }

    render() {
        let user = this.state.name === "Ryan Deschamps" ? "admin_user" : "guest";
        let org = this.state.name === "Ryan Deschamps" ? "PRIMED" : "guest";

        return (
        
            <div className="container">
                <div className="row" 
    style={{backgroundImage: `url('https://d2zmi9say0r1yj.cloudfront.net/OceanImageBank_ThomasHorig_10.jpg')`, 
    backgroundPosition: 'center',
    height: 200}}>
                <h1 style={{color: "white"}}>Vitality Registry Manager for user {this.getUpdatedUserName}</h1></div>
                <DatasetBrowser orgName={org} userName={user}></DatasetBrowser>
            </div>
        )}
    }

export default ShowMetaForm;