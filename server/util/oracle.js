import {
    ethers,
    JsonRpcProvider,
    parseEther
} from 'ethers';
import fs from 'fs'
import dotenv from 'dotenv';
import { min } from 'mathjs';
dotenv.config();


const value = 0.01
const provider = new JsonRpcProvider("http://127.0.0.1:8545/");
const signer = await provider.getSigner();
const abi = JSON.parse(fs.readFileSync('./abi/oracleCompute.json'))
const contractAddress = process.env.CONTRACTADDRESS;
const contract = new ethers.Contract(contractAddress, abi, signer);


export async function request(reqData) {
    const options = {
        value: parseEther(value.toString()) // Convert to wei if needed
    };
    const result = await contract.request(reqData, options);
    console.log('request call:', result.hash);
    return result
}


export async function queryRequest(reqId) {
    try {
        const request = await contract.requests(reqId);
        // console.log(`Request ID: ${reqId}`);
        // console.log(`Fee: ${request.fee.toString()}`);
        // // console.log(`Request Data: ${ethers.utils.toUtf8String(request.reqData)}`);
        // console.log(`Result: ${request.result}`);
        const json = {
            reqId:reqId,
            data:request.reqData,
            result:request.result
        }
        return json
    } catch (error) {
        console.error("Error querying request:", error);
    }
}


export async function fetchContractData() {

    const minFee = await contract.MIN_FEE();
    console.log('MIN_FEE:', minFee.toString());

    const ownerAddress = await contract.owner();
    console.log('Owner:', ownerAddress);

    const count = await contract.requestCount();
    console.log('Request Count:', count.toString());
    const json = {
        minFee : minFee.toString(),
        ownerAddress: ownerAddress,
        reqCount: count.toString()
    }
    return json

}