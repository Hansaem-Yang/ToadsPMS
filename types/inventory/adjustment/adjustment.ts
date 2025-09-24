export interface Adjustment {
    vessel_no: string;
    vessel_name: string;
    adjustment_no: string;
    machine_id: string;
    machine_name: string;
    material_code: string;
    material_name: string;
    adjustment_date: string;
    adjustment_type: string;
    adjustment_qty: number;
    adjustment_unit: string;
    adjustment_location: string;
    adjustment_location_name: string;
    adjustment_reason: string;
    adjustment_remark: string;
    stock_qty: number;
    registrant: string;
    regist_date: string;
    regist_user: string;
    modify_date: string;
    modify_user: string;
}