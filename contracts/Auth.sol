// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Auth
 * @dev A simple contract for managing admin roles.
 */
contract Auth {
    // Track which addresses are admins
    mapping(address => bool) private admins;

    /**
     * @dev The deployer is automatically set as an admin.
     */
    constructor() {
        admins[msg.sender] = true;
    }

    /**
     * @dev Modifier to restrict functions to admin-only.
     */
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Auth: caller is not an admin");
        _;
    }

    /**
     * @dev Add a new admin. Only current admins can do this.
     * @param _admin The address to grant admin rights.
     */
    function addAdmin(address _admin) external onlyAdmin {
        admins[_admin] = true;
    }

    /**
     * @dev Remove an admin. Only current admins can do this.
     * @param _admin The address to revoke admin rights.
     */
    function removeAdmin(address _admin) external onlyAdmin {
        admins[_admin] = false;
    }

    /**
     * @dev Check if a given address is an admin.
     * @param _user The address to check.
     * @return True if `_user` is an admin, false otherwise.
     */
    function isAdmin(address _user) public view returns (bool) {
        return admins[_user];
    }
}
