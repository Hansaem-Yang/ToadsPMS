import { Material } from "./material";

export interface Vessel {
    vessel_no: string;
    vessel_name: string;
    children: Material[];
}