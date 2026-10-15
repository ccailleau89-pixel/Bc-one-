// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/// @notice Local/test-network token prototype only. Not a production BC ONE token.
contract BCOneTestToken is ERC20, ERC20Capped, Ownable2Step {
    /// @param supplyCap_ Immutable lifetime cap, expressed in the token's smallest units.
    /// @param initialOwner Account authorized to mint up to the cap.
    constructor(uint256 supplyCap_, address initialOwner)
        ERC20("BC ONE Test Token", "BCOT")
        ERC20Capped(supplyCap_)
        Ownable(initialOwner)
    {}

    /// @notice Creates test tokens for development, subject to the immutable lifetime cap.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Capped)
    {
        super._update(from, to, amount);
    }
}
