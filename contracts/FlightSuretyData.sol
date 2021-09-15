// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    // Allow SafeMath functions to be accaled fo all unint256 types.
    using SafeMath for uint256;

    // Account used to deploy contract.
    address private contractOwner;
    // Blocks all state changes throughout the contract if set to false.
    bool private operational;
    // Holds the authorized callers.
    mapping(address => bool) authorized;

    // Airline related resources
    struct Airline {
        uint id;
        bool isVoter;
    }
    uint public airlineCount;
    mapping(address => Airline) public airlines;

    // Flight related resources

    // Insurance related resources

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

    modifier requireAuthorized() {
        require(authorized[msg.sender] == true, "Caller is not authorized");
        _;
    }

    // Modifier that requires the airline to be registered.
    modifier requireAirlineRegistered(address _address) {
        require(airlines[_address].id > 0, "Airline with given address is not registered");
        _;
    }

    // Modifier that requires the airline to not yet be registered.
    modifier requireAirlineNotRegistered(address _address) {
        require(airlines[_address].id == 0, "Airline with given address is already registered");
        _;
    }

    constructor() payable {
        contractOwner = msg.sender;
        operational = true;
        airlineCount = 0;

        // Authorize the data contract and contract owner to call functions
        // that are public but should't be called by non-authorized callers.
        authorized[address(this)] = true;
        authorized[contractOwner] = true;

        // First airline is registered when contract is deployed.
        registerAirline(contractOwner, true);
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

    function setAuthorizedCaller(address _address, bool isAuthorized)
    requireIsOperational
    requireContractOwner
    public {
        authorized[_address] = isAuthorized;
    }

    // Add an airline to the registration queue.
    function registerAirline(address _address, bool isVoter)
    requireIsOperational
    requireAuthorized
    requireAirlineNotRegistered(_address)
    public {
        // Increment the airline count.
        airlineCount = airlineCount.add(1);
        // Add the new airline to the airlines mapping.
        airlines[_address] = Airline({id: airlineCount, isVoter: isVoter});
    }

    // Fetch airline details using an airline address.
    function getAirline(address _address) 
    requireIsOperational
    requireAirlineRegistered(_address)
    public view returns (
        address airlineAddress,
        uint id,
        bool isVoter
    ) {
        airlineAddress = _address;
        id = airlines[_address].id;
        isVoter = airlines[_address].isVoter;

        return (airlineAddress, id, isVoter);
    }

    // Check if an airline has paid the registration fee.
    function isFundedAirline(address _address) 
    requireIsOperational
    requireAirlineRegistered(_address)
    public view returns (bool isFunded) {
        // Retrieve airline details.
        (,, bool isVoter) = getAirline(_address);
        // Only funded airlines can become voters.
        isFunded = isVoter;
        return (isFunded);
    }

    // Update the airline details.
    function updateAirline(address _address, bool isVoter)
    requireIsOperational
    requireAuthorized
    requireAirlineRegistered(_address)
    public {
        airlines[_address].isVoter = isVoter;
    }

    // Fetch the number of registered airlines.
    function getAirlineCount()
    requireIsOperational
    public view returns (uint) {
        return (airlineCount);
    }

    // Fallback function for receiving Ether.
    receive() external payable {}
}
