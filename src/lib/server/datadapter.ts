import EventEmitter from "node:events";

export interface Response {
    status: number
    payload: string | undefined
}

export interface CreateUser {}

export interface CreateIncident {}

export interface CreateIncidentEvent {}

export interface ReadRequest {}

export interface UpdateUser {}

export interface UpdateIncident {}

export interface UpdateIncidentEvent {}

export interface AuthorizeUser {}

export interface MeshCadEvents {
    response: [Response]
    createUser: [CreateUser]
    createIncident: [CreateIncident]
    createIncidentEvent: [CreateIncidentEvent]
    read: [ReadRequest]
    updateUser: [UpdateUser]
    updateIncident: [UpdateIncident]
    updateIncidentEvent: [UpdateIncidentEvent]
    authorizeUser: [AuthorizeUser]
}

export abstract class DataAdapter extends EventEmitter<MeshCadEvents> {
    public abstract name: string

    [property: string]: any

    public abstract handler(): Promise<void>
    public abstract send(...args: any[]): Promise<void>
    public abstract shutdown(): Promise<void>
}
