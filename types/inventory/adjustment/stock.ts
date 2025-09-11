export interface Stock {
    vessel_no: string;
    vessel_name: string;
    machine_id: string;
    machine_name: string;
    material_code: string;
    material_name: string;
    material_unit: string;
    location: string;
    location_name: string;
    adjustment_type: string;
    stock_qty: number;
    adjustment_qty: number;
    actual_qty: number;
    last_adjustment: string;
}