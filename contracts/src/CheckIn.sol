// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CheckIn {
    mapping(address => uint256) public lastCheckInDay;
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 day, uint256 streak);

    error AlreadyCheckedInToday();
    error NoEthAccepted();

    function currentDay() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function checkIn() external payable {
        if (msg.value != 0) revert NoEthAccepted();

        uint256 day = currentDay();
        uint256 last = lastCheckInDay[msg.sender];

        if (last != 0 && last == day) revert AlreadyCheckedInToday();

        uint256 newStreak = 1;
        if (last != 0 && last == day - 1) {
            newStreak = streak[msg.sender] + 1;
        }

        lastCheckInDay[msg.sender] = day;
        streak[msg.sender] = newStreak;

        emit CheckedIn(msg.sender, day, newStreak);
    }
}
