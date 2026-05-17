// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn public checkIn;
    address public user = address(0xBEEF);

    function setUp() public {
        checkIn = new CheckIn();
        vm.warp(1 days);
    }

    function testCheckInSetsStreak() public {
        vm.prank(user);
        checkIn.checkIn();
        assertEq(checkIn.streak(user), 1);
        assertEq(checkIn.lastCheckInDay(user), checkIn.currentDay());
    }

    function testCannotCheckInTwiceSameDay() public {
        vm.prank(user);
        checkIn.checkIn();
        vm.prank(user);
        vm.expectRevert(CheckIn.AlreadyCheckedInToday.selector);
        checkIn.checkIn();
    }

    function testRevertsOnEthSent() public {
        vm.deal(user, 1 ether);
        vm.startPrank(user);
        vm.expectRevert(CheckIn.NoEthAccepted.selector);
        checkIn.checkIn{value: 1 wei}();
        vm.stopPrank();
    }

    function testStreakIncrementsOnConsecutiveDays() public {
        vm.prank(user);
        checkIn.checkIn();

        vm.warp(block.timestamp + 1 days);
        vm.prank(user);
        checkIn.checkIn();

        assertEq(checkIn.streak(user), 2);
    }

    function testStreakResetsAfterGap() public {
        vm.prank(user);
        checkIn.checkIn();

        vm.warp(block.timestamp + 2 days);
        vm.prank(user);
        checkIn.checkIn();

        assertEq(checkIn.streak(user), 1);
    }
}
