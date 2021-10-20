import * as React from 'react';
import { MainProps } from './show-meta-form';
import { Dataset, DataState, OrgDataset, Template } from '../state/datastate';
import Button from '@mui/material/Button';
import DatabaseService from '../services/database';
import { RoleTemp } from '../state/role';
import { Box, Chip, Container, Grid } from '@mui/material';
import {Table, TableCell, TableHead, TableRow, TableContainer} from '@mui/material';
import {Paper} from '@mui/material';
/**
 * React component to show datasets available in the registry, and the access permissions
 * based on templates and user roles.
 */
class DatasetBrowser extends React.Component<MainProps, DataState>  {

    _db: DatabaseService = new DatabaseService("neo4j");

    constructor(props: MainProps) {
        super(props);

        this.state = {
            showconfirm: false,
            templates: [],
            datasets: [],
            orgName: this.props.orgName,
            userName: this.props.user,
            userId: this.props.id,
            dataInd: "",
            elements: [], 
            roles: []
            
        } as DataState;
    }

    componentDidUpdate(nextProps: MainProps) {
        if (this.props !== nextProps) {
            console.log("updated");
            this.setState({ orgName: this.props.orgName, userName: this.props.user });
            this.getDatasets();
            
        }}


    getDatasetByIndex(index: string) {
        let alldatasets: Dataset = this.state.datasets
          .map((org) => {return org.datasets})
           .reduce((a, v) => a.concat(v), [])
           .filter((dataset) => dataset.id === index)[0]
        return alldatasets;
    }


    setData(ind: string) {
        this.setState((state) => ({ dataInd: ind }), () => this.getTemplates());     
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
        if (this.state.dataInd !== "") {
            this.getRoles();
            let dataset = this.getDatasetByIndex(this.state.dataInd);
            this._db.getTemplates(dataset).then((res: Template[]) => {
                this.setState((state) => ({ templates: res}))
            })
        }
    }

    getRoles() {
        if (this.state.dataInd !== '') {
            console.log(this.state.dataInd);
            let dataset = this.getDatasetByIndex(this.state.dataInd);
            console.log(dataset);
            this._db.getRoles(dataset).then((res: RoleTemp[]) => {
                this.setState((state) => ({ roles: res}));
            })
        }
    }

    componentDidMount() {
        this.getDatasets();
        this.getTemplates();
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
                let active: Boolean = this.state.dataInd !== "" && dataset.id === this.state.dataInd;
                return <Box mx="auto">
                    <Button variant={active ? "outlined" : "contained"}
                    onClick={() => this.setData(dataset.id.toString())}
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

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const answer = window.confirm("Are you sure you want to update the templates?");
        if (answer) {
            console.log("update template");
            console.log(event);
        } else {
            console.log("do not update template");
        }
         
    }


    render() {
        let defined = this.state.dataInd !== '';
        let dataset = this.getDatasetByIndex(this.state.dataInd);
        let datasetDesc = defined ? dataset.description : "Please choose a dataset to see options.";
        let datasetName = defined ? dataset.name : "";
        let templateList = this.state.templates!.map((template, ind) => <TableCell component="th" key={template.id}>{template.name}</TableCell>);
        let roles = this.state.roles!
          .filter((valid) => this.state.templates!
            .map((temp) => temp.name)
            .includes(valid.uses.name)) 
          .map((roletemp, ind) => {
            let cols = this.state.templates!.map((temp) => {
                // is item set using template?
              let checked = roletemp.uses.name === temp.name;
                // if item is admin, disable any template except "full"
              let disabled = (roletemp.role.name === "admin" && temp.name !== "full");  
              return <TableCell component="td" key={roletemp.role.id + temp.id}>
                  <input key={roletemp.role.id + temp.id} 
                         name={roletemp.role.id + "radio"} 
                         type="radio" disabled={disabled} 
                         defaultChecked={checked}>
                  </input>
                  </TableCell>})
          return <TableRow key={roletemp.role.id + ind + "row"} className={"btn-group-" + roletemp.role.id} role="group">
            <TableCell component="th" key={roletemp.role.id + ind + "head"} scope="row">{roletemp.role.name}</TableCell>
            {cols}</TableRow> });   

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
                            <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650}}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell component="th" key="role-header" scope="col">Role</TableCell>
                                        {userName === "guest" ? [] : templateList}
                                    </TableRow>
                                </TableHead>
                                <tbody>{userName === "guest" ? [] : roles}</tbody>
                            </Table>
                            </TableContainer>
                            <Button type="submit" variant="contained">Update Templates</Button>
                        </form>
                    </Grid>
                </Grid>
            </Container>);

    }
}
export default DatasetBrowser;


