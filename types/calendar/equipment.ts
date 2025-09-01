import { CalendarDate } from "./calendar_date";

export interface Equipment {
    vessel_no: string;
    equip_no: string;
    equip_name: string;
    category: string;
    children: CalendarDate[];
}