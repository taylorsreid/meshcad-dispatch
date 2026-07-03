package migrations

import (
	"fmt"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func permissionString(permissionName string) *string {
	return new(fmt.Sprintf("@request.auth.roles.permissions.name ?= \"%s\"", permissionName))
}

func init() {
	m.Register(func(app core.App) error {
		// permissions
		permissions := core.NewBaseCollection("permissions")
		permissions.Fields.Add(
			&core.TextField{
				Name:     "name",
				Required: true,
			},
		)
		permissions.AddIndex("permissionsNameUnique", true, "name", "")
		err := app.Save(permissions)
		if err != nil {
			return err
		}

		//
		tablesWithPermissions := []string{"radios", "roles", "suggestedUserStatuses", "users", "incidentTypes", "incidentEvents", "suggestedIncidentEvents", "incidents"}
		permissionIds := make(map[string]string, len(tablesWithPermissions))
		for _, v := range tablesWithPermissions {

			p := core.NewRecord(permissions)
			p.Set("name", "create "+v)
			err = app.Save(p)
			if err != nil {
				return err
			}
			permissionIds["create "+v] = p.Id

			p = core.NewRecord(permissions)
			p.Set("name", "list "+v)
			err = app.Save(p)
			if err != nil {
				return err
			}
			permissionIds["list "+v] = p.Id

			p = core.NewRecord(permissions)
			p.Set("name", "view "+v)
			err = app.Save(p)
			if err != nil {
				return err
			}
			permissionIds["view "+v] = p.Id

			p = core.NewRecord(permissions)
			p.Set("name", "update "+v)
			err = app.Save(p)
			if err != nil {
				return err
			}
			permissionIds["update "+v] = p.Id

			p = core.NewRecord(permissions)
			p.Set("name", "delete "+v)
			err = app.Save(p)
			if err != nil {
				return err
			}
			permissionIds["delete "+v] = p.Id
		}

		// radios
		// TODO: REFACTOR TO REMOVE RADIOS FROM DB
		radios := core.NewBaseCollection("radios")
		var minChannelIndex float64 = 0
		var maxChannelIndex float64 = 7
		radios.Fields.Add(
			&core.TextField{
				Name:     "name",
				Required: true,
			},
			&core.BoolField{
				Name: "selected",
			},
			&core.TextField{
				Name:     "path",
				Required: true,
			},
			&core.SelectField{
				Name:      "modemMode",
				Values:    []string{"lf", "ls", "vls", "ms", "mf", "sl", "sf", "lm"},
				MaxSelect: 1,
			},
			&core.NumberField{
				Name:    "channelIndex",
				Min:     &minChannelIndex,
				Max:     &maxChannelIndex,
				OnlyInt: true,
			},
		)
		radios.CreateRule = permissionString("create radios")
		radios.ListRule = permissionString("list radios")
		radios.ViewRule = permissionString("view radios")
		radios.UpdateRule = permissionString("update radios")
		radios.DeleteRule = permissionString("delete radios")
		radios.AddIndex("radiosNameUnique", true, "name", "")
		radios.AddIndex("radiosSelectedUnique", true, "selected", "")
		err = app.Save(radios)
		if err != nil {
			fmt.Println(1)
			return err
		}

		// roles
		roles := core.NewBaseCollection("roles")
		roles.Fields.Add(
			&core.TextField{
				Name:     "name",
				Required: true,
			},
			&core.FileField{
				Name: "icon",
				// Thumbs: , // TODO: figure out optimal dimensions on the frontend
			},
			&core.RelationField{
				Name:         "permissions",
				CollectionId: permissions.Id,
				MinSelect:    0,
				MaxSelect:    999,
			},
		)
		roles.CreateRule = permissionString("create roles")
		roles.ListRule = permissionString("list roles")
		roles.ViewRule = permissionString("view roles")
		roles.UpdateRule = permissionString("update roles")
		roles.DeleteRule = permissionString("delete roles")
		roles.AddIndex("roleNameUnique", true, "name", "")
		err = app.Save(roles)
		if err != nil {
			fmt.Println(2)
			return err
		}

		// record := core.NewRecord(roles)
		// record.Set("name", "Admin")
		// record.Set("permissions", slices.Collect(maps.Values(permissionIds))) // all permissions
		// err = app.Save(record)
		// if err != nil {
		// 	fmt.Println(3)
		// 	return err
		// }

		record := core.NewRecord(roles)
		record.Set("name", "Dispatcher")
		record.Set("permissions", []string{ // TODO: fill out
			// permissionIds["create roles"],
			permissionIds["list roles"],
			permissionIds["view roles"],
			// permissionIds["update roles"],
			// permissionIds["delete roles"],

			// permissionIds["create suggestedUserStatuses"],
			permissionIds["list suggestedUserStatuses"],
			permissionIds["view suggestedUserStatuses"],
			// permissionIds["update suggestedUserStatuses"],
			// permissionIds["delete suggestedUserStatuses"],

			// permissionIds["create users"], // anyone can do this
			permissionIds["list users"],
			permissionIds["view users"],
			// permissionIds["update users"],
			// permissionIds["delete users"],

			// permissionIds["create incidentTypes"],
			permissionIds["list incidentTypes"],
			permissionIds["view incidentTypes"],
			// permissionIds["update incidentTypes"],
			// permissionIds["delete incidentTypes"],

			permissionIds["create incidentEvents"],
			permissionIds["list incidentEvents"],
			permissionIds["view incidentEvents"],
			// permissionIds["update incidentEvents"],
			// permissionIds["delete incidentEvents"],

			// permissionIds["create suggestedIncidentEvents"],
			permissionIds["list suggestedIncidentEvents"],
			permissionIds["view suggestedIncidentEvents"],
			// permissionIds["update suggestedIncidentEvents"],
			// permissionIds["delete suggestedIncidentEvents"],

			permissionIds["create incidents"],
			permissionIds["list incidents"],
			permissionIds["view incidents"],
			permissionIds["update incidents"],
			// permissionIds["delete incidents"],
		})
		err = app.Save(record)
		if err != nil {
			fmt.Println(4)
			return err
		}

		// suggested user statuses
		suggestedUserStatuses := core.NewBaseCollection("suggestedUserStatuses")
		suggestedUserStatuses.Fields.Add(
			&core.TextField{
				Name:     "name",
				Required: true,
			},
		)
		suggestedUserStatuses.CreateRule = permissionString("create suggestedUserStatuses")
		suggestedUserStatuses.ListRule = permissionString("list suggestedUserStatuses")
		suggestedUserStatuses.ViewRule = permissionString("view suggestedUserStatuses")
		suggestedUserStatuses.UpdateRule = permissionString("update suggestedUserStatuses")
		suggestedUserStatuses.DeleteRule = permissionString("delete suggestedUserStatuses")
		suggestedUserStatuses.AddIndex("suggestedUserStatusesNameUnique", true, "name", "")
		err = app.Save(suggestedUserStatuses)
		if err != nil {
			fmt.Println(5)
			return err
		}

		record = core.NewRecord(suggestedUserStatuses)
		record.Set("name", "available")
		err = app.Save(record)
		if err != nil {
			fmt.Println(6)
			return err
		}
		record = core.NewRecord(suggestedUserStatuses)
		record.Set("name", "offline")
		err = app.Save(record)
		if err != nil {
			fmt.Println(7)
			return err
		}

		// users
		users, _ := app.FindCollectionByNameOrId("users")
		users.Fields.Add(
			&core.RelationField{
				Name:          "roles",
				CollectionId:  roles.Id,
				CascadeDelete: true,
				MinSelect:     1,
				MaxSelect:     999,
				Required:      true,
			},
			&core.TextField{
				Name:     "status",
				Required: true,
			},
			&core.NumberField{
				Name:     "meshAddress",
				Required: false,
				OnlyInt:  true,
			},
		)
		users.CreateRule = new("@request.body.roles:isset = false") // users cannot set their own roles to avoid privilege escalation
		users.ListRule = permissionString("list users")
		users.ViewRule = new("id = @request.auth.id || @request.auth.roles.permissions.name ?= \"view users\"")
		users.UpdateRule = new("(id = @request.auth.id && @request.body.roles:isset = false) || @request.auth.roles.permissions.name ?= \"update users\"")
		users.DeleteRule = permissionString("delete users")
		users.AddIndex("usersmeshAddressUnique", true, "meshAddress", "meshAddress != NULL")
		err = app.Save(users)
		if err != nil {
			fmt.Println(8)
			return err
		}

		// incident types
		incidentTypes := core.NewBaseCollection("incidentTypes")
		incidentTypes.Fields.Add(
			&core.TextField{
				Name:     "name",
				Required: true,
			},
			&core.FileField{
				Name: "icon",
				// Thumbs: , // TODO:
			},
			&core.RelationField{
				Name:          "suggestedRoles",
				CollectionId:  roles.Id,
				CascadeDelete: true,
				MinSelect:     0,
				MaxSelect:     999,
				Required:      false,
			},
		)
		incidentTypes.CreateRule = permissionString("create incidentTypes")
		incidentTypes.ListRule = permissionString("list incidentTypes")
		incidentTypes.ViewRule = permissionString("view incidentTypes")
		incidentTypes.UpdateRule = permissionString("update incidentTypes")
		incidentTypes.DeleteRule = permissionString("delete incidentTypes")
		incidentTypes.AddIndex("incidentTypeNameUnique", true, "name", "")
		err = app.Save(incidentTypes)
		if err != nil {
			fmt.Println(9)
			return err
		}

		// incidentEvents
		incidentEvents := core.NewBaseCollection("incidentEvents")
		incidentEvents.Fields.Add(
			&core.TextField{
				Name:     "title",
				Required: true,
			},
			&core.TextField{
				Name:     "details",
				Required: false,
			},
			&core.RelationField{
				Name:         "createdBy",
				CollectionId: users.Id,
				MinSelect:    1,
				MaxSelect:    1,
				Required:     true,
			},
			&core.DateField{
				Name:     "sentAt",
				Required: true,
			},
			&core.AutodateField{
				Name:     "createdAt",
				OnCreate: true,
			},
			&core.RelationField{
				Name:         "affectedUser",
				CollectionId: users.Id,
				MinSelect:    1,
				MaxSelect:    1,
			},
		)
		incidentEvents.CreateRule = permissionString("create incidentEvents")
		incidentEvents.ListRule = permissionString("list incidentEvents")
		incidentEvents.ViewRule = permissionString("view incidentEvents")
		incidentEvents.UpdateRule = permissionString("update incidentEvents")
		incidentEvents.DeleteRule = permissionString("delete incidentEvents")
		err = app.Save(incidentEvents)
		if err != nil {
			fmt.Println(10)
			return err
		}

		// suggested incident events
		suggestedIncidentEvents := core.NewBaseCollection("suggestedIncidentEvents")
		suggestedIncidentEvents.Fields.Add(
			&core.TextField{
				Name:     "title",
				Required: true,
			},
		)
		suggestedIncidentEvents.CreateRule = permissionString("create suggestedIncidentEvents")
		suggestedIncidentEvents.ListRule = permissionString("list suggestedIncidentEvents")
		suggestedIncidentEvents.ViewRule = permissionString("view suggestedIncidentEvents")
		suggestedIncidentEvents.UpdateRule = permissionString("update suggestedIncidentEvents")
		suggestedIncidentEvents.DeleteRule = permissionString("delete suggestedIncidentEvents")
		suggestedIncidentEvents.AddIndex("suggestedIncidentEventsTitleUnique", true, "title", "")
		err = app.Save(suggestedIncidentEvents)
		if err != nil {
			fmt.Println(11)
			return err
		}

		record = core.NewRecord(suggestedIncidentEvents)
		record.Set("title", "dispatched")
		err = app.Save(record)
		if err != nil {
			return err
		}
		record = core.NewRecord(suggestedIncidentEvents)
		record.Set("title", "acknowledged")
		err = app.Save(record)
		if err != nil {
			return err
		}
		record = core.NewRecord(suggestedIncidentEvents)
		record.Set("title", "arrived")
		err = app.Save(record)
		if err != nil {
			return err
		}
		record = core.NewRecord(suggestedIncidentEvents)
		record.Set("title", "information")
		app.Save(record)
		record = core.NewRecord(suggestedIncidentEvents)
		record.Set("title", "cleared")
		err = app.Save(record)
		if err != nil {
			return err
		}

		// incidents
		incidents := core.NewBaseCollection("incidents")
		incidents.Fields.Add(
			&core.RelationField{
				Name:         "incidentType",
				CollectionId: incidentTypes.Id,
				MinSelect:    1,
				MaxSelect:    1,
				Required:     true,
			},
			&core.NumberField{
				Name:     "priority",
				OnlyInt:  true,
				Required: false,
			},
			&core.GeoPointField{
				Name:     "coordinates",
				Required: false,
			},
			&core.TextField{
				Name:     "address",
				Required: false,
			},
			&core.RelationField{
				Name:         "createdBy",
				CollectionId: users.Id,
				MinSelect:    1,
				MaxSelect:    1,
				Required:     true,
			},
			&core.DateField{
				Name:     "sent",
				Required: false,
			},
			&core.DateField{
				Name:     "closed",
				Min:      incidents.Created,
				Required: false,
			},
			&core.RelationField{
				Name:         "events",
				CollectionId: incidentEvents.Id,
				MinSelect:    0,
				MaxSelect:    999_999,
			},
			&core.RelationField{
				Name:         "assigned",
				CollectionId: users.Id,
				MinSelect:    0,
				MaxSelect:    999_999,
			},
			&core.JSONField{
				Name: "assignedRole",

			},
		)
		incidents.CreateRule = permissionString("create incidents")
		incidents.ListRule = permissionString("list incidents")
		incidents.ViewRule = permissionString("view incidents")
		incidents.UpdateRule = permissionString("update incidents")
		incidents.DeleteRule = permissionString("delete incidents")
		err = app.Save(incidents)
		if err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		// add down queries...

		return nil
	})
}
