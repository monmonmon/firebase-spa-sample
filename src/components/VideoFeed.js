import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import firebase from 'firebase/app'
import 'firebase/firestore'
import VideoPlayer from './VideoPlayer'

const styles = theme => ({
  root: {
    padding: '50px',
  }
})

class VideoFeed extends Component {
  constructor(props) {
    super(props)
    this.state = { videos: [] }
  }
  async componentDidMount() {
    // currentUser がなぜか引けない
    //const userUid = firebase.auth().currentUser.uid
    const videos = []
    const collection = await firebase.firestore()
      //.doc(`users/${userUid}`)
      .collection('videos')
      .limit(50)
    //console.log('collection:', collection)
    const querySnapshot = await collection.get()
    //console.log('querySnapshot:', querySnapshot)
    await querySnapshot.forEach(doc => {
      console.log('doc:', doc)
      videos.push(doc.data())
    })
    //console.log('videos:', videos)
    this.setState({ videos })
  }
  renderVideoPlayers(videos) {
    return videos.map(video => {
      return (
        <Grid key={ video.name } item xs={ 6 }>
          <VideoPlayer key={ video.name } video={ video } />
        </Grid>
      )
    })
  }
  hoe() {
    //const userUid = firebase.auth().currentUser.uid
  }
  render() {
    const classes = this.props
    return (
      <div>
        <Grid
          container
          className={ classes.root }
          spacing={ 4 }
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          { this.renderVideoPlayers(this.state.videos) }
        </Grid>
        <input type="button" onClick={ this.hoe() } />
      </div>
    )
  }
}

VideoFeed.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(VideoFeed)
