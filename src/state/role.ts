import { State, Template } from "./datastate";

/**
 * Data class to describe a user role.
 */
export interface Role extends State {
    id : string
    name : string
    immute? : boolean
}

/**
 * Data class to describe a user role with a Template.
 */
 export interface RoleTemp extends State {
    role : Role;
    uses : Template;
}

export default Role