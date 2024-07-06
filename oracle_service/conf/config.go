package config

import (
	"fmt"

	"github.com/astaxie/beego"
)

// Beego : dir must be conf , file name must be app.conf
var config *AppConfig

type AppConfig struct {
	Ip              string
	ContractAddress string
	ApiUrl          string
	PrivateKey      string
}

func NewConfig() error {

	contractAddress := beego.AppConfig.String("ContractAddress")
	if len(contractAddress) == 0 {
		return fmt.Errorf("ContractAddress is nil")
	}
	ip := beego.AppConfig.String("ipAddress")
	if len(ip) == 0 {
		return fmt.Errorf("IP is nil")
	}
	api := beego.AppConfig.String("ApiUrl")
	if len(api) == 0 {
		return fmt.Errorf("apiurl is nil")
	}
	pk := beego.AppConfig.String("PrivateKey")
	if len(pk) == 0 {
		return fmt.Errorf("privateKey is nil")
	}
	config = &AppConfig{
		ContractAddress: contractAddress,
		Ip:              ip,
		ApiUrl:          api,
		PrivateKey:      pk,
	}
	return nil
}

func GetConfig() *AppConfig {
	if config == nil {
		NewConfig()
		return config
	}
	return config
}
