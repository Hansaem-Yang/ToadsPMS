import { Maintenance } from "./maintenance";

export interface CalendarDate {
    calendar_date: string;
    children: Maintenance[];
}