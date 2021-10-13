import * as React from 'react';
import * as configData from '../config.json';
import { MainProps } from './show-meta-form';
import { Dataset, DataState, OrgDataset, Template } from '../state/datastate';
import Button from '@mui/material/Button';
import DatabaseService from '../services/database';
import Role from '../state/role';
import { Box, Chip, Container, Grid } from '@mui/material';

/**
 * React component to show datasets available in the registry, and the access permissions
 * based on templates and user roles.
 */
class DatasetBrowser extends React.Component<MainProps, DataState>  {

    _db: DatabaseService = new DatabaseService("neo4j");

    constructor(props: MainProps) {
        super(props);

        this.state = {
            templates: [],
            datasets: [],
            orgName: this.props.orgName,
            userName: this.props.user,
            userId: this.props.id,
            elements: [], roles: []
        };
    }

    componentDidUpdate(nextProps: MainProps) {
        if (this.props !== nextProps) {

            this.setState({ orgName: this.props.orgName, userName: this.props.user });
            this.getDatasets();
            //this.setData(this.state.datasets[0])
            // this.setState({dataName: this.state.datasets[0]});
        }
    }

    /**
     * 
     * @param {string} name - the name of the dataset
     * @returns bool
     */
    isActiveDataset(name: string) {
        return this.state.dataName!.name === name ? "active" : "";
    }


    setData(dataset: Dataset) {
        this.setState((state) => ({ dataName: dataset }));
        this.getTemplates();
    }

    getDatasets() {
        this._db.getUserId(this.props.id).then((user) => {
            let userid = user ? user.id : '0';
            let username = user ? user.name : 'guest';
            this._db.getDatasets(userid).then((data: OrgDataset[]) => {
                this.setState((state) => ({ datasets: data, userName: username }))
            });
        })
    }

    getTemplates() {
        this.getRoles();
        if (typeof this.state.dataName !== 'undefined') {
            this._db.getTemplates(this.state.dataName).then((res: Template[]) => {
                this.setState((state) => ({ templates: res}))
            })
        }
    }

    getRoles() {
        if (typeof this.state.dataName !== 'undefined') {
            this._db.getRoles(this.state.dataName).then((res: Role[]) => {
                console.log(res);
                this.setState((state) => ({ roles: res}))
            })
        }
    }

    componentDidMount() {
        this.getDatasets();

    }

    componentWillUnmount() {

    }

    

    /**
     * TODO Rename this to reflect that it returns a button. 
     * 
     */
    getDatasetList() {
        let ret = this.state.datasets.map((org) => {
            // highlight button if it is the current one.   
            let datasets: JSX.Element[] = org.datasets.map((dataset) => {
                let active: Boolean = typeof this.state.dataName !== 'undefined' && dataset.id === this.state.dataName.id;
                return <Box mx="auto">
                    <Button variant={active ? "outlined" : "contained"}
                    onClick={() => this.setData(dataset)}
                    key={dataset.id + "select"}>{dataset.name}</Button>
                    </Box>
            });
            return (<Container><Chip label={"Organization" + org.name} key={org.id} />{datasets}</Container>);
        });
        return (<Grid item direction="column" xs={3} style={{
            display: "flex",
            justifyContent: "flex-start"
        }}>{ret}</Grid>)
    }

    handleSubmit() {

    }


    render() {
        let defined = typeof this.state.dataName !== 'undefined';
        let datasetDesc = defined ? this.state.dataName!.description : "Please choose a dataset to see options.";
        let datasetName = defined ? this.state.dataName!.name : "";
        let templateList = this.state.templates!.map((template, ind) => <th key={template.id}>{template.name}</th>);
        let roles = this.state.roles!
          .filter((valid) => this.state.templates!
            .map((temp) => temp.name)
            .includes(valid.uses)) 
          .map((role, ind) => {
            let cols = this.state.templates!.map((temp) => {
                // is item set using template?
              let checked = role.uses === temp.name;
                // if item is admin, disable any template except "full"
              let disabled = (role.role === "admin" && temp.name !== "full");  
              return <td key={role.role + temp.id}><input key={role.role + temp.id} name={role.role + "radio"} type="radio" disabled={disabled} defaultChecked={checked}></input></td>})
          return <tr key={role.role + ind + "row"} className={"btn-group-" + role.role} role="group">
            <th key={role.role + ind + "head"} scope="row">{role.role}</th>
            {cols}
        </tr> });   

        let userName = this.state.userName;
        return (
            <Container>
                <h1>{userName}</h1>
                <Grid container spacing={2}>
                    {this.getDatasetList()}

                    <Grid xs={6} direction="column">
                        <h2> Dataset pane for {datasetName}</h2>
                        <div className="row">{datasetDesc}.</div>
                        <form onSubmit={this.handleSubmit}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th key="role-header" scope="col">Role</th>
                                        {userName === "guest" ? [] : templateList}

                                    </tr>
                                </thead>

                                <tbody>{userName == "guest" ? [] : roles}</tbody>
                            </table>
                        </form>
                    </Grid>
                </Grid>
            </Container>);

    }
}
export default DatasetBrowser;


