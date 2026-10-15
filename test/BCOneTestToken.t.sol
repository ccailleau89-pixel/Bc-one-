// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {BCOneTestToken} from "../src/BCOneTestToken.sol";

contract BCOneTestTokenTest {
    function testOwnerCanMintUpToCap() public {
        BCOneTestToken token = new BCOneTestToken(100 ether, address(this));
        address recipient = address(0xBEEF);

        token.mint(recipient, 40 ether);
        token.mint(recipient, 60 ether);

        require(token.totalSupply() == 100 ether, "total supply mismatch");
        require(token.balanceOf(recipient) == 100 ether, "recipient balance mismatch");
        require(token.cap() == 100 ether, "cap mismatch");
    }

    function testCapCannotBeExceeded() public {
        BCOneTestToken token = new BCOneTestToken(100 ether, address(this));
        (bool success,) = address(token).call(
            abi.encodeWithSignature("mint(address,uint256)", address(this), 100 ether + 1)
        );
        require(!success, "mint above cap must revert");
        require(token.totalSupply() == 0, "failed mint changed supply");
    }

    function testOnlyOwnerCanMint() public {
        BCOneTestToken token = new BCOneTestToken(100 ether, address(this));
        NonOwnerCaller nonOwner = new NonOwnerCaller();
        bool success = nonOwner.tryMint(token, address(0xBEEF), 1 ether);
        require(!success, "non-owner mint must fail");
        require(token.totalSupply() == 0, "unauthorized mint changed supply");
    }

    function testZeroCapIsRejected() public {
        bool deployed;
        try new BCOneTestToken(0, address(this)) returns (BCOneTestToken) {
            deployed = true;
        } catch {}
        require(!deployed, "zero cap must be rejected");
    }

    function testZeroOwnerIsRejected() public {
        bool deployed;
        try new BCOneTestToken(1 ether, address(0)) returns (BCOneTestToken) {
            deployed = true;
        } catch {}
        require(!deployed, "zero owner must be rejected");
    }
}

contract NonOwnerCaller {
    function tryMint(BCOneTestToken token, address recipient, uint256 amount)
        external
        returns (bool success)
    {
        (success,) = address(token).call(
            abi.encodeWithSignature("mint(address,uint256)", recipient, amount)
        );
    }
}
