import { MeshtasticAdapter } from "$lib/server/radio/adapters/meshtastic"
import { type MeshCadConfig } from "./src"

export default {
    dataRadio: [
        new MeshtasticAdapter("serial", "COM3"),
    ],
    dbPath: "./pglite",

} satisfies MeshCadConfig