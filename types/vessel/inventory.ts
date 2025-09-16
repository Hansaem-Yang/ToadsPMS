export interface Inventory {
    vessel_no: string;
    vessel_name: string;
    machine_id: string;
    machine_name: string;
    material_code: string;
    material_name: string;
    material_unit: string;
    warehouse_no: string;
    warehouse_name: string;
    standard_qty: number;
    stock_qty: number;
    use_qty: number;
}