import Web3 from "web3";
import flightSuretyAppArtifact from "../../build/contracts/FlightSuretyApp.json";
import Config from "./config.json";
import express from "express";


const app = express();
app.get('/api', (request, response) => {
    response.send({
        message: 'An API for use with your DApp!'
    })
});


export default app;