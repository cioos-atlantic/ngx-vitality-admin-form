import Role from './role';

export interface State {
    name: string;
}

export interface User extends State {
    id: string;
    gid: string | number;
    name: string;
}

export interface Dataset extends State {
    id: string | number;
    name: string;
    description_en: string; 
    description_fr: string;
}

export interface OrgDataset extends State {
    name: string;
    id: string | number;
    datasets: Dataset[];
}

export interface Template extends State {
    name: string,
    id: string | number;
    description: string;

}

export interface DataState {
    templates?: Template[];
    datasets: OrgDataset[];
    orgName?: string;
    userId?: string;
    userName?: string;
    dataName?: Dataset;
    elements?: string[];
    roles?: Role[];
}