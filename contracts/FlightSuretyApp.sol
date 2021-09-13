// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./FlightSuretyData.sol";

contract FlightSuretyApp {
    // Allow SafeMath functions to be accaled fo all unint256 types.
    using SafeMath for uint256;

    FlightSuretyData flightSuretyData;

    // Account used to deploy contract.
    address private contractOwner;

    // Holds the thresshold for when any subsequent airline requires
    // multi-party consensus on registration.
    uint8 private constant AIRLINE_CONSENSUS_THRESSHOLD = 4;

    // Flight satus codes.
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    // Modifier that requires the operational boolean variable to be true. This
    // is used on all state changing functions to pause the contract in the
    // event there is an issue that needs to be fixed.
    modifier requireIsOperational() {
        // Check operational status of data contract.
        require(isOperational(), "Contract is currently not operational");
        _;
    }

    // Modifier that requires the contract owner account to be the function
    // caller.
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // Modifier that requires the caller ot be a registered airline.
    modifier requireAirline() {
        // Lookup the airline using the caller address, if it doens't exits it
        // results in an error.
        (address airlineAddres, uint id, bool isAccepted) = flightSuretyData.getAirline(msg.sender);
        _;
    }

    constructor(FlightSuretyData dataContract) {
        contractOwner = msg.sender;
        flightSuretyData = dataContract;
    }

    // Get operating status of contract.
    function isOperational() public view returns(bool) {
        return flightSuretyData.isOperational();
    }

    // Register a new airline.
    function registerAirline(address _address)
    requireIsOperational
    requireAirline
    // TODO: check if caller had paid the registration fee
    // TODO: check if caller has not voted yet
    public {
        // Retrieve current number of registered airlines.
        uint count = flightSuretyData.getAirlineCount();

        // Check wether or not consesus is required.
        if (count < AIRLINE_CONSENSUS_THRESSHOLD) {
            flightSuretyData.registerAirline(_address, false);
            // TODO: emit event to let DApp know a new airline was registered
        } else {
            // TODO: register new airline
        }
    }
}
