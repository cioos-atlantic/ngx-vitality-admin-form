import { Neo4jError } from 'neo4j-driver-core';
import configData from '../config.json';
import NotImplemented from '../util/not-implemented';
import { DatasetParam, Param, queries} from './queries';
import * as neo4j from 'neo4j-driver';
import { User, OrgDataset, Dataset, Template, State, RoleDatasetTemp } from '../state/datastate';
import {Role, RoleTemp} from '../state/role';
import { buildMatchMemberExpression } from '@babel/types';

/**
 * A service to control access to and from the database.
 */
class DatabaseService {

    static _pins = ["admin", "public"];
    static _queries = queries;
    dbType: string;
    _uri: string;
    _name: string;
    _password: string;
    _db: string;
    _driver: neo4j.Driver;

    constructor(dbType: string) {
        this.dbType = dbType;

        if (this.dbType === "neo4j") {
            this._uri = configData.NEO4J_URL;
            this._name = configData.NEO4J_NAME;
            this._password = configData.NEO4J_PASSWORD;
            this._db = configData.NEO4J_DATABASE;
            this._driver = neo4j.driver(this._uri, neo4j.auth.basic(this._name, this._password), {})
        } else {
            // TODO: Replace these with Postgres settings when applicable.
            this._uri = "";
            this._name = "";
            this._password = "";
            this._db = "";
            this._driver = neo4j.driver("");
        }
    }

    /**
     * Gets a user profile based on a google id.
     * @param gid - the google id of the user.
     * @returns - a promise with the User corresponding to the google id.
     *
     */
    async getUserId(gid: string): Promise<User> {
        let param: DatasetParam = { userGid: gid };
        let session!: neo4j.Session;
        try {
            session = this._driver.session({ database: this._db });
            return await session.run(queries.userByGid, param)
                .then((result) => {
                    return result.records.map((record) => {
                        return record.get('u').properties;
                    })[0]
                })
        } catch (e) {
            if (e instanceof Neo4jError) {
                session = this._driver.session();
                return await session.run(queries.userByGid, param)
                    .then((result) => {
                        return result.records.map((record) => {
                            return record.get('u').properties;
                        })[0]
                    })
            } else {
                throw e;
            }
        } finally {
            session.close()
        }
    }

    async getUserIdFromApi(gid: string): Promise<User>{
        let bearer = 'Bearer ' + configData.AUTH_KEY;
        let url: string = configData.API_URL;
        let res = await fetch(url + '/' + gid, {
            headers: new Headers({
            'Authorization' : bearer
        }),
    }).then((resp) => resp.json());
        return {id: res['id'], gid: res['gid'], name: res['name']} as User;
    }

    /**
     * Retrieve organizations and datasets accessible to the user based on id.
     * 
     * @param userid 
     * @returns a promise with the list of OrgDatasets
     */
    async getDatasets(userid: string): Promise<OrgDataset[]> {
        let param: DatasetParam = { userId: userid };
        let session!: neo4j.Session;
        try {
            session = this._driver.session({ database: this._db });
            return await session.run(queries.datasetsById, param)
                .then((result) => {
                    // get orgs belonging to a person
                    let orgs = result.records.map((record) => {
                        let org: OrgDataset = record.get("o");
                        return org;
                    }).sort()
                    return orgs;
                });
        } catch (e) {
            if (e instanceof Neo4jError) {
                session = this._driver.session();
                return await session.run(queries.datasetsById, param)
                    .then((result) => {
                        // get orgs belonging to a person
                        let orgs = result.records.map((record) => {
                            let org: OrgDataset = record.get("o");
                            return org;
                        }).sort()
                        return orgs;
                    });
            } else {
                throw e;
            }
        } finally {
            session.close()
        }
    }

    async getDatasetsFromApi(userid: string) {
        let bearer = 'Bearer ' + configData.AUTH_KEY;
        let url: string = configData.API_URL + "/datasets/"
        let res: OrgDataset[] = await fetch(url + userid, {
            headers: new Headers({'Authorization': bearer})
        })
          .then((resp) => resp.json())
          .then((data) => {
              return data['org_datasets'].map((record:OrgDataset) => record as OrgDataset)});
        return res
    }

