import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import config from './config/firebase-config'
import Header from './components/Header'
import VideoFeed from './components/VideoFeed'
import VideoUpload from './components/VideoUpload'

class App extends Component {
  constructor() {
    super()
    firebase.initializeApp(config)
  }
  render() {
    return (
      <Router>
        <div className="App">
          <Header />
          <Switch>
            <Route exact path="/" component={ VideoFeed } />
            <Route path="/upload" component={ VideoUpload } />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App
