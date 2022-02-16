import React from 'react';
import DatasetBrowser from './dataset-browser';

export type MainState = {
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

    componentDidUpdate(nextProps: MainProps) {
        if (this.props !== nextProps) {
            this.setState({ name: this.props.user });
        }
    }

    render() {
        let name: string = this.props.user;
        let id: string = this.props.id;
        const datasetBrowserProps: MainProps = { id: id, user: name }

        return (
            <div>
                <h1 style={{ color: "white" }}>Vitality Data Registry Manager</h1>
                <DatasetBrowser {...datasetBrowserProps}></DatasetBrowser>
            </div>
            );
    }
}

export default ShowMetaForm;