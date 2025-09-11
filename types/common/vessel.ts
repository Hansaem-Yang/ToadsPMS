import { Machine } from "./machine";
import { Warehouse } from "./warehouse";

export interface Vessel {
    vessel_no: string;
    vessel_name: string;
    machines: Machine[];
    warehouses: Warehouse[];
}