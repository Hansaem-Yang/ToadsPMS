export interface Loss {
    vessel_no: string;
    vessel_name: string;
    loss_no: string;
    machine_id: string;
    machine_name: string;
    material_code: string;
    material_name: string;
    loss_date: string;
    loss_unit: string;
    loss_qty: number;
    loss_location: string;
    loss_reason: string;
    loss_remark: string;
    stock_qty: number;
    registrant: string;
    regist_date: string;
    regist_user: string;
    modify_date: string;
    modify_user: string;
}