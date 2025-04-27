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
    // Track which elections have been published…
mapping(uint => bool) public resultsPublished;

// Keep the on-chain copy of the final tally
struct PublishedResult {
  string[]  candidates;
  uint256[] counts;
  bool      isDraw;
  string    winner;
}
mapping(uint => PublishedResult) public publishedResults;

// Emit once, so UIs can index/filter by log
event ResultsPublished(
  uint indexed electionId,
  string[]  candidates,
  uint256[] counts,
  bool      isDraw,
  string    winner
);


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

        Election storage e = elections[_electionId];
        e.title = _title;
        e.description = _description;
        e.candidates = _candidates;
        e.startTime = _startTime;
        e.endTime = _endTime;

        emit ElectionUpdated(_electionId, _title);
    }

    // Vote for a candidate in an election (each address can vote only once per election)
    function vote(uint _electionId, uint _candidateIndex) public {
        Election storage e = elections[_electionId];
        require(
            block.timestamp >= e.startTime && block.timestamp <= e.endTime,
            "Election is not active"
        );
        require(e.active, "Election is disabled");
        require(
            _candidateIndex < e.candidates.length,
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
        Election storage e = elections[_electionId];
        require(block.timestamp > e.endTime, "Election is still active");

        uint highestVotes = 0;
        uint winnerIndex = 0;
        for (uint i = 0; i < e.candidates.length; i++) {
            if (votes[_electionId][i] > highestVotes) {
                highestVotes = votes[_electionId][i];
                winnerIndex = i;
            }
        }
        winner = e.candidates[winnerIndex];
    }

    // A flat version of your Election struct that includes the dynamic array
    struct ElectionOutput {
        uint      id;
        string    title;
        string    description;
        string[]  candidates;
        uint      startTime;
        uint      endTime;
        bool      active;
    }

    /// @notice Fetch all details of one election in a single call
    function getElection(uint _electionId)
        external
        view
        returns (
            uint,
            string memory,
            string memory,
            string[] memory,
            uint,
            uint,
            bool
        )
    {
        Election storage e = elections[_electionId];
        return (
            e.id,
            e.title,
            e.description,
            e.candidates,
            e.startTime,
            e.endTime,
            e.active
        );
    }

    /// @notice Fetch full results: candidate names, their counts, tie flag, and winner
    function getElectionResults(uint _electionId)
        external
        view
        onlyAdmin
        returns (
            string[] memory candidates,
            uint256[] memory counts,
            bool isDraw,
            string memory winner
        )
    {
        Election storage e = elections[_electionId];
        uint n = e.candidates.length;
        candidates = e.candidates;

        // Build the counts array
        counts = new uint256[](n);
        for (uint i = 0; i < n; i++) {
            counts[i] = votes[_electionId][i];
        }

        // Determine highest vote total
        uint256 highest = 0;
        for (uint i = 0; i < n; i++) {
            if (counts[i] > highest) {
                highest = counts[i];
            }
        }

        // Check for ties
        uint numWinners = 0;
        uint winnerIndex = 0;
        for (uint i = 0; i < n; i++) {
            if (counts[i] == highest) {
                numWinners++;
                winnerIndex = i;
            }
        }

        // If multiple share the top, it’s a draw
        isDraw = (numWinners > 1);

        // If single top candidate, set their name; else empty
        if (!isDraw) {
            winner = candidates[winnerIndex];
        } else {
            winner = ""; // or use "DRAW" sentinel
        }
    }
    function publishResults(uint _electionId) external onlyAdmin {
    Election storage e = elections[_electionId];
    require(e.id != 0,                      "No such election");
    require(!resultsPublished[_electionId], "Already published");

    uint n = e.candidates.length;
    string[] memory cands = new string[](n);
    for (uint i = 0; i < n; i++) {
        cands[i] = e.candidates[i];
    }

    uint256[] memory cnts = new uint256[](n);
    for (uint i = 0; i < n; i++) {
        cnts[i] = votes[_electionId][i];
    }

    uint256 highest = 0;
    for (uint i = 0; i < n; i++) {
        if (cnts[i] > highest) highest = cnts[i];
    }

    uint winners = 0;
    uint winnerIdx;
    for (uint i = 0; i < n; i++) {
        if (cnts[i] == highest) {
            winners++;
            winnerIdx = i;
        }
    }
    bool draw = winners > 1;
    string memory winName = draw ? "" : cands[winnerIdx];

    publishedResults[_electionId] = PublishedResult({
        candidates: cands,
        counts:     cnts,
        isDraw:     draw,
        winner:     winName
    });
    resultsPublished[_electionId] = true;

    emit ResultsPublished(_electionId, cands, cnts, draw, winName);
}

}
