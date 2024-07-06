package gateway

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"math/big"
	"net/http"

	"fmt"
	"log"
	config "oracle_service/conf"
	"os"
	"strings"

	"github.com/astaxie/beego/logs"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

const (
	eventName = "Request"
)

type Listener struct {
	BoundContract  *bind.BoundContract
	Client         *ethclient.Client
	Config         *config.AppConfig
	EventChan      chan types.Log
	sub            ethereum.Subscription
	ContractAbi    abi.ABI
	OracleContract *bind.BoundContract
	Operator       *bind.TransactOpts
}

type RequestEvent struct {
	ReqId     *big.Int
	Requester common.Address
	Fee       *big.Int
	ReqData   []byte
}

type Response struct {
	ReqId  *big.Int
	Result string
}

func NewListener(conf *config.AppConfig) (*Listener, error) {
	// conn, err := ethclient.Dial(conf.Ip)
	cli, err := ethclient.Dial(conf.Ip)
	if err != nil {
		log.Fatal("[Start] ethclient dial failed: ", err.Error())
		return nil, err
	}
	abiBytes, err := os.ReadFile("./contract/ComputeOracle.abi")
	if err != nil || len(abiBytes) == 0 {
		return nil, fmt.Errorf("oracle abi file is not exist")
	}
	contractABI, err := abi.JSON(strings.NewReader(string(abiBytes)))
	if err != nil {
		return nil, err
	}
	pk, err := crypto.HexToECDSA(conf.PrivateKey)
	if err != nil {
		logs.Error("get privateKey failed...")
		return nil, err
	}
	// init BoundContract and accountOperator
	operator := bind.NewKeyedTransactor(pk)
	operator.GasLimit = 6000000
	// set gas price
	gasPrice, err := cli.SuggestGasPrice(context.Background())
	operator.GasPrice = gasPrice
	oracleContract := bind.NewBoundContract(common.HexToAddress(conf.ContractAddress), contractABI, cli, cli, cli)
	listener := &Listener{
		Config:        conf,
		Client:        cli,
		ContractAbi:   contractABI,
		Operator:      operator,
		BoundContract: oracleContract,
	}
	return listener, nil
}

func (l *Listener) subEvent() error {
	contractAddress := common.HexToAddress(l.Config.ContractAddress)

	query := ethereum.FilterQuery{
		Addresses: []common.Address{contractAddress},
		Topics: [][]common.Hash{
			// {l.ContractAbi.Events["Request"].ID()},
			// abi way is not work
			{crypto.Keccak256Hash([]byte("Request(uint256,address,uint256,bytes)"))},
		},
	}

	events := make(chan types.Log)
	sub, err := l.Client.SubscribeFilterLogs(context.Background(), query, events)
	if err != nil {
		return err
	}
	l.EventChan = events
	l.sub = sub
	return nil
}

func (l *Listener) Start() {
	if err := l.subEvent(); err != nil {
		log.Fatal(err)
	}
	fmt.Print("Start listen to oracle event...")
	l.dealEvent()

}

func (l *Listener) dealEvent() {
	for {
		select {
		case err := <-l.sub.Err():
			logs.Error(err)
			l.subEvent()
		case reqs := <-l.EventChan:
			l.FetchReqData(reqs)
			// log, err := vlog.MarshalJSON()
			// if err != nil {
			// 	logs.Error("dealEvent : decode the orign log fail!", err)
			// }
			// fmt.Print(string(log))
		}
	}
}

func (l *Listener) FetchReqData(reqs types.Log) error {
	request := &RequestEvent{}
	unpackData := make([]interface{}, len(reqs.Data))
	unpackData, err := l.ContractAbi.Unpack(eventName, reqs.Data)
	if err != nil {
		logs.Error("fetch events data failed....", err)
	}
	// check the params
	fmt.Println("reqId: ", unpackData[0])
	fmt.Println("requester address: ", unpackData[1])
	fmt.Println("fee: wei", unpackData[2])
	fmt.Println("reqData: ", unpackData[3])

	request.ReqId = unpackData[0].(*big.Int)
	request.Requester = unpackData[1].(common.Address)
	request.Fee = unpackData[2].(*big.Int)
	request.ReqData = unpackData[3].([]byte)
	l.CallApi(request, l.Config.ApiUrl)
	return nil
}

func (l *Listener) CallApi(request *RequestEvent, apiUrl string) error {
	reqData := request.ReqData
	// create a http request
	req, err := http.NewRequest("POST", l.Config.ApiUrl, bytes.NewBuffer(reqData))
	if err != nil {
		logs.Error("call api failed...")
		return err
	}
	req.Header.Set("Content-Type", "application/json;charset=utf-8")
	// dopost
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		logs.Error("call Api failed :", err)
		return err
	}
	result, err := parseRespone(resp)
	// parse resp
	// Callback and write into contract
	l.callBack(request, result)
	return nil
}

func (l *Listener) callBack(req *RequestEvent, res string) error {
	callbackFunctionName := "callBack"
	callBackData := []interface{}{
		req.ReqId,
		res,
	}
	// must set gasprice manaually
	tx, err := l.BoundContract.Transact(l.Operator, callbackFunctionName, callBackData...)
	if err != nil {
		logs.Error("callBack oracle failed casuse current user is not contract owner...", err)
		return err
	}
	//print tx info
	fmt.Println("tx hash is :", tx.Hash().Hex())
	fmt.Println("tx info is :", tx)
	return nil
}

func parseRespone(res *http.Response) (string, error) {
	body, err := io.ReadAll(res.Body)
	if err != nil {
		logs.Error("read HTTP response failed....", err)
		return "", err
	}
	fmt.Println("api response:", string(body))

	// convert jsondata
	var response map[string]json.Number
	if err := json.Unmarshal(body, &response); err != nil {
		log.Println("parse JSON response failed....", err)
		return "", err
	}
	//get result string
	resultValue := response["result"]
	// fmt.Println("resultValue :", resultValue.String())
	return resultValue.String(), nil
}
