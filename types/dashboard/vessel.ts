export interface Vessel {
    vessel_no: string;
    vessel_name: string;
    vessel_short_name: string;
    imo_no: string;
    delayed_tasks: number;
    weekly_tasks: number;
    monthly_tasks: number;
    completed_tasks: number;
    total_tasks: number;
}