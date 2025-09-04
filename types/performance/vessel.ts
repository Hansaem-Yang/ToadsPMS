import { Equipment } from "./equipment";

export interface Vessel {
    vessel_no: string;
    vessel_name: string;
    imo_no: string;
    type: string;
    children: Equipment[];
}