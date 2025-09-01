import { CalendarDate } from './calendar_date';

export interface Vessel {
    vessel_no: string;
    vessel_name: string;
    children: CalendarDate[];
}