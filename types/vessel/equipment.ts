import { Section } from "./section";

export interface Equipment {
    vessel_no: string;
    equip_no: string;
    equip_name: string;
    machine_name: string;
    manufacturer?: string;
    category?: string;
    model?: string;
    specifications?: string;
    description?: string;
    lastest_date?: string;
    due_date?: string;
    maintenance_count?: number;
    section_count?: number;
    regist_date?: string;
    regist_user?: string;
    modify_date?: string;
    modify_user?: string;
    children?: Section[];
}