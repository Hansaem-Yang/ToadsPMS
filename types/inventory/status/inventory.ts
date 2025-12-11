export interface Inventory {
    id: string;
    name: string;
    vessel_no: string;
    vessel_name: string;
    machine_name?: string;
    material_code?: string;
    material_name?: string;
    material_unit?: string;
    warehouse_no?: string;
    warehouse_name?: string;
    standard_qty?: number;
    period?: string;
    receive_qty?: number;
    release_qty?: number;
    loss_qty?: number;
    stock_qty?: number;
    shortage_qty?: number;
    last_used?: string;
    registrant?: string;
    type?: string;
    key?: string;
    children: Inventory[];
}