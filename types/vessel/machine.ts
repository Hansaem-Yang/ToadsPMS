import { Equipment } from "./equipment";

export interface Machine {
    vessel_no: string;
    machine_name: string;
    manufacturer: string;
    machine_desc: string;
    sort_no: number;
    regist_date: string;
    regist_user: string;
    modify_date: string;
    modify_user: string;
    children: Equipment[];
}