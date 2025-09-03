import { Equipment } from "../vessel/equipment";
import { Section } from "../vessel/section";
import { MaintenancePlan } from "../vessel/maintenance_plan";

export interface PMSData {
    req_date: string;
    equipments: Equipment[];
    sections: Section[];
    maintenances: MaintenancePlan[];
}