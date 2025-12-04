import { MaintenancePlan } from "./maintenance_plan";

export interface Section {
    vessel_no: string;
    equip_no: string;
    machine_name: string;
    section_code: string;
    section_name: string;
    description?: string;
    due_date?: string;
    maintenance_count?: number;
    regist_date?: string;
    regist_user?: string;
    modify_date?: string;
    modify_user?: string;
    children?: MaintenancePlan[];
}