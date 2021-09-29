import React from 'react';
import configData from '../config.json';
import * as ReactBootstrap from 'react-bootstrap';

const uri = configData.NEO4J_URL;
const user = configData.NEO4J_NAME;
const password = configData.NEO4J_PASSWORD;
const db = configData.NEO4J_DATABASE;
const neo4j = require('neo4j-driver');
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {});

/**
 * Data class to describe a user role.
 */
class Role {
    constructor(role, uses ){
        this.role = role;
        this.uses = uses;
    }
}

/**
 * React component to show datasets available in the registry, and the access permissions
 * based on templates and user roles.
 */
class DatasetBrowser extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {templates: [], datasets: [], orgName: this.props.orgName, userName: this.props.userName, dataName: "NEGL North West River Labrador NLQU0007", elements: [], roles: []};
    }

    componentDidUpdate(nextProps) {
        if (this.props !== nextProps) {
            this.setState({orgName: this.props.orgName, userName: this.props.userName});
            //this.getDatasets();
            //this.setData(this.state.datasets[0])
            // this.setState({dataName: this.state.datasets[0]});
        }    
    }

    /**
     * 
     * @param {string} name - the name of the dataset
     * @returns bool
     */
    isActiveDataset(name) {
        return this.state.dataName === name ? "active" : "";
    }


    setData(name) {
        this.setState((state) => ({dataName: name}));
        this.getDatasets();
    }

    roleSort(item1, item2) { 
        if (item1.role === 'admin') {
            return -1;
        }
        if (item2.role === 'admin') {
            return 1;
        }
        if (item1.role === 'public') {
            return (item2.role === 'admin') ? 1 : -1;
        }
        if (item2.role === 'public') {
            return (item1.role === 'admin' ? -1 : 1);
        }
        if (item1.role > item2.role) {
            return -1;
        }
        if (item2.name.role > item1.role) {
            return 1;
        }
        return 0;
    }

    getDatasets() {
        const session = driver.session();
        const params = {"orgName": this.state.orgName};
        const updateTemplate = `match (role:role {name: $roleName})-[rel:uses_template]->() delete rel; 
        match (r:role {name: $roleName}), (t:template {name: $templateName}) create (r)-[:uses_template]-(t)`;
        const queryTemplates = 'match (d:dataset {name: $dataName})-[:has_template]->(t:template) return t';
        const queryElements = 'match (n:element) return n';
        const queryRoles = 'match (n:role)-[x:uses_template]->(t:template)<-[:has_template]-(d:dataset {name: $dataName}) return n, t';
        const queryDatasets = 'match (o:organization {name: $orgName})-[:owns]->(n:dataset) return n';
        session.run(queryDatasets, params)
        .then((result) => {
            let newstate = result.records.map((record) => {
                return record.get("n").properties.name;
            }).sort();
            this.setState((state) => ({datasets: newstate}))
            if (this.state.dataName === "") this.setState((state) => ({dataName: newstate[0]}))
            const param = {"dataName": this.state.dataName};
            return session.run(queryTemplates, param)
        }).then((result) => {
            let newstate = result.records.map((record) => {
                return record.get("t").properties.name;
            }).sort();
            this.setState((state) => ({templates: newstate}));
            return session.run(queryRoles, {"dataName":this.state.dataName})
        }).then((result) =>{
            let newstate = result.records.map((record) => {
                return {role: record.get("n").properties.name, uses: record.get("t").properties.name};
            }).sort(this.roleSort);
            this.setState((state) => ({roles: newstate}));
        } )
        .catch((error) => {
            console.error(error);
        });
       //session.close();
    }

     componentDidMount() {
         this.getDatasets();

     }

     componentWillUnmount() {
   
     }

     //TODO Rename this to reflect that it returns a button.
     getDatasetList() {
         return (this.state.datasets.map((dataset) => {
            // highlight button if it is the current one. 
          let active = dataset === this.state.dataName;
          return <ReactBootstrap.Button active={active} onClick={() => this.setData(dataset)} 
            key={dataset + "select"} className="list-group-item list-group-item-action">{dataset}</ReactBootstrap.Button>}))
     }


    render () {
        let dataName = this.state.dataName !== "" ? this.state.dataName : this.state.datasets[0];
        let templateList = this.state.templates.map((template, ind) => <th scope="col">{template}</th>);
        /*
        let datasetList = this.state.datasets.map((dataset) => {
            // highlight button if it is the current one. 
          let active = dataset === this.state.dataName;
          return <ReactBootstrap.Button active={active} onClick={() => this.setData(dataset)} 
            key={dataset + "select"} className="list-group-item list-group-item-action">{dataset}</ReactBootstrap.Button>}); */
        let roles = this.state.roles.filter((valid) => this.state.templates.includes(valid.uses)) 
          .map((role, ind) => {
            let cols = this.state.templates.map((temp) => {
                // is item set using template?
              let checked = role.uses === temp;
                // if item is admin, disable any template except "full"
              let disabled = (role.role === "admin" && temp !== "full");  
              return <td key={role.role + temp + ind + "data"}><input key={role.role + temp + ind} name={role.role + "radio"} type="radio" disabled={disabled} defaultChecked={checked}></input></td>})
          return <tr key={role.role + ind + "row"} className={"btn-group-" + role.role} role="group">
            <th key={role.role + ind + "head"} scope="row">{role.role}</th>
            {cols}
        </tr> });   
        
        let userName = this.state.userName;
        return(
        <div className="row">         
            <div className="col-3">
                <h1>{userName}</h1>
                <div className="list-group">
                    {userName === "guest" ? [] : this.getDatasetList()}
                </div>
                </div>
            <div className="col-6">
                <h2> Dataset pane for {dataName}</h2>
                <div className="row">Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Morbi eleifend lacinia suscipit. Etiam pharetra vel urna a tincidunt. Donec sagittis 
            libero vitae laoreet tristique. Donec quis sem vel leo viverra ornare. Mauris sodales 
            commodo hendrerit. Proin auctor sapien at purus ullamcorper sodales. Maecenas sed 
            ullamcorper sapien, sit amet eleifend eros. Aenean molestie sit amet felis at lacinia. 
            Nulla eu egestas nibh.</div>
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
            </div>
            
        </div>);

    }
}
export default DatasetBrowser;


