import { session } from "neo4j-driver";
import { driver } from "neo4j-driver-core";
import DatabaseService from "./database";

beforeAll(() =>  {
    
});

it("sorts a list with default pins", () => {
    let ds = new DatabaseService("neo4j");
    ds.pins = ['admin', 'public'];
    let testcase = ds.pinnedSort(["a", "c", "b", "x", "d", "public", "admin"]);
    let expected = ["admin", "public", "a", "b", "c", "d", "x"];
    expect(testcase).toEqual(expected);
});

it ("sorts a list with different updated pins", () => { 
    DatabaseService._pins = ['public', 'admin'];
    let ds = new DatabaseService("neo4j");
    let testcase = ds.pinnedSort(["a", "c", "b", "x", "d", "public", "admin"]);
    let expected = ["public", "admin", "a", "b", "c", "d", "x"];
    expect(testcase).toEqual(expected);
})

it("gets the driver from config", () => {
    let ds = new DatabaseService ('neo4j');
    let driver = ds.getDriver();
    expect(driver._config.userAgent).toEqual('neo4j-javascript/4.3.3')
})

describe("Test database functions and close.", () => {
    let ds;
    let driver;
    beforeAll(() => {
        ds = new DatabaseService('neo4j');
        driver = ds.getDriver();
    })

    it("Runs a common query", () => {

    })

    afterAll(()=> {
        session.close();
    })
})