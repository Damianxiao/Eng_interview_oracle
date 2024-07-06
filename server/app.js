import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import {
    parse,
    re
} from 'mathjs';
import {
    request
} from './util/oracle.js';
import {parseExpression} from './util/ast.js'
import {fetchContractData,queryRequest} from './util/oracle.js'
import axios from 'axios'
import { any } from 'hardhat/internal/core/params/argumentTypes.js';

dotenv.config();


const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors());
app.use(express.json())

app.post('/requests',async(req,res) =>{
    const { reqId } = req.body
    const json = await queryRequest(reqId)
    console.log(json)
    res.json(json)
} )

app.get('/contract', async (req, res) => {
    const json = await fetchContractData()
    console.log(json)
    res.json(json)
})


app.post('/compute', async (req, res) => {
    const {
        nums,
        expression
    } = req.body;
    if (!expression) {
        return res.status(400).json({
            error: 'Expression is null!'
        });
    }

    const result = parseExpression(nums, expression);
    console.log(JSON.stringify(result, null, 2))
    // console.log(process.env.ApiUrl)
    const response = await axios.post(process.env.ApiUrl, result, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    });
    // console.log(JSON.stringify(response.body, null, 2))
    // console.log(JSON.stringify(response.data, null, 2))
    if (response.error == null) {
        const resultString = JSON.stringify(result);
        const encoder = new TextEncoder();
        const bytes = encoder.encode(resultString)
        await request(bytes)
        res.json({
            flag: "succses",
            data: "compute oracle done... you can check it on blockchain network"
        });
    }else{
        res.json({
            flag: "error",
            data: "Can not parse expression !please type again"
        })
    }
    // call the oracle 
})

const HOST = process.env.HOST
const PORT = process.env.PORT

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}`)
})