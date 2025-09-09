import { Machines } from "./machines";
import { Warehouse } from "./warehouse";

export interface Vessel {
    vessel_no: string;
    vessel_name: string;
    machines: Machines[];
    warehouses: Warehouse[];
}