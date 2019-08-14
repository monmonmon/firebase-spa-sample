const functions = require('firebase-functions')
const admin = require('firebase-admin')
const path = require('path')
const os = require('os')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const ffmpeg_static = require('ffmpeg-static')
const UUID = require('uuid-v4')
const { Storage } = require('@google-cloud/storage')
const serviceAccount = require('./config/service_account.json')

const gcs = new Storage({ keyFilename: './config/service_account.json' })

// authenticate the app
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fir-reacty-videos.firebaseio.com',
  })
  admin.firestore().settings({ timestampsInSnapshots: true })
} catch(error) {
  console.log(error)
  return
}

// save user info to firestore when signed up
exports.saveUser = functions.auth.user().onCreate(async user => {
  const defaultUserIcon = 'https://randomuser.me/api/portraits/med/men/1.jpg'
  try {
    console.log('saveUser')
    const result = await admin.firestore().doc(`users/${user.uid}`).create({
      uid: user.uid,
      displayName: user.displayName || '名無し',
      email: user.email,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL || defaultUserIcon,
      phoneNumber: user.phoneNumber,
      providerData: {
        providerId: user.providerData.length === 0 ? 'password' : user.providerData[0].providerId,
        uid: user.providerData.length === 0 ? user.email : user.providerData[0].uid,
      },
      disabled: user.disabled,
    })
    console.log('result:', result)
    console.log(`User ${user.uid}, ${user.email} has been saved at ${result.writeTime.toDate()}`)
  } catch(error) {
    console.log(error)
    return
  }
})

function promisifyCommand(command) {
  return new Promise((resolve, reject) => {
    command.on('end', resolve).on('error', reject).run()
  })
}

async function saveVideoMetadata(userToken, metadata) {
  const decodedToken = await admin.auth().verifyIdToken(userToken)
  const userUid = decodedToken.uid
  const videoRef = admin.firestore()
    .doc(`users/${userUid}`)
    .collection('videos')
    .doc()
  metadata = Object.assign(metadata, { uid: videoRef.id })
  await videoRef.set(metadata, { merge: true })
}

exports.transcodeVideo = functions.storage.object().onFinalize(async object => {
  try {
    // mp4 以外の動画ファイルが処理対象
    const contentType = object.contentType
    if (!contentType.includes('video') || contentType.endsWith('mp4')) {
      return
    }

    const bucketName = object.bucket
    const bucket = gcs.bucket(bucketName)
    const filePath = object.name
    const fileName = filePath.split('/').pop()
    const tempFilePath = path.join(os.tmpdir(), fileName)
    const videoFile = bucket.file(filePath)
    const targetTempFileName = `${fileName.replace(/\.[^/.]+$/, '')}_output.mp4`
    const targetTempFilePath = path.join(os.tmpdir(), targetTempFileName)
    const targetTranscodedFilePath = `transcoded-videos/${targetTempFileName}`
    const targetStorageFilePath = path.join(path.dirname(targetTranscodedFilePath), targetTempFileName)
    await videoFile.download({ destination: tempFilePath })
    const command = ffmpeg(tempFilePath)
      .setFfmpegPath(ffmpeg_static.path)
      .format('mp4')
      .output(targetTempFilePath)
    await promisifyCommand(command)

    const token = UUID()
    await bucket.upload(targetTempFilePath, {
      destination: targetStorageFilePath,
      metadata: {
        contentType: 'video/mp4',
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      }
    })

    let transcodedVideoFile = await bucket.file(targetStorageFilePath)
    let metadata = await transcodedVideoFile.getMetadata()
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(targetTempFilePath)}?alt=media&token=${token}`
    metadata = Object.assign(metadata[0], { downloadURL })
    const userToken = object.metadata.idToken

    await saveVideoMetadata(userToken, metadata)

    fs.unlinkSync(tempFilePath)
    fs.unlinkSync(targetTempFilePath)
  } catch(error) {
    console.log(error)
    return
  }
})
