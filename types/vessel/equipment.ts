import { Section } from "./section";

export interface Equipment {
    vessel_no: string;
    equip_no: string;
    equip_name: string;
    manufacturer: string;
    category: string;
    model: string;
    machine: string;
    specifications: string;
    description: string;
    lastest_date: string;
    due_date: string;
    maintenance_count: number;
    section_count: number;
    regist_date: string;
    regist_user: number;
    modify_date: string;
    modify_user: number;
    children: Section[];
}