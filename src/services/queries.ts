interface Queries {
    org : string;
    userByGid : string;
    datasetsById : string;
    datasetsByName : string;
    templates: string;
    removeTemplatesByName : string;
    updateTemplateByName : string;
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

export interface ElemParam extends Param {
    element: string;
}

export const queries: Queries = {
    org : 
      'match (u:guser {name: $userName})--(o:organization) return o',
    userByGid: 
      'match (u:guser {gid: $userGid}) return u',
    datasetsById : 
      `MATCH (u:guser {id:$userId})-[:serves]->(o) 
      WITH o 
      MATCH (o)-[:owns]->(d:dataset) 
      RETURN o{.name, .id, datasets:collect(d{.id, .name})}`,
    datasetsByName :
      `match (u:guser {name: $userName})-[:serves]->(o) 
      with (o)
      match (o)-[:owns]->(d:dataset)
      return o{.name, .id, datasets:collect(d{.id, .name})}`,
    removeTemplatesByName : 
      'match (role:role {name: $roleName})-[rel:uses-template]->() delete rel',
    updateTemplateByName: `match role:role {name: $roleName}),
      (template: template {name: $templateName})
      create (role)-[:uses-template]-(template)`,
    templates : 
      'match (d:dataset {id: $dataId})-[:has_template]->(t:template) return t',
    elements : 
      'match(n: element) return n',
    roles: `match (n:role)-[x:uses_template]->(t:template)<-[:has_template]-(d:dataset {id: $dataId}) 
      return n, t`
}

