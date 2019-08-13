import React, { Component } from 'react'
import firebase from 'firebase/app'
import 'firebase/storage'
import 'firebase/firestore'
import _ from 'lodash'

class VideoUpload extends Component {
  constructor(props) {
    super(props)
    this.state = { video: null }
  }
  onFileSelect(event) {
    event.preventDefault()
    const video = event.target.files[0]
    this.setState({ video })
  }
  onSubmit(event) {
    event.preventDefault()
    this.fileUpload(this.state.video)
  }
  async fileUpload(video) {
    try {
      const userUid = firebase.auth().currentUser.uid
      const filePath = `videos/${userUid}/${video.name}`
      console.log('filePath:', filePath)
      const videoStorageRef = firebase.storage().ref(filePath)
      const idToken = await firebase.auth().currentUser.getIdToken(true)
      const metadataForStorage = {
        customMetadata: { idToken }
      }
      const fileSnapshot = await videoStorageRef.put(video, metadataForStorage)
      console.log(fileSnapshot)

      if (video.type === 'video/mp4') {
        // メタデータをFirestoreに保存
        const downloadURL = await videoStorageRef.getDownloadURL()
        let metadataForFirestore = _.omitBy(fileSnapshot.metadata, _.isEmpty)
        metadataForFirestore = Object.assign(metadataForFirestore, { downloadURL })
        this.saveVideoMetadata(metadataForFirestore)
      }

      if (fileSnapshot.state === 'success') {
        this.setState({ video: null })
      } else {
        alert('ファイルアップロードに失敗しました')
      }
    } catch(error) {
      console.log(error)
      return
    }
  }
  async saveVideoMetadata(metadata) {
    const userUid = firebase.auth().currentUser.uid
    const videoRef = firebase.firestore()
      .doc(`users/${userUid}`)
      .collection('videos').doc()
    metadata = Object.assign(metadata, { uid: videoRef.id })
    await videoRef.set(metadata, { merge: true })
  }
  render() {
    return (
      <form onSubmit={ e => this.onSubmit(e) }>
        <h2>Video Upload</h2>
        <input type="file" accept="video/*" onChange={ e => this.onFileSelect(e) } />
        <button type="submit">Upload Video</button>
      </form>
    )
  }
}

export default VideoUpload
