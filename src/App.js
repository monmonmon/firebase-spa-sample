import React, { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import config from './config/firebase-config'
import Header from './components/Header'

class App extends Component {
  constructor() {
    super()
    firebase.initializeApp(config)
  }
  render() {
    return (
      <div>
        <Header />
        <div>Hello React</div>
      </div>
    )
  }
}

export default App
