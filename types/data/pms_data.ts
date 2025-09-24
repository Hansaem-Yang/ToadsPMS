import { Vessel } from '@/types/vessel/vessel';
import { Equipment } from "../vessel/equipment";
import { Section } from "../vessel/section";
import { MaintenancePlan } from "../vessel/maintenance_plan";
import { MaintenanceExtension } from '@/types/vessel/maintenance_extension';
import { MaintenanceWork } from "../vessel/maintenance_work";

import { Warehouse } from '@/types/inventory/warehouse/warehouse';
import { Material } from '@/types/inventory/material/material';
import { Receive } from '@/types/inventory/receive/receive';
import { Release } from '@/types/inventory/release/release';
import { Loss } from '@/types/inventory/loss/loss';

export interface PMSData {
    vessel_no: string;
    last_receive_date: string;
    vessels: Vessel[];
    equipments: Equipment[];
    sections: Section[];
    maintenances: MaintenancePlan[];
    extensions: MaintenanceExtension[];
    works: MaintenanceWork[];
    warehouses: Warehouse[];
    materials: Material[];
    receives: Receive[];
    releases: Release[];
    losses: Loss[];
}