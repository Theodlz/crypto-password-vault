import React, { Component } from 'react';
import Web3 from 'web3'
import Navbar from './Navbar'

import './App.css';

import Password from '../abis/Password'

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
    const PasswordData = await Password.networks[networkId]
    if(PasswordData) {
      const PasswordAddress = PasswordData.address
      const PasswordContract = await new web3.eth.Contract(Password.abi, PasswordAddress)
      this.setState({PasswordContract: PasswordContract})

    }
    else {
      window.alert('Smart contract not deployed on the detected network')
    }
  }

    async addPassword(User,Password, Service, MasterKey) {
      const approved = await this.state.PasswordContract.methods.approve(MasterKey).call({from: this.state.account})
      let created
      if(approved){
        created = await this.state.PasswordContract.methods.addPassword(User,Password,Service,MasterKey).send({from: this.state.account}).once('receipt', (receipt) => {
      })
        if(created){
          this.getPasswords(MasterKey)
        }
        else {
          window.alert('the password cant be added something is wrong')
        }
      }
      else{
        window.alert('the master password is incorrect')
      }
  }

  async getPasswords(MasterKey) {
    const approved = await this.state.PasswordContract.methods.approve(MasterKey).call({from: this.state.account})
    if(approved==true)
    {
      const hasPasswords = await this.state.PasswordContract.methods.hasPasswords(MasterKey).call({from: this.state.account})
      if(hasPasswords){
        const passwords = await this.state.PasswordContract.methods.getPasswords(MasterKey).call({from: this.state.account})
        this.setState({Passwords: passwords})
      }
      else{
        window.alert('No passwords have been saved with this address and password yet.\n Please create one first using your desired password')
      }
    }
    else {
      window.alert('The password is incorrect')
    }

  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      PasswordContract: null,
      Passwords: [],
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
                <h1>PASSWORD VAULT</h1>

                <form onSubmit={(event) => {
                  event.preventDefault()
                  const User = this.User.value
                  const Password = this.Password.value
                  const MasterKey = this.MasterKey.value
                  const Service = this.Service.value
                  if(!MasterKey==""){
                    if(!User=="" && !Password=="" && !Service==""){
                      this.addPassword(User,Password,Service,MasterKey)
                    }
                    else
                    {
                      this.getPasswords(MasterKey)
                    }
                  }
                  else {
                    window.alert("Please insert your master password")
                  }

                }}>
                <input
                type='text'
                className='form-control mb-1'
                placeholder='New id/email (if adding)'
                ref={(input) => { this.User = input}}
                />
                  <input
                  type='text'
                  className='form-control mb-1'
                  placeholder='New password (if adding)'
                  ref={(input) => { this.Password = input}}
                  />
                  <input
                  type='text'
                  className='form-control mb-1'
                  placeholder='Corresponding service (if adding)'
                  ref={(input) => { this.Service = input}}
                  />
                  <input
                  type='text'
                  className='form-control mb-1'
                  placeholder='Master password to add or unlock'
                  ref={(input) => { this.MasterKey = input}}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value="ADD / UNLOCK"
                    />
                </form>
              </div>
            </main>
          </div>
          <hr/>
          <div className="row text-center">
          { this.state.Passwords.map((password,key) => {
            return(
              <div key={key} class='col-md-3 mb-3'>
              <h2>{password[2]}</h2>
              <div>{password[0]}</div>
              <div>{password[1]}</div>
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
