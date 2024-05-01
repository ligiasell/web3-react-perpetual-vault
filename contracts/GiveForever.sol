// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ILido is IERC20 {
  function submit(address _referral) external payable returns (uint256 StETH);
  function withdraw(uint256 _amount, bytes32 _pubkeyHash) external;
  function sharesOf(address _owner) external returns (uint balance);
}

contract GiveForever {
    address public charity = 0x60e932f05Aa454e5494f0EF55A7afc0379FFBB74;
    address public lidoAddress = 0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af;
    uint public donated;

    constructor (address _charityAddress, address _lidoAddress) {
        charity = _charityAddress;
        lidoAddress = _lidoAddress;
    }

    function deposit() payable public {
        ILido(lidoAddress).submit{value: msg.value}(address(this));
        donated += msg.value;
    }

    function lidoBalance() public view returns (uint) {
        return ILido(lidoAddress).balanceOf(address(this));
    }

    function withdraw() public {
        uint balance =  ILido(lidoAddress).balanceOf(address(this));
        uint surplus = balance - donated;
        require(surplus > 0, "Nothing to return");
        ILido(lidoAddress).transfer(charity, surplus);
    }

    function updateWallet(address _newAddress) public {
        require(msg.sender == charity, "Only charity can update wallet");
        charity = _newAddress;
    }
}
