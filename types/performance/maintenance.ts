export interface Maintenance {
    id: string;
    name: string;
    vessel_no: string;
    vessel_name?: string;
    imo_no?: string;
    machine_name?: string;
    equip_no?: string;
    equip_name?: string;
    category?: string;
    section_code?: string;
    section_name?: string;
    plan_code?: string;
    plan_name?: string;
    interval?: string;
    interval_term?: string;
    lastest_date?: string;
    due_date?: string;
    work_date?: string;
    type?: string;
    key?: string;
    children: Maintenance[];
}