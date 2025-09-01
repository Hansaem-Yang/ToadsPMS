export interface Maintenance {
    vessel_no: string;
    vessel_name: string;
    equip_no: string;
    equip_name: string;
    section_code: string;
    section_name: string;
    plan_code: string;
    plan_name: string;
    category: string;
    workers: number;
    work_hours: number;
    interval: number;
    interval_term: string;
    location: string;
    self_maintenance: string;
    manager: string;
    critical: string;
    lastest_date: string;
    due_date: string;
    next_due_date: string;
    extension_date: string;
    calendar_date: string;
    status: string;
}