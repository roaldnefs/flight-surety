// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    // Allow SafeMath functions to be accaled fo all unint256 types.
    using SafeMath for uint256;

    // Account used to deploy contract.
    address private contractOwner;
    // Blocks all state changes throughout the contract if set to false.
    bool private operational = true;

    // Modifier that requires the operational boolean variable to be true. This
    // is used on all state changing functions to pause the contract in the
    // event there is an issue that needs to be fixed.
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;
    }

    // Modifier that requires the contract owner account to be the function
    // caller.
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    constructor() {
        contractOwner = msg.sender;
    }

    // Get operating status of contract.
    function isOperational() public view returns(bool) {
        return operational;
    }

    // Set contract operating status. When operational mode is disabled, all
    // write transactions except for this one will fail.
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

}
