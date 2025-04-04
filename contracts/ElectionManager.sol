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
        string[] candidates; // Candidate names or numbers
        uint startTime;
        uint endTime;
        bool active;
    }

    mapping(uint => Election) public elections;
    uint public electionCount;

    // Mapping to track votes: electionId => candidate index => vote count
    mapping(uint => mapping(uint => uint)) public votes;
    // Mapping to track if an address has already voted in an election
    mapping(uint => mapping(address => bool)) public hasVoted;

    // Events for creation, votes, and updates
    event ElectionCreated(
        uint indexed electionId,
        string title,
        uint startTime,
        uint endTime
    );
    event ElectionUpdated(uint indexed electionId, string title);
    event Voted(
        uint indexed electionId,
        address indexed voter,
        uint candidateIndex
    );

    // Set the Auth contract during deployment
    constructor(address authAddress) {
        auth = Auth(authAddress);
    }

    // Modifier to restrict functions to admin-only
    modifier onlyAdmin() {
        require(auth.isAdmin(msg.sender), "Caller is not an admin");
        _;
    }

    // Create a new election (only callable by an admin)
    function createElection(
        string memory _title,
        string memory _description,
        string[] memory _candidates,
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
        string[] memory _candidates,
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

    // Vote for a candidate in an election (each address can vote only once per election)
    function vote(uint _electionId, uint _candidateIndex) public {
        Election storage election = elections[_electionId];
        require(
            block.timestamp >= election.startTime &&
                block.timestamp <= election.endTime,
            "Election is not active"
        );
        require(election.active, "Election is disabled");
        require(
            _candidateIndex < election.candidates.length,
            "Invalid candidate index"
        );
        require(!hasVoted[_electionId][msg.sender], "Already voted");

        votes[_electionId][_candidateIndex] += 1;
        hasVoted[_electionId][msg.sender] = true;

        emit Voted(_electionId, msg.sender, _candidateIndex);
    }

    // Compute the winner of an expired election (only callable by admin)
    // Returns the candidate name with the highest vote count
    function computeWinner(
        uint _electionId
    ) public view onlyAdmin returns (string memory winner) {
        Election storage election = elections[_electionId];
        require(block.timestamp > election.endTime, "Election is still active");

        uint highestVotes = 0;
        uint winnerIndex = 0;
        for (uint i = 0; i < election.candidates.length; i++) {
            if (votes[_electionId][i] > highestVotes) {
                highestVotes = votes[_electionId][i];
                winnerIndex = i;
            }
        }
        winner = election.candidates[winnerIndex];
    }
}
