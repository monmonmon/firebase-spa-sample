import React, { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/storage'

class VideoUpload extends Component {
  constructor(props) {
    super(props)
    this.state = { video: null }
  }
  handleChange(event) {
    event.preventDefault()
    const video = event.target.files[0]
    console.log('video:', video)
    this.setState({ video })
  }
  handleSubmit(event) {
    event.preventDefault()
    this.fileUpload(this.state.video)
  }
  async fileUpload(video) {
    try {
      const userUid = firebase.auth().currentUser.uid
      const filePath = `videos/${userUid}/${video.name}`
      console.log('filePath:', filePath)
      const videoStorageRef = firebase.storage().ref(filePath)
      console.log('videoStorageRef:', videoStorageRef)
      const fileSnapshot = await videoStorageRef.put(video)
      console.log(fileSnapshot)
    } catch(error) {
      console.log(error)
      return
    }
  }
  render() {
    return (
      <form onSubmit={ e => this.handleSubmit(e) }>
        <h2>Video Upload</h2>
        <input type="file" accept="video/*" onChange={ e => this.handleChange(e) } />
        <button type="submit">Upload Video</button>
      </form>
    )
  }
}

export default VideoUpload
