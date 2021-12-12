import Web3 from "web3";
import FlightSuretyAppArtifact from "../../build/contracts/FlightSuretyApp.json";
import FlightSuretyDataArtifact from "../../build/contracts/FlightSuretyData.json";
import Config from "./config.json";
import express from "express";


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
const flightSuretyApp = new web3.eth.Contract(FlightSuretyAppArtifact.abi, config.appAddress);
const flightSuretyData = new web3.eth.Contract(FlightSuretyDataArtifact.abi, config.dataAddress);

const NUMBER_OF_ORACLES = 20;

const Server = {
    oracles: [],
    flights: [],
    states: {
        0: 'Unknown',
        10: 'On Time',
        20: 'Late Airline',
        30: 'Late Weather',
        40: 'Late Technical',
        50: 'Late Other'
    },

    init: async function(numberOfOracles) {
        // TODO: add event listeners

        const ORACLE_REGISTRATION_FEE = await flightSuretyApp.methods.getOracleRegistrationFee().call();
        console.log('ORACLE_REGSITRATION_FEE: ' + ORACLE_REGISTRATION_FEE);

    },
};


// Upon startup, 20+ oracles are registered and their assigned indexes are
// persisted in memory.
Server.init(NUMBER_OF_ORACLES);


const app = express();
app.get('/flights', (request, response) => {
    response.json(Server.flights)
});


export default app;