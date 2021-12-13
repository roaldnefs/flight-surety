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
const NUMBER_OF_ACCOUNTS = 50;

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

        const oracleRegistrationFee = await flightSuretyApp.methods.getOracleRegistrationFee().call();

        // Set the oracles to the last accounts available in web3.
        this.oracles = (await web3.eth.getAccounts()).slice(NUMBER_OF_ACCOUNTS - numberOfOracles);
        // Register each of the oracles.
        this.oracles.forEach(async account => {
            try {
                await flightSuretyApp.methods.registerOracle().send({
                    from: account,
                    value: oracleRegistrationFee,
                    gas: 3000000
                });
            } catch (error) {
                console.log(error.message);
            } finally {
                console.log(`Oracle registered using address '${account}'`);
            }
        });

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