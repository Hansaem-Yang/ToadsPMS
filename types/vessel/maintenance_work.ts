export interface MaintenanceWork {
    work_order: number;
    work_date: string;
    vessel_no: string;
    equip_no: string;
    section_code: string;
    plan_code: string;
    plan_date: string;
    manager: string;
    work_details: string;
    used_parts: string;
    work_hours: number;
    delay_reason: string;
    due_date: string;
    extension_date: string;
    regist_date: string;
    regist_user: string;
    modify_date: string;
    modify_user: string;
}