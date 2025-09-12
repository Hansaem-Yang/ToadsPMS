import { Receive } from "./receive";

export interface ReceiveData {
    vessel_no: string;
    receive_date: string;
    delivery_location: string;
    regist_date: string;
    regist_user: string;
    modify_date: string;
    modify_user: string;
    materials: Receive[];
}