    /**
     * Gather the roles that are available to access a particular dataset.
     * 
     * @param dataset - the dataset to retreive the roles.
     * @returns a promise containing a list of roles available to the dataset.
     */
    async getRoles(dataset: Dataset): Promise<RoleTemp[]> {
        let session!: neo4j.Session; 
        try {
            session = this._driver.session({database: this._db});
            let roletemps: RoleTemp[] = await session.run(queries.roles, {dataId: dataset.id.toString()})
              .then((result) => {
                  return result.records.map((record) => {
                      let role: RoleTemp = {
                        role: {
                          id: record.get("n").properties.id, 
                          name: record.get("n").properties.name,
                          immute: record.get("n").properties.immute
                        } as Role, 
                        uses: {
                          id: record.get("t").properties.id,
                          name: record.get("t").properties.name,
                          description: record.get("t").properties.description
                        } as Template
                    } as RoleTemp;
                      return role;    
                  })     
              });
              return roletemps.sort(this.sortRoleTempsPredicate);
        } catch (e) {
            if (e instanceof Neo4jError) {
                session = this._driver.session();
                let roletemps: RoleTemp[] = await session.run(queries.roles, {dataId: dataset.id.toString()})
                    .then((result) => {
                        return result.records.map((record) => {
                            let role: RoleTemp = {
                              role: {
                                id: record.get("n").properties.id, 
                                name: record.get("n").properties.name,
                                immute: record.get("n").properties.immute
                              } as Role, 
                              uses: {
                                id: record.get("t").properties.id,
                                name: record.get("t").properties.name,
                                description: record.get("t").properties.description
                              } as Template
                          } as RoleTemp;
                            return role;    
                        })
                    });
                    return roletemps.sort(this.sortRoleTempsPredicate);
            } else {
                throw e;
            }
        } finally {
            session.close();
        }
    }

    async getRolesFromApi(dataset: Dataset) {
        let bearer = 'Bearer ' + configData.AUTH_KEY;
        let url: string = configData.API_URL + "/roles/";
        let res: RoleTemp[] = await fetch(url + dataset.id, {
            headers: new Headers({'Authorization' : bearer})
        })
            .then((resp) => resp.json())
            .then((data) => {
                return data['roles'].map((record: { role: Role; uses: Template; }) => <RoleTemp>record);
            });
        return res;
    }
   
    /**
     * Retrieve the templates available for a particular datasets.
     * 
     * @param dataset 
     * @returns 
     */
    async getTemplates(dataset: Dataset): Promise<Template[]> {
        let session!: neo4j.Session; 
        try {
            session = this._driver.session({database: this._db});
            return await session.run(queries.templates, {dataId: dataset.id.toString()})
              .then((result) => {
                  return result.records.map((record) => {
                      let template: Template = record.get("t").properties;
                      return template;
                  }).sort(this.pinnedSortPredicate)
              })
        } catch (e) {
            if (e instanceof Neo4jError) {
                session = this._driver.session();
                return await session.run(queries.templates, {dataId: dataset.id})
                    .then((result) => {
                        return result.records.map((record) => {
                            let template: Template = record.get("t").properties;
                            return template;
                        }).sort(this.pinnedSortPredicate)
                    });
            } else {
                throw e;
            }
        } finally {
            session.close();
        }
    }

    async getTemplatesFromApi(dataset:Dataset): Promise<Template[]> {
        let bearer = 'Bearer ' + configData.AUTH_KEY;
        let url: string = configData.API_URL + "/templates/";
        let res: Template[] = await fetch(url + dataset.id, {
            headers: new Headers({'Authorization' : bearer})
        })
            .then((resp) => resp.json())
            .then((data) => {
                console.log(data)
                return data['templates'].map((record: Template) => record as Template);
            });
        return res;
    }

    async updateTemplate(roledatasettemp: RoleDatasetTemp) {
        let role = roledatasettemp.currRole.role;
        let oldtemp = roledatasettemp.currRole.uses;
        let newtemp = roledatasettemp.currTemp;
        let dataset = roledatasettemp.currDataset;
        // role contains the current template as role.uses
        if (oldtemp.id !== newtemp.id) {
          let session!: neo4j.Session;
          try {
            session = this._driver.session({database: this._db});
            return await session.run(queries.removeTemplatesByRoleId, 
                {
                    roleId: role.id.toString(), 
                    datasetId: dataset.id.toString()
                })
              .then(() => {
                  return session.run(queries.updateTemplatesById, {
                      roleId: role.id.toString(), 
                      templateId: newtemp.id.toString()
                    });
                  });
              } catch (e) {
            if (e instanceof Neo4jError) {
                session = this._driver.session();
                return await session.run(queries.removeTemplatesByRoleId, 
                    {
                      roleId: role.id.toString(), 
                      datasetId: dataset.id.toString()
                  })
                .then(() => {
                    return session.run(queries.updateTemplatesById, {
                      roleId: role.id.toString(), 
                      templateId: newtemp.id.toString()
                    });
                });
            } else {
                throw e;
            }
        } finally {
            session.close();
        }
    }
    }

