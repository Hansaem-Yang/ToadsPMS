import { Vessel } from '@/types/vessel/vessel';
import { Machine } from "@/types/vessel/machine";
import { Equipment } from "@/types/vessel/equipment";
import { Section } from "@/types/vessel/section";
import { MaintenancePlan } from "@/types/vessel/maintenance_plan";
import { MaintenanceExtension } from '@/types/vessel/maintenance_extension';
import { MaintenanceWork } from "@/types/vessel/maintenance_work";
import { UsedParts } from "@/types/vessel/used_parts";

import { Warehouse } from '@/types/inventory/warehouse/warehouse';
import { Material } from '@/types/inventory/material/material';
import { Receive } from '@/types/inventory/receive/receive';
import { Release } from '@/types/inventory/release/release';
import { Loss } from '@/types/inventory/loss/loss';

export interface PMSData {
    vessel_no: string;
    last_receive_date: string;
    vessels: Vessel[];
    machines: Machine[];
    equipments: Equipment[];
    sections: Section[];
    maintenances: MaintenancePlan[];
    extensions: MaintenanceExtension[];
    works: MaintenanceWork[];
    usedParts: UsedParts[];
    warehouses: Warehouse[];
    materials: Material[];
    receives: Receive[];
    releases: Release[];
    losses: Loss[];
}