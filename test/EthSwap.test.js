const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')
const Color = artifacts.require('Color')
const Password = artifacts.require('Password')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('EthSwap',([deployer, investor]) => {
  let token, ethSwap
  before(async () => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)
    await token.transfer(ethSwap.address, tokens('1000000'))
  })

  describe('Token deployment', async () => {
    it('contract has a name', async () => {
      const name = await token.name()
      assert.equal(name, 'DApp Token')
    })
  })
  describe('EthSwap deployment', async () => {

    it('contract has a name', async () => {
      const name = await ethSwap.name()
      assert.equal(name, 'EthSwap Instant Exchange')
    })
    it('contract has tokens', async () => {
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('buyTokens()', async () => {
    let result

    before(async () => {
      result = await ethSwap.buyTokens({from: investor, value: tokens('1')})
    })


    it('Allows user to purchase tokens from EthSwap for a fixed price', async () => {
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('100'))

      let ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('999900'))

      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether'))

      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens('100').toString());
      assert.equal(event.rate.toString(), '100');
    })
  })



  describe('sellTokens()', async () => {
    let result

    before(async () => {
      await token.approve(ethSwap.address, tokens('100'), {from: investor})
      result = await ethSwap.sellTokens(tokens('100'), {from: investor})
    })


    it('Allows user to sell tokens to EthSwap for a fixed price', async () => {
      let investorBalance = await token.balanceOf(investor)
      assert.equal(investorBalance.toString(), tokens('0'))

      let ethSwapBalance = await token.balanceOf(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), tokens('1000000'))

      ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
      assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'ether'))

      const event = result.logs[0].args
      assert.equal(event.account, investor)
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens('100').toString());
      assert.equal(event.rate.toString(), '100');

      await ethSwap.sellTokens(tokens('500'),{from: investor}).should.be.rejected;
    })
  })

})


contract('Color', ([deployer, investor]) => {
  let color

  before(async() => {
    color = await Color.new()
  })
  describe('Color deployment', async() => {
    it('contract has a name', async() => {
      let name = await color.name()
      assert.equal('Color', name)
    })
    it('contract has a symbol', async() => {
      let symbol = await color.symbol()
      assert.equal('COLOR', symbol)
    })
  })


  describe('Color minting', async() => {
    it('creates a new token', async() => {
     const result = await color.mint('#EC058E')
     const totalSupply = await color.totalSupply()
     assert.equal(totalSupply, 1);
     const event = result.logs[0].args
     assert.equal(event.tokenId.toNumber(),1, 'id is correct')
     assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct')
     assert.equal(event.to, deployer, 'to is correct')

     await color.mint('#EC058E').should.be.rejected;
    })
  })
  describe('Color Indexing', async() => {
    it('lists colors', async() => {
      await color.mint('#000000')
      await color.mint('#FFFFFF')
      await color.mint('#5386E4')
      const totalSupply = await color.totalSupply()
      let colors
      let result = []

      for(var i = 1; i <= totalSupply; i++){
        colors = await color.colors(i-1)
        result.push(colors)
      }

      let expected = ['#EC058E', '#000000', '#FFFFFF', '#5386E4']
      assert.equal(result.join(','), expected.join(','))
    })
  })
})


contract('Password', ([deployer, investor]) => {
  let password

  before(async() => {
    password = await Password.new()
  })
  describe('Password deployment', async() => {
    it('contract has a name', async() => {
      let name = await password.name()
      assert.equal('Password', name)
    })
    it('contract has a symbol', async() => {
      let symbol = await password.symbol()
      assert.equal('PSW', symbol)
    })
  })


  describe('Password adding', async() => {
    it('approves non existing user', async() => {
      const approved = await password.approve('myMasterPassword')
      assert.equal(approved,true)
    })
    it('adds a password of a new or already existing user', async() => {
     const result1 = await password.addPassword('email1','password1','Netflix','myMasterPassword')
     const result2 = await password.addPassword('email2','password2','Neftlix','myMasterPassword')
     const result3 = await password.addPassword('email3','password3','Amazon','myMasterPassword')
     const hasBeenCreated1 = await result1.logs[0].args.status
     const hasBeenCreated2 = await result2.logs[0].args.status
     const hasBeenCreated3 = await result3.logs[0].args.status
     assert.equal(hasBeenCreated1, true);
     assert.equal(hasBeenCreated2, true);
     assert.equal(hasBeenCreated3, true);

    })

    it('approves existing user', async() => {
      const approved = await password.approve('myMasterPassword')
      assert.equal(approved,true)
    })

    it('disapproves existing user with wrong master key', async() => {
      const approved = await password.approve('myMasterPassword2')
      assert.equal(approved,false)
    })
  })

  describe('Password by user', async() => {
    it('gets passwords of user', async() => {
     const passwords =  await password.getPasswords('myMasterPassword')

     assert.equal(passwords[0][1],'password1')
     assert.equal(passwords[1][1],'password2')
     assert.equal(passwords[2][1],'password3')

    })

    it('returns empty array if password is incorrect', async() => {
      const nopasswords =  await password.getPasswords('myMasterPassword2')
      assert.equal(nopasswords.length, 1)
    })

  })

})
