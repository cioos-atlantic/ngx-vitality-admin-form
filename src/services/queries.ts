interface Queries {
    org : string;
    userByGid : string;
    datasetsById : string;
    datasetsByName : string;
    templates: string;
    removeTemplatesByRoleId : string;
    updateTemplatesById : string;
    elements : string;
    roles : string;
}

export interface Param {}

export interface DefaultParam extends Param {
  dataName?: string;
  orgName?: string;
  element?: string;
}

export interface DatasetParam extends Param {
    userGid?: string;
    userId?: string;
    userName?: string;
}

export interface TemplateParam extends Param {
    dataName: string;
}

export interface RoleParam extends Param {
    dataName: string;
}

export interface RoleTempParam extends Param {
    roleId: string;
    templateId: string
}

export interface ElemParam extends Param {
    element: string;
}

export const queries: Queries = {
    org : 
      'match (u:user {name: $userName})-->(o:organization) return o',
    userByGid: 
      'match (u:user {gid: $userGid}) return u',
    datasetsById : 
      `MATCH (u:user {id:$userId})-->(o) 
      WITH o 
      MATCH (o)-[:owns]->(d:dataset) 
      RETURN o{.name, .id, datasets:collect(d{.id, .name, .description_en})}`,
    datasetsByName :
      `match (u:user {name: $userName})-[:serves]->(o)  
      with (o)
      match (o)-[:owns]->(d:dataset)
      return o{.name, .id, datasets:collect(d{.id, .name, .description_en})}`,
    removeTemplatesByRoleId :
      `match (role:role {id: $roleId})-[rel:uses_template]->(t)<-[:has_template]-(dataset:dataset {id:$datasetId}) 
      delete rel`,
    updateTemplatesById : 
      'match (r:role {id: $roleId}), (t:template {id: $templateId}) create (r)-[:uses_template]->(t)',
    templates : 
      'match (d:dataset {id: $dataId})-[:has_template]->(t:template) return t',
    elements : 
      'match(n: element) return n',
    roles: `match (n:role)-[x:uses_template]->(t:template)<-[:has_template]-(d:dataset {id: $dataId}) 
      return n, t`
}

