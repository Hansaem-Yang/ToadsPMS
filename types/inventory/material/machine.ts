import { Material } from "./material";

export interface Machine {
    vessel_no: string;
    vessel_name: string;
    machine_name: string;
    children: Material[];
}