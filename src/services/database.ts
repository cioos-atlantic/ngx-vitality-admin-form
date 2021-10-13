import { Neo4jError } from 'neo4j-driver-core';
import configData from '../config.json';
import NotImplemented from '../util/not-implemented';
import { DatasetParam, Param, queries} from './queries';
import * as neo4j from 'neo4j-driver';
import { User, OrgDataset, Dataset, Template, State } from '../state/datastate';
import Role from '../state/role';

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
     * @returns - a node id corresponding to the google id.
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
                        console.log(record);
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

    /**
     * Retrieve organizations and datasets accessible to the user based on id.
     * 
     * @param userid 
     * @returns 
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

    async getRoles(dataset: Dataset) {
        let session!: neo4j.Session; 
        try {
            session = this._driver.session({database: this._db});
            return await session.run(queries.roles, {dataId: dataset.id.toString()})
              .then((result) => {
                  return result.records.map((record) => {
                      let role: Role = {role: record.get("n").properties.name, uses: record.get("t").properties.name} ;
                      console.log(role);
                      return role;    
                  })
              })
        } catch (e) {
            if (e instanceof Neo4jError) {
                session = this._driver.session();
                return await session.run(queries.roles, {dataId: dataset.id.toString()})
                    .then((result) => {
                        return result.records.map((record) => {
                            let role: Role = {role: record.get("n").properties.name, uses: record.get("t").properties.name};
                            return role;
                        })
                    });
            } else {
                throw e;
            }
        } finally {
            session.close();
        }

    }

    async getTemplates(dataset: Dataset) {
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

    updateTemplate(role: Role, template: Template) {

    }

    getDriver() {
        return this._driver;
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
