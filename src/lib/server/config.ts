import type { DataAdapter } from "./datadapter"

export interface MeshCadConfig {
    dataRadio?: DataAdapter[]
    dbPath?: string
}

export async function getConfig(): Promise<MeshCadConfig> {
    try {
        return (await import("../../../meshcad.config")).default
    } catch (error) {
        return {}
    }
}

