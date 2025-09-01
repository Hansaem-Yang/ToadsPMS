import { Maintenance } from "./maintenance";

export interface Equipment {
    vessel_no: string;
    equip_no: string;
    equip_name: string;
    category: string;
    children: Maintenance[];
}