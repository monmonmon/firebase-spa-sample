const functions = require('firebase-functions')
const serviceAccount = require('./config/service_account.json')
const admin = require('firebase-admin')

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://fir-reacty-videos.firebaseio.com',
  })
  admin.firestore().settings({ timestampsInSnapshots: true })
} catch(error) {
  console.log(error)
}

const defaultUserIcon = 'https://randomuser.me/api/portraits/med/men/1.jpg'

exports.saveUser = functions.auth.user().onCreate(async user => {
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
  }
})
