const funcs = {
  transcodeVideo: './transcodeVideo',
  saveUser: './saveUser',
  onUsersVideoUpdate: './copyVideoMetadata',
  onUsersVideoCreate: './copyVideoMetadata',
}

for (let funcName in funcs) {
  const fileName = funcs[funcName]
  console.log('funcName:', funcName)
  if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === funcName) {
    console.log('yohoho')
    exports[funcName] = require(fileName)[funcName]
  }
}
