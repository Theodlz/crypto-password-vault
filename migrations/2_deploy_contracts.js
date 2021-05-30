const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");
const Color = artifacts.require("Color");
const Password = artifacts.require("Password")

module.exports = async function(deployer){
  await deployer.deploy(Color);
  const color = await Color.deployed();
  await deployer.deploy(Token);
  const token = await Token.deployed();
  await deployer.deploy(EthSwap, token.address);
  const ethSwap = await EthSwap.deployed();
  await deployer.deploy(Password);
  const password = await Password.deployed();

  await token.transfer(ethSwap.address, '1000000000000000000000000')
};
