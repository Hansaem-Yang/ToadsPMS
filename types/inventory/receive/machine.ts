import { Material } from "./material";

export interface Machine {
    vessel_no: string;
    machine_name: string;
    materials: Material[];
}