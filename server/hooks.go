package main

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/pocketbase/pocketbase/core"
)

func useNumericIds(e *core.RecordEvent) error {

	var maxIdStr string
	err := app.DB().Select("id").From(e.Record.Collection().Name).OrderBy("CAST(id AS UNSIGNED) DESC").Limit(1).Row(&maxIdStr)

	nextId := 1
	if err == nil && maxIdStr != "" {
		// Convert current max to integer and increment
		parsedID, err := strconv.Atoi(maxIdStr)
		if err == nil {
			nextId = parsedID + 1
		}
	} else if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	// 2. Set the new incremented ID
	// e.Record.Set("id", fmt.Sprintf("%d", nextId))
	e.Record.Set("id", strconv.Itoa(nextId))

	return e.Next()
}

func restartRadioOnUpdate(e *core.RecordEvent) error {
		if e.Record.GetBool("selected") {
			radio.Close()
			radioRunning = false
			err := startRadio()
			if err != nil {
				log.Println("FAILED TO RESTART RADIO: " + err.Error()) // log but don't panic because server can still run without a radio
			}
		}
		return e.Next()
	}

func onServe(se *core.ServeEvent) error {
		logFile, err := os.OpenFile("server.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err == nil {
			log.SetOutput(logFile)
		} // else we'll just write to stdErr

		// load up the reusable collection objects
		userCollection, err = app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}
		incidentCollection, err = app.FindCollectionByNameOrId("incidents")
		if err != nil {
			return err
		}
		incidentEventCollection, err = app.FindCachedCollectionByNameOrId("incidentEvents")
		if err != nil {
			return err
		}

		go usedMeshPacketIds.Start()

		err = startRadio()
		if err != nil {
			log.Println("FAILED TO START RADIO: " + err.Error()) // log but don't panic because server can still run without a radio
		}

		// routes in addition to standard CRUD routes
		se.Router.GET("/api/healthRadio", func(e *core.RequestEvent) error {
			return e.JSON(http.StatusOK, map[string]any{
				"myInfo": myInfo,
				"info":   nodeInfo,
				"config": config,
			})
		}) //.Bind(apis.RequireAuth()) // TODO: reenable auth for prod

		return se.Next()
	}