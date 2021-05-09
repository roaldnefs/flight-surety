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

    // Modifier that requires the operational boolean variable to be true. This
    // is used on all state changing functions to pause the contract in the
    // event there is an issue that needs to be fixed.
    modifier requireIsOperational() {
        // TODO: check operational status of data contract
        require(isOperational(), "Contract is currently not operational");
        _;
    }

    // Modifier that requires the contract owner account to be the function
    // caller.
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
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
}
