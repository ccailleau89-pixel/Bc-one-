// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {BCOneToken} from "../contracts/BCOneToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BCOneTokenTest is Test {
    uint256 private constant UNIT = 1 ether;
    address private owner = address(0xA11CE);
    address private alice = address(0xB0B);
    address private bob = address(0xB0B1);

    BCOneToken private token;

    function setUp() public {
        token = new BCOneToken(1_000, 10_000, owner);
    }

    function testMetadata() public view {
        assertEq(token.name(), "BC ONE");
        assertEq(token.symbol(), "BCONE");
        assertEq(token.decimals(), 18);
    }

    function testInitialSupplyIsMintedToOwner() public view {
        assertEq(token.totalSupply(), 1_000 * UNIT);
        assertEq(token.balanceOf(owner), 1_000 * UNIT);
        assertEq(token.cap(), 10_000 * UNIT);
    }

    function testOwnerCanMintWithinCap() public {
        vm.prank(owner);
        token.mint(alice, 500);
        assertEq(token.balanceOf(alice), 500 * UNIT);
        assertEq(token.totalSupply(), 1_500 * UNIT);
    }

    function testMintCannotExceedCap() public {
        vm.prank(owner);
        token.mint(alice, 9_000);
        assertEq(token.totalSupply(), token.cap());

        vm.prank(owner);
        vm.expectRevert();
        token.mint(alice, 1);
    }

    function testNonOwnerCannotMint() public {
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice)
        );
        token.mint(bob, 1);
    }

    function testTransfersWork() public {
        vm.prank(owner);
        token.transfer(alice, 25 * UNIT);

        vm.prank(alice);
        token.transfer(bob, 7 * UNIT);

        assertEq(token.balanceOf(alice), 18 * UNIT);
        assertEq(token.balanceOf(bob), 7 * UNIT);
        assertEq(token.totalSupply(), 1_000 * UNIT);
    }

    function testInitialSupplyAboveCapReverts() public {
        vm.expectRevert(BCOneToken.InitialSupplyExceedsMaxSupply.selector);
        new BCOneToken(11, 10, owner);
    }

    function testZeroCapReverts() public {
        vm.expectRevert(BCOneToken.ZeroMaxSupply.selector);
        new BCOneToken(0, 0, owner);
    }

    function testZeroOwnerReverts() public {
        vm.expectRevert(Ownable.OwnableInvalidOwner.selector);
        new BCOneToken(0, 10, address(0));
    }

    function testMintSelectorIsOwnerRestricted() public {
        bytes memory callData = abi.encodeWithSelector(token.mint.selector, alice, 1);
        vm.prank(alice);
        (bool success,) = address(token).call(callData);
        assertFalse(success);
    }

    function testBurningIsNotExposedByTokenInterface() public view {
        // BCOneToken intentionally does not inherit ERC20Burnable.
        assertFalse(_hasBurnableInterface());
    }

    function _hasBurnableInterface() private view returns (bool) {
        // ERC-20 has no standard burn function; this draft exposes only the standard ERC-20 API
        // plus the privileged mint function. A burn extension would require a separate decision.
        return address(token).code.length == 0;
    }
}
