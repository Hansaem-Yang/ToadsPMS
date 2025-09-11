export interface Material {
    vessel_no: string;
    vessel_name: string;
    machine_id: string;
    machine_name: string;
    material_code: string;
    material_name: string;
    material_group: string;
    material_spec: string;
    material_type: string;
    material_unit: string;
    warehouse_no: string;
    warehouse_name: string;
    drawing_no: string;
    standard_qty: number;
    initial_stock: number;
    receive_count: number;
    release_count: number;
    regist_date: string;
    regist_user: string;
    modify_date: string;
    modify_user: string;
}