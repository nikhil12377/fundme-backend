// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FundMe {
    address public s_owner;

    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmount;
    uint256 public minimumFunds;

    error FundMe__NotOwner(string message);
    error FundMe__NotEnoughETHEntered();
    error FundMe__CallFailed();
    error FundMe__NotEnoughFundsInContract();

    constructor(uint256 _minimumFunds) {
        s_owner = msg.sender;
        minimumFunds = _minimumFunds;
    }

    function fund() public payable {
        if (msg.value < minimumFunds) {
            revert FundMe__NotEnoughETHEntered();
        }
        if (s_addressToAmount[msg.sender] == 0) {
            s_funders.push(msg.sender);
            s_addressToAmount[msg.sender] = msg.value;
        }
    }

    function withdraw() public payable onlyOwner {
        if (address(this).balance == 0) {
            revert FundMe__NotEnoughFundsInContract();
        }
        address[] memory funders = s_funders;
        for (
            uint256 fundersIndex = 0;
            fundersIndex < funders.length;
            fundersIndex++
        ) {
            address funder = funders[fundersIndex];
            s_addressToAmount[funder] = 0;
        }

        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!callSuccess) {
            revert FundMe__CallFailed();
        }
    }

    function getAllAddresses() public view returns (address[] memory) {
        return s_funders;
    }

    function getNumberOfPeople() public view returns (uint256) {
        return s_funders.length;
    }

    function getTotalFunds() public view returns (uint256) {
        return address(this).balance;
    }

    function getOwner() public view returns (address) {
        return s_owner;
    }

    function getMinimumFunds() public view returns (uint256) {
        return minimumFunds;
    }

    modifier onlyOwner() {
        if (msg.sender != s_owner) {
            revert FundMe__NotOwner("You are not owner");
        }
        _;
    }
}
