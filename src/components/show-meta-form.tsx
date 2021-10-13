import React from 'react';
import DatasetBrowser from './dataset-browser';
import MainProps from '../App';

type MainState = {
    name: string
}

export type MainProps = {
    id: string,
    user: string,
    orgName?: string
}


class ShowMetaForm extends React.Component<MainProps, MainState> {

    constructor(props: MainProps) {
        super(props);
        this.state = { name: this.props.user };
    }

    getUpdatedUserName = () => this.props.user === "Ryan Deschamps" ? "admin_user" : "guest";
    getUpdatedOrgName = () => this.props.user === "Ryan Deschamps" ? "PRIMED" : "guest";

    componentDidUpdate(nextProps: MainProps) {
        if (this.props !== nextProps) {
            this.setState({ name: this.props.user });
        }
    }

    render() {
        let name: string = this.props.user;
        let id: string = this.props.id;
        const datasetBrowserProps: MainProps = { id: id, user: name }
        console.log(id);

        return (
            <div>
                <div style={{
                        backgroundImage: `url('https://d2zmi9say0r1yj.cloudfront.net/OceanImageBank_ThomasHorig_10.jpg')`,
                        backgroundPosition: 'center',
                        height: 200
                    }}>
                    <h1 style={{ color: "white" }}>Vitality Registry Manager for user {name}</h1>
                    </div>
                <DatasetBrowser {...datasetBrowserProps}></DatasetBrowser>
            </div>
            );
    }
}

export default ShowMetaForm;