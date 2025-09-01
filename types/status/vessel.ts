import { Equipment } from "./equipment";

export interface Vessel {
    id: string;
    name: string;
    imo_no: string;
    type: string;
    children: Equipment[];
}