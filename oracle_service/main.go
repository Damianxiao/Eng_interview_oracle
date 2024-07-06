package main

import (
	config "oracle_service/conf"
	"oracle_service/gateway"
)

func main() {
	config := config.GetConfig()
	if config == nil {
		panic("config file read fail...")
	}
	listener, err := gateway.NewListener(config)
	if err != nil {
		panic("initilize listener failed..." + err.Error())
	}
	listener.Start()
}
