<a href="https://github.com/roaldnefs/flight-surety" style="color: black;">
    <h1 align="center">Flight Surety</h1>
</a>
<p align="center">
    <a href="https://raw.githubusercontent.com/roaldnefs/flight-surety/main/LICENSE">
        <img src="https://img.shields.io/github/license/roaldnefs/flight-surety?color=blue&style=for-the-badge"
            alt="GitHub license">
    </a>
    <a href="https://github.com/roaldnefs/flight-surety/graphs/contributors">
        <img src="https://img.shields.io/github/contributors/roaldnefs/flight-surety?style=for-the-badge&color=blue"
            alt="GitHub contributors">
    </a>
    </br>
    <b>Flight Surety</b> is a flight delay insurance Dapp with multiple smart contracts which are autonomously triggered by external sources, and which handle payments based on flight delay scenarios.
    <br />
    <a href="https://github.com/roaldnefs/flight-surety/blob/main/README.md#getting-strated"><strong>Quick Start »</strong></a>
    <br />
    <a href="https://github.com/roaldnefs/flight-surety/issues/new?title=Bug%3A">Report Bug</a>
    ·
    <a href="https://github.com/roaldnefs/flight-surety/issues/new?&title=Feature+Request%3A">Request Feature</a>
</p>

## Introduction
Flight Surety is a flight delay insurance Dapp with multiple smart contracts which are autonomously triggered by external sources, and which handle payments based on flight delay scenarios. This repository includes:

* Multiple smart contracts written in Solidity.
* Automated contract testing using Mocha and Chai.
* ...

| ⚠️ **Notice**: For development purposes only! |
| --- |

## Prerequisites
Before running the Flight Surety project make sure the following dependencies are installed:

* Node v16.1.0
* Ganache v2.5.4
* Solidity
* Truffle v5.3.4
* Web3.js

## Getting Started
After installing all the [prerequisites](#prerequisites), the following commands can be used to setup and start the project locally:

1. Start by cloning the project using **git** (_or download and extract the [ZIP file](https://github.com/roaldnefs/flight-surety/archive/refs/heads/main.zip) from GitHub_):
    ```console
    git clone git@github.com:roaldnefs/flight-surety.git
    cd flight-surety
    ```
1. Install dependencies using **npm**:
    ```console
    npm install
    ```
1. Setup **Metamask** and configure a local network using the following settings: 
    ```
    Network Name: Localhost 8545
    RPC URL: http://localhost:8545
    Chain ID: 1337
    Currency Symbol: ETH
    ```
1. Store the **Metamask** mnemonic in the root of the project in a file called `.secret`.
1. Start **ganache-cli** in a separate terminal to run a local blockchain using the same mnemonic as **Metamask**:
    ```console
    ganache-cli -m "$(cat .secret)" -a 50
    ```
    The `-a` flag allows you to specify the number of accounts to generate at setup.
1. Run the test using **truffle** to verify the smart contracts are functioning as expected:
    ```console
    truffle test --network development
    ```
1. If all tests are passing, the contract can be compiled and migrated using **truffle**:
   ```console
   truffle compile
   truffle migrate --network development
   ```
   The contracts are now deployed on the local blockchain and the required configuration files and artifacts have been created automatically.
1. The front-end application (_Dapp_) can be started using the following **npm** command in a separate terminal:
   ```console
   npm run dapp
   ```
1. The back-end server (_oracles and API_) can be started using the following **npm** command in a separate terminal:
   ```console
   npm run server
   ```
To interact with the smart contract and Dapp open [http://localhost:8000/](http://localhost:8000/) in a browser with the **Metamask** extension installed and configured for the local blockchain.

## Resources
Resources used for developing the project:

* ...


## Acknowledgement
The project is heavily based upon [FlightSurety](https://github.com/udacity/FlightSurety), with the modified work by [Roald Nefs](https://github.com/roaldnefs) as part of the [Udacity Blockchain Developer Nanodegree Program](https://www.udacity.com/course/blockchain-developer-nanodegree--nd1309).