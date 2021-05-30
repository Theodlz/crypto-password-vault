pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract Password {

  string  public name = "Password";
  string  public symbol = "PSW";
  mapping (address => string[][]) _passwordsOwnedBy;
  mapping (address => string) _masterKeyOfUser;
  mapping (address => bool) _userExists;

  string[][] public empty = new string[][](1);

  constructor() public {

  }

  event created (
    bool status
  );

  function addPassword(string memory _user, string memory _password, string memory _service, string memory _masterKey) public returns(bool){

    if(!_userExists[msg.sender]) {
      _userExists[msg.sender] = true;
      _masterKeyOfUser[msg.sender] = _masterKey;
      _passwordsOwnedBy[msg.sender].push([_user, _password, _service]);
      emit created(true);
    }
    else if (keccak256(abi.encodePacked(_masterKeyOfUser[msg.sender])) == keccak256(abi.encodePacked(_masterKey))){
      _passwordsOwnedBy[msg.sender].push([_user, _password, _service]);
      emit created(true);
    }
    else {
      emit created(false);
    }

  }
  function getPasswords(string memory _masterKey) public view returns(string[][] memory){
    if(keccak256(abi.encodePacked(_masterKeyOfUser[msg.sender])) == keccak256(abi.encodePacked(_masterKey))){
      return _passwordsOwnedBy[msg.sender];
    }
    else {
      return empty;
    }
  }

  function approve(string memory _masterKey) public view returns(bool){
    if(bytes(_masterKeyOfUser[msg.sender]).length==0 || (keccak256(abi.encodePacked(_masterKeyOfUser[msg.sender])) == keccak256(abi.encodePacked(_masterKey))))
    {
      return true;
    }
    return false;
  }

  function hasPasswords(string memory _masterKey) public view returns(bool){
    if((keccak256(abi.encodePacked(_masterKeyOfUser[msg.sender])) == keccak256(abi.encodePacked(_masterKey))))
    {
      return true;
    }
    return false;
  }

}
