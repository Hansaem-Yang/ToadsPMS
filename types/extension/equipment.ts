import { MaintenanceExtension } from "./maintenance_extension";

export interface Equipment {
    vessel_no: string;
    equip_no: string;
    equip_name: string;
    category: string;
    type: string;
    children: MaintenanceExtension[];
}