import React, { Component } from 'react';
import Web3 from 'web3'
import Navbar from './Navbar'

import './App.css';

import Color from '../abis/Color'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }


  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.wb3.currentProvider)
    }
    else {
      window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!")
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})

    const networkId = await web3.eth.net.getId()
    const colorData = await Color.networks[networkId]
    if(colorData) {
      const abi = Color.abi
      const colorAddress = colorData.address
      const colorContract = await new web3.eth.Contract(Color.abi, colorAddress)
      this.setState({colorContract: colorContract})
      const totalSupply = await colorContract.methods.totalSupply().call()
      this.setState({totalSupply: totalSupply})
      //Load colors

      for(var i = 1; i <= totalSupply; i++){
        const color = await colorContract.methods.colors(i-1).call()
        this.setState({
          colors: [...this.state.colors, color]
        })
      }
    }
    else {
      window.alert('Smart contract not deployed on the detected network')
    }
  }

  mint = (color) => {
    this.state.colorContract.methods.mint(color).send({from: this.state.account})
    .once('receipt', (receipt) => {
      this.setState({
        colors: [...this.state.colors, color]
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      colorContract: null,
      totalSupply: 0,
      colors: []
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue Token</h1>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const color = this.color.value
                  this.mint(color)

                }}>
                  <input
                  type='text'
                  className='form-control mb-1'
                  placeholder='e.g. #FFFFFF'
                  ref={(input) => { this.color = input}}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value="MINT"
                    />

                </form>
              </div>
            </main>
          </div>
          <hr/>
          <div className="row text-center">
          { this.state.colors.map((color,key) => {
            return(
              <div key={key} class='col-md-3 mb-3'>
              <div className="token" style={{backgroundColor: color}}></div>
              <div>{color}</div>
              </div>
            )
          })}
          </div>

        </div>
      </div>
    );
  }
}

export default App;
