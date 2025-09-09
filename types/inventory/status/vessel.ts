import { Inventory } from "./inventory";

export interface Vessel {
    vessel_no: string;
    vessel_name: string;
    children: Inventory[];
}