// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Auth.sol";

contract ElectionManager {
    // Reference to the Auth contract
    Auth public auth;

    // Data structure for an election
    struct Election {
        uint id;
        string title;
        string description;
        address[] candidates;
        uint startTime;
        uint endTime;
        bool active;
    }

    mapping(uint => Election) public elections;
    uint public electionCount;

    // Events for creation and updates
    event ElectionCreated(
        uint indexed electionId,
        string title,
        uint startTime,
        uint endTime
    );
    event ElectionUpdated(uint indexed electionId, string title);

    // Set the Auth contract during deployment
    constructor(address authAddress) {
        auth = Auth(authAddress);
    }

    // Modifier to restrict access using the external Auth contract's admin check
    modifier onlyAdmin() {
        require(auth.isAdmin(msg.sender), "Caller is not an admin");
        _;
    }

    // Create a new election (only callable by an admin from the Auth contract)
    function createElection(
        string memory _title,
        string memory _description,
        address[] memory _candidates,
        uint _startTime,
        uint _endTime
    ) public onlyAdmin {
        require(_startTime < _endTime, "Start time must be less than end time");

        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            title: _title,
            description: _description,
            candidates: _candidates,
            startTime: _startTime,
            endTime: _endTime,
            active: true
        });

        emit ElectionCreated(electionCount, _title, _startTime, _endTime);
    }

    // Update an existing election (only callable by an admin)
    function updateElection(
        uint _electionId,
        string memory _title,
        string memory _description,
        address[] memory _candidates,
        uint _startTime,
        uint _endTime
    ) public onlyAdmin {
        require(elections[_electionId].id != 0, "Election does not exist");
        require(_startTime < _endTime, "Start time must be less than end time");

        Election storage election = elections[_electionId];
        election.title = _title;
        election.description = _description;
        election.candidates = _candidates;
        election.startTime = _startTime;
        election.endTime = _endTime;

        emit ElectionUpdated(_electionId, _title);
    }
}
