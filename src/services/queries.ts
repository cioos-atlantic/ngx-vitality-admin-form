interface Queries {
    org : string;
    userByGid : string;
    datasetsById : string;
    datasetsByName : string;
    templates: string;
    removeTemplatesByRoleName : string;
    removeTemplatesByRoleId : string;
    updateTemplateByName : string;
    updateTemplatesById : string;
    elements : string;
    roles : string;
    descriptionEN : string;
    descriptionFR : string;        
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
    removeTemplatesByRoleName : 
      'match (role:role {name: $roleName})-[rel:uses-template]->() delete rel',
    removeTemplatesByRoleId :
      'match (role:role {id: $roleId})-[rel:uses-template]->() delete rel',
    updateTemplateByName: `match role:role {name: $roleName})
      (template: template {name: $templateName})
      create (role)-[:uses-template]-(template)`,
    updateTemplatesById : 
      `match role:role {id: $roleId})
      (template: template {id: $templateId})
      create (role)-[:uses-template]-(template)`,
    templates : 
      'match (d:dataset {id: $dataId})-[:has_template]->(t:template) return t',
    elements : 
      'match(n: element) return n',
    roles: `match (n:role)-[x:uses_template]->(t:template)<-[:has_template]-(d:dataset {id: $dataId}) 
      return n, t`,
    descriptionEN :
      "match (d:dataset {id:$dataId}) return d.description_en",
    descriptionFR :
      "match (d:dataset {id:$dataId}) return d.description_fr"
}

