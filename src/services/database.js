import { Neo4jError } from 'neo4j-driver-core';
import configData from '../config.json';
import NotImplemented from '../util/not-implemented';

//const _pins = ["admin", "public"];

/**
 * A service to control access to and from the database.
 */
class DatabaseService {

    static _pins = ["admin", "public"];
    

    constructor (dbType) {
        this.dbType = dbType;
        
        if (this.dbType == "neo4j") {
            this._uri = configData.NEO4J_URL;
            this._user = configData.NEO4J_NAME;
            this._password = configData.NEO4J_PASSWORD;
            this._db = configData.NEO4J_DATABASE;
            this._neo4j = require('neo4j-driver');
            this._driver = this.neo4j.driver(this.uri, this.neo4j.auth.basic(this.user, this.password), {})
        }
    }

    getDriver() {
        return this._driver;
    }

    makeQuery(query, params) {
        let session;
        let result;
        try {
            session = this._driver.session({database: db});
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
     * @param {string} newPin
     */
    set pins(newPin) {
        this._pins = newPin;
    }

    get pins() {
        return this._pins;
    }

    /**
     * A sorting predicate that compares item1 to item2, but allows values in pins list to be sorted first.
     * 
     * @param {string} item1 
     * @param {string} item2 
     */
    pinnedSortPredicate(item1, item2) {
        let p = DatabaseService._pins;
        if (p.includes(item1.toLowerCase()) && p.includes(item2.toLowerCase())) {
            return p.indexOf(item1.toLowerCase()) - p.indexOf(item2.toLowerCase());
        } else if (p.includes(item1.toLowerCase())) {
            return -1;
        } else if (p.includes(item2.toLowerCase())) {
            return 1;
        } else {
            let x = item1.toLowerCase();
            let y = item2.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
        }
    }

    /**
     * 
     * @param {Array[string]} arr 
     * @returns 
     */
    pinnedSort(arr) {
        return arr.sort(this.pinnedSortPredicate);
    }

    getUserNeo4j(userid) {


    }

    getUserPostgres(userid) {
        throw NotImplemented("User query for Postgres");
    }

    getUser(userid) {
        return db == 'neo4j' ? getUserNeo4j(userid) : getUserPostgres(userid);
    }

}

export default DatabaseService;