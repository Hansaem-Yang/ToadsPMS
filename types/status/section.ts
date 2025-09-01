import { Maintenance } from "./maintenance";

export interface Section {
    id: string;
    name: string;
    description: string;
    due_date: string;
    type: string;
    children: Maintenance[];
}