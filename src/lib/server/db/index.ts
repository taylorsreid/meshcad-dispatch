import { getConfig, type MeshCadConfig } from '$lib/server/config';
import { PGlite } from '@electric-sql/pglite';
import { postgis } from '@electric-sql/pglite-postgis';
import { Kysely, type Generated, PGliteDialect } from 'kysely';

const config: MeshCadConfig = await getConfig()

export const db = new Kysely<KyselyDatabase>({
    dialect: new PGliteDialect({
        pglite: new PGlite(config.dbPath ?? "./pglite", {
            extensions: {
                postgis
            }
        })
    })
});

export const tablesWithPermissions = ["setting", "user", "role", "status", "unit", "voice_channel", "incident_type", "incident", "incident_log", "suggested_incident_log"] as const

interface UserTable {
    id: Generated<number>
    first_name: string
    last_name: string
    location: string | null
    email: string // unique
    email_verified: number
    image: string
    created_at: Date // not generated because better auth handles this
    updated_at: Date
    unit_id: number
}

// system table, no end user access
interface PermissionTable {
    id: Generated<number>
    name: string // unique
}

export interface SettingTable {
    key: string
    value: string | null
}

export interface RoleTable {
    id: Generated<number>
    name: string // unique
    image: string
    system: boolean // when true, record cannot be deleted
}

interface RoleHasPermissionTable {
    // composite unique on role_id and permission_id
    role_id: number // FK RoleTable
    permission_id: number // FK PermissionTable
    system: boolean // when true, cannot be updated or deleted
}

interface UserHasRoleTable {
    // composite unique on user_id and role_id
    user_id: number // FK UserTable
    role_id: number // FK RoleTable
}

interface StatusTable {
    id: Generated<number>
    name: string // unique
    color: string | null
    system: boolean
}

export interface UnitTable {
    id: Generated<number>
    name: string // unique
    data_adapter: string | null
    data_address: string | null // unique
    status_id: number // FK StatusTable
    role_id: number // FK RoleTable
    // user_id: number | null // FK UserTable, unique if not null
    incident_id: number | null
}

interface VoiceChannelTable {
    id: Generated<number>
    name: string // unique
}

interface IncidentTypeTable {
    id: Generated<number>
    name: string // unique
}

// suggested voice channels for incident type
interface IncidentTypeHasVoiceChannelTable {
    incident_type_id: number // FK IncidentTypeTable
    voice_channel_id: number // FK VoiceChannelTable
}

// suggested roles for the incident type
interface IncidentTypeHasRoleTable {
    incident_type_id: number // FK IncidentTypeTable
    role_id: number // FK RoleTable
}

interface IncidentTable {
    id: Generated<number>
    priority: number | null
    latitude: number | null
    longitude: number | null
    address: string | null
    voice_channel_id: number | null
    sent_at: Date | null // not null only if created by a client
    created_at: Generated<Date>
    closed_at: Date | null // null if still ongoing
    incident_type_id: number // FK IncidentTypeTable
    created_by_user_id: number  // FK UserTable, user created by
    created_by_unit_id: number | null // FK UnitTable, assigned user's unit at the time, null if dispatcher
}

interface IncidentLogTable {
    id: Generated<number>
    created_at: Generated<Date>
    text: string
    send_on_mesh: boolean
    sent_on_mesh: boolean // disable UI "sent" checkbox as soon as its checked and send
    incident_id: number // FK IncidentTable
    created_by_user_id: number // FK UserTable, user created by
    created_by_unit_id: number | null // FK UnitTable, assigned user's unit at the time, null if dispatcher
}

interface SuggestedIncidentLogTable {
    id: Generated<number>
    text: string
    send_on_mesh: boolean
}

interface IncidentTypeHasSuggestedIncidentLogTable {
    incident_type_id: number // FK IncidentTypeTable
    suggested_incident_log_id: number // FK SuggestedIncidentLogTable
}

export interface KyselyDatabase {
    // direct tables
    setting: SettingTable
    user: UserTable
    permission: PermissionTable
    role: RoleTable
    status: StatusTable
    unit: UnitTable
    voice_channel: VoiceChannelTable
    incident_type: IncidentTypeTable
    incident: IncidentTable
    incident_log: IncidentLogTable
    suggested_incident_log: SuggestedIncidentLogTable

    // pivot tables
    role_has_permission: RoleHasPermissionTable
    user_has_role: UserHasRoleTable
    incident_type_has_voice_channel: IncidentTypeHasVoiceChannelTable
    incident_type_has_role: IncidentTypeHasRoleTable
    incident_type_has_suggested_incident_log: IncidentTypeHasSuggestedIncidentLogTable
}