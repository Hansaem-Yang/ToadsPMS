import { Vessel } from '@/types/vessel/vessel';
import { Equipment } from "../vessel/equipment";
import { Section } from "../vessel/section";
import { MaintenancePlan } from "../vessel/maintenance_plan";
import { MaintenanceExtension } from '@/types/vessel/maintenance_extension';
import { MaintenanceWork } from "../vessel/maintenance_work";

export interface PMSData {
    vessel_no: string;
    last_receive_date: string;
    vessels: Vessel[];
    equipments: Equipment[];
    sections: Section[];
    maintenances: MaintenancePlan[];
    extensions: MaintenanceExtension[];
    works: MaintenanceWork[];
}