    async updateTemplateByApi(roledatasettemp: RoleDatasetTemp) {
        let bearer = 'Bearer ' + configData.AUTH_KEY;
        let urlRem = configData.API_URL + '/remove_templates'
        let urlUpd = configData.API_URL + '/update_templates'
        let role = roledatasettemp.currRole.role;
        let oldtemp = roledatasettemp.currRole.uses;
        let newtemp = roledatasettemp.currTemp;
        let dataset = roledatasettemp.currDataset;
        let requestOptionsRem = {
            method: 'POST',
            headers: new Headers({
                'Authorization' : bearer,
                'Accept' : 'application/json',
                'Content-Type': 'application/json'}),
            body: JSON.stringify({
                roleid: role.id,
                datasetid: dataset.id
            })
        }
        let requestOptionsUpd = {
            method: 'POST',
            headers: new Headers({
                'Authorization' : bearer,
                'Accept' : 'application/json',
                'Content-Type': 'application/json'}),
            body: JSON.stringify({
                roleid: role.id,
                templateid: newtemp.id})
             }

        console.log(requestOptionsRem);
        console.log(requestOptionsUpd);
        if (oldtemp.id != newtemp.id) {
            let res = await fetch(urlRem, requestOptionsRem)
                .then((resp) => resp.json())
                .then((data: Object) => {
                    if (Object.keys(data).includes("success")) {
                        return fetch(urlUpd, requestOptionsUpd)
                          .then((resp) => resp.json())
                          .then((data: Object) => {
                              if (Object.keys(data).includes("success")) {
                                  return true
                              } else {
                                  return false
                              }
                          })
                    }        
                });
            return res;
        }
    }

    makeQueryNeo4J(query: string, params: Param) {
        let session!: neo4j.Session;
        let result;
        try {
            session = this._driver.session({ database: this._db });
            result = session.run(query, params);
        } catch (e) {
            if (e instanceof Neo4jError) {
                session = this._driver.session();
                result = session.run(query, params);
            } else {
                throw e;
            }
        } finally {
            session.close()
        }
        return result;
    }

    /**
     * @param newPin: string[] - a set of strings that always go first in a sort.
     */
    set pins(newPin: string[]) {
        DatabaseService._pins = newPin;
    }

    get pins(): string[] {
        return DatabaseService._pins;
    }

    /**
     * A sorting predicate for the RoleTemp type.
     * 
     * @param item1: State - first RoleTemp comparitor
     * @param item2: State - second RoleTemp comparitor
     * @param by: string - if by is not "role" exactly, it will use uses.
     * @returns 
     */
    sortRoleTempsPredicate(item1:RoleTemp, item2:RoleTemp, by="role") {
        let p = DatabaseService._pins;
        if (p.includes(item1.role.name.toLowerCase()) && p.includes(item2.role.name.toLowerCase())) {
            return p.indexOf(item1.role.name.toLowerCase()) - p.indexOf(item2.role.name.toLowerCase());
        } else if (p.includes(item1.role.name.toLowerCase())) {
            return -1;
        } else if (p.includes(item2.role.name.toLowerCase())) {
            return 1;
        } else {
            let x = item1.role.name.toLowerCase();
            let y = item2.role.name.toLowerCase();
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
        }
    }

    /**
     * A sorting predicate that compares item1 to item2, but allows values in pins list to be sorted first.
     * 
     * @param item1: State
     * @param item2: State
     */
    pinnedSortPredicate(item1: State, item2: State): number {
        let p = DatabaseService._pins;
        if (p.includes(item1.name.toLowerCase()) && p.includes(item2.name.toLowerCase())) {
            return p.indexOf(item1.name.toLowerCase()) - p.indexOf(item2.name.toLowerCase());
        } else if (p.includes(item1.name.toLowerCase())) {
            return -1;
        } else if (p.includes(item2.name.toLowerCase())) {
            return 1;
        } else {
            let x = item1.name.toLowerCase();
            let y = item2.name.toLowerCase();
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
        }
    }

    /**
     * Sorts a list with pinned items in _pins always coming first.
     * 
     * @param arr : string[] 
     * @returns 
     */
    pinnedSort(arr: any[]) {
        return arr.sort(this.pinnedSortPredicate);
    }

    getUserPostgres(userid: string) {
        throw new NotImplemented("User query for Postgres");
    }

}

export default DatabaseService;
