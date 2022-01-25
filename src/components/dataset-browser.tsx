import * as React from 'react';
import { MainProps } from './show-meta-form';
import { Dataset, DataState, OrgDataset, RoleDatasetTemp, Template } from '../state/datastate';
import Button from '@mui/material/Button';
import DatabaseService from '../services/database';
import Role, { RoleTemp } from '../state/role';
import { Box, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from '@mui/material';
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
            currDatasetRole: [],
            showconfirm: false,
            templates: [],
            datasets: [],
            orgName: this.props.orgName,
            userName: this.props.user,
            userId: this.props.id,
            dataInd: "",
            elements: [], 
            roles: [],
            open: false
            
        } as DataState;
    }

    componentDidUpdate(nextProps: MainProps) {
        if (this.props !== nextProps) {
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

    handleClickOpen = () => {
        this.setState({open: true});
    }

    handleClickClose = () => {
        this.setState({open: false});
    }


    setData(ind: string) {
        this.setState((state) => ({ dataInd: ind }), () => this.getTemplates())    
    }

    getDatasets() {
        this._db.getUserIdFromApi(this.props.id).then((user) => {
            let userid = user ? user.id : '0';
            let username = user ? user.name : 'guest';
            this._db.getDatasetsFromApi(userid).then((data: OrgDataset[]) => {
                this.setState((state) => ({ datasets: data, userName: username }))
            });
        })
    }

    getTemplates() {
        if (this.state.dataInd !== "") {
            this.getRoles();
            let dataset = this.getDatasetByIndex(this.state.dataInd);
            this._db.getTemplatesFromApi(dataset).then((res: Template[]) => {
                this.setState((state) => ({ templates: res}))
            })
        }
    }

    getRoles() {
        if (this.state.dataInd !== '') {
            let dataset: Dataset = this.getDatasetByIndex(this.state.dataInd);
            this._db.getRolesFromApi(dataset).then((res: RoleTemp[]) => {
                let dataRoles = res.map((roletemp: RoleTemp) => {
                        return {
                            currRole: roletemp,
                            currTemp: roletemp.uses,
                            currDataset: dataset 
                        } as RoleDatasetTemp
                    });
                
                this.setState((state) => ({ roles: res, currDatasetRole: dataRoles }));
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
            return (<Container><Chip label={org.name} key={org.id} />{datasets}</Container>);
        });
        return (<Grid item direction="column" xs={3} style={{
            display: "flex",
            justifyContent: "flex-start"
        }}>{ret}</Grid>)
    }

    handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 
        let state = this.state.currDatasetRole;
        state!.forEach((val, ind) => {
            this._db.updateTemplateByApi(val);
            this.state.currDatasetRole![ind] = {
                currDataset: this.getDatasetByIndex(this.state.dataInd),
                currRole: {role: val.currRole.role, uses: val.currTemp} as RoleTemp,
                currTemp: val.currTemp
            } as RoleDatasetTemp
        });
                  
    }

    updateRoles(role: Role, uses: Template) {
        let ds = this.getDatasetByIndex(this.state.dataInd);
        let datasetRole: RoleDatasetTemp[] = this.state.currDatasetRole!;
        datasetRole!.forEach((item, index) => {
            if (item!.currRole.role.id === role.id) {
                datasetRole![index] = {
                   currDataset: ds,
                   currRole: item.currRole,
                   currTemp: uses 
                } as RoleDatasetTemp
            }
        })
        this.setState((state) => ({currDatasetRole: datasetRole}));
 
    }

    getDatasetDescription(dataset: Dataset) {
        if (this.state.dataInd !== '' && typeof dataset !== 'undefined') {
            return dataset.description_en.length < 255 ? dataset.description_en : dataset.description_en.substring(0, 255);
        } else {
            return "Please choose a dataset to see options";
        }
    }


    render() {
        let defined = this.state.dataInd !== '';
        let dataset = this.getDatasetByIndex(this.state.dataInd);
        let datasetDesc = this.getDatasetDescription(dataset);
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
                         name={roletemp.role.name} 
                         value={roletemp.uses.name}
                         type="radio" disabled={disabled}
                         onChange={(e) => this.updateRoles(roletemp.role, temp)}
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
                <Grid container>
                    {this.getDatasetList()}

                    <Grid xs={8} direction="column">
                        <h2> Dataset pane for {datasetName}</h2>
                        <div className="row">{datasetDesc}...</div>
                        <form onSubmit={this.handleSubmit} name="template" id="template">
                            <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell component="th" key="role-header" scope="col">Role</TableCell>
                                        {userName === "guest" ? [] : templateList}
                                    </TableRow>
                                </TableHead>
                                <tbody>{userName === "guest" ? [] : roles}</tbody>
                            </Table>
                            </TableContainer>
                            <Button onClick={this.handleClickOpen} variant="contained">Update Templates</Button>
                            </form>
                            <Dialog open={this.state.open} onClose={this.handleClickClose}>
                                <DialogTitle id="alert-dialog-title">
                                    {"Change Metadata Access Permissions"}
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        By clicking Agree, you agree to the terms...
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button variant="outlined" onClick={this.handleClickClose}>Disagree</Button>
                                    <Button type="submit" form="template" onClick={this.handleClickClose}>Agree</Button>
                                </DialogActions>
                            </Dialog>
                    </Grid>
                </Grid>
            </Container>);

    }
}
export default DatasetBrowser;


