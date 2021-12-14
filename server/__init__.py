import logging
from re import L
from flask import Flask, request, jsonify
from neo4j import GraphDatabase
from neo4j.exceptions import Neo4jError, ServiceUnavailable
from dotenv import load_dotenv
import os
from dataclasses import dataclass
from flask_httpauth import HTTPTokenAuth
from uuid import UUID

load_dotenv()

app = Flask(__name__)
auth = HTTPTokenAuth(scheme = 'Bearer')
user = os.environ.get("neo4j_user")
uri = os.environ.get("neo4j_uri")
pw = os.environ.get("neo4j_password")

from dataclasses import dataclass

@dataclass
class Query:
    userByGid: str = "MATCH (u:user) WHERE u.gid=$userGid RETURN u.id AS id"

    datasetsById: str = '''
    MATCH (u:user)-->(o)
    WHERE u.id=$userId
    WITH o
    MATCH (o)-[:owns]->(d:dataset)
    RETURN o{.name, .id, datasets:collect(d{.id, .name, .description_en})} as org
    '''
    removeTemplatesByRoleId: str = '''
    MATCH (role:role {id: $roleId})-[rel:uses_template]->(t)
    <-[:has_template]-(dataset:dataset {id:$datasetId})
    DELETE rel
    RETURN t.id as id
    '''
    updateTemplateById: str = '''
    MATCH (r:role {id: $roleId}), 
    (t:template {id: $templateId})
    CREATE (r)-[:uses_template]->(t)'''

    templates: str = '''
    MATCH (d:dataset {id: $datasetId})-[:has_template]->(t:template) 
    RETURN t 
    '''

    elements: str = '''
    MATCH (n:element) return n
    '''
    roles: str = """
    MATCH (n:role)-[x:uses_template]->(t:template)
    <-[:has_template]-(d:dataset)
    WHERE d.id=$datasetId
    RETURN n{.id, .name} as role, t{.id, .name, .description} as uses
    """
    org: str = """
    MATCH (u:user {name: \"$userName\"})-->(o:organization) return o
    """


class Neo4JMiddleWare(Query):
    def __init__ (self, uri, user, pw):
        self.driver = GraphDatabase.driver(uri, auth=(user, pw))

    def close (self):
        self.driver.close()

    def version_uuid(test_string, version):
        try:
            uuid_obj = UUID(test_string, version=version)
        except ValueError:
            return False
        return str(uuid_obj) == test_string

    def getUserId(self, gid):
        with self.driver.session() as session:
            result = session.read_transaction(self.getUserIdHelper, gid)
        return result[0]

    @staticmethod
    def getUserIdHelper(tx, gid):
        query = Query.userByGid
        result = tx.run(query, userGid=gid)
        try:
            return [record["id"] for record in result]
        except ServiceUnavailable as exception:
            logging.error(f"{query} raised an error: \n {exception}")
            raise

    def getDataSets(self, userid):
        with self.driver.session() as session:
            result = session.read_transaction(self.getDatasetsHelper, userid)
        return [record for record in result]

    @staticmethod
    def getDatasetsHelper(tx, userid):
        query = Query.datasetsById
        result = tx.run(query, userId=userid)
        try:
            return [record['org'] for record in result]
        except ServiceUnavailable as exception:
            logging.error(f"{query} raised an error: \n {exception}")
            raise

    def removeTemplatesByRoleId(self, roleid, datasetid):
        with self.driver.session() as session:
            result = session.write_transaction(self.removeTemplatesByRoleIdHelper, 
            roleid, 
            datasetid)
            print(result)
        return result

    @staticmethod
    def removeTemplatesByRoleIdHelper(tx, roleid, datasetid):
        query = Query.removeTemplatesByRoleId
        result = tx.run(query, roleId=roleid, datasetId=datasetid)
        try:
            return result.single()['id']
        except ServiceUnavailable as exception:
            logging.error(f"{query} raised an error: \n {exception}")
            raise
            # Do we need to return something here?

    def updateTemplateById(self, roleid, templateid):
        with self.driver.session() as session:
            result = session.write_transaction(self.updateTemplateByIdHelper,
            roleid, 
            templateid)
            print(result)
        return result
            # Do we need to return something here?

    @staticmethod
    def updateTemplateByIdHelper(tx, roleid, templateid):
        query = Query.updateTemplateById
        result = tx.run(query, roleId=roleid, templateId=templateid)
        try:
            print (result)
        except ServiceUnavailable as exception:
            logging.error(f"{query} raised an error: \n {exception}")
            raise

    def getTemplates(self, datasetid): 
        with self.driver.session() as session:
            result = session.read_transaction(self.getTemplatesHelper, datasetid)
            for record in result:
                print(record)
        return [record for record in result]

    @staticmethod
    def getTemplatesHelper(tx, datasetid):
        query= Query.templates
        result = tx.run(query, datasetId=datasetid)
        try:
            return [record['t'] for record in result.data()]
        except ServiceUnavailable as exception:
            logging.error(f"{query} raised an error: \n {exception}")
            raise 

    def getRoles(self, datasetid):
        with self.driver.session() as session:
            result = session.read_transaction(self.getRolesHelper, datasetid)
            for record in result:
                print(record)
        return [record for record in result]

    @staticmethod
    def getRolesHelper(tx, datasetid):
        query = Query.roles
        result = tx.run(query, datasetId=datasetid)
        try:
            return [{"role": record['role'], "uses": record['uses']} for record in result]
        except ServiceUnavailable as exception:
            logging.error(f"{query} raised an error: \n {exception}")
            raise

    def __del__(self):
        self.driver.close()

db = Neo4JMiddleWare(uri, user, pw)

@auth.verify_token
def verify_token(token):
    if token == os.environ.get('VALID_AUTH_KEY'):
        return "valid"

@app.route('/')
@app.route("/<gid>")
@auth.login_required
def getUserId(gid=None):
    return {'id': db.getUserId(gid)}

@app.route("/datasets/<uuid:id>")
@auth.login_required
def getDatasets(id):
    return {"org_datasets": db.getDataSets(str(id))}

@app.route("/remove_templates", methods=['POST'])
@auth.login_required
def remove_templates():
    data = request.json
    roleid = data['roleid']
    datasetid = data['datasetid']
    try:
        db.removeTemplatesByRoleId(roleid, datasetid)
        print(f'Successfully remove templates on behalf of {roleid}')
        return {"success" : "requested templates removed"}
    except Neo4jError as exception:
        print(exception)
        return {"error": exception.message}

@app.route("/update_templates", methods=['POST'])
@auth.login_required
def update_templates():
    data = request.json
    print(data)
    roleid = data['roleid']
    templateid = data['templateid']
    try:
        db.updateTemplateById(roleid, templateid)
        print(f'Successfully updated template {templateid} on behalf of {roleid}')
        return {"success" : "requested templates updated"}
    except Neo4jError as exception:
        print(exception)
        return {"error" : exception.message}

@app.route("/roles/<uuid:datasetid>")
@auth.login_required
def getRoles(datasetid):
    return {"roles": db.getRoles(str(datasetid))}

@app.route("/templates/<uuid:datasetid>")
@auth.login_required
def getTemplates(datasetid):
    return {"templates": db.getTemplates(str(datasetid))}

if __name__ == "__main__":
    app.run(debug=True, port=5005)