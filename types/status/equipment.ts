import { Section } from "./section";

export interface Equipment {
    id: string;
    name: string;
    category: string;
    type: string;
    children: Section[];
}