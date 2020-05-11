
const { fork } = require('child_process')
const path = require('path')
const config = require('../../config')

module.exports = {
  checkPageStatus
}

async function checkPageStatus (ctx, next) {
  console.log(ctx.params.projectName)
  const urlArr = config[`${ctx.params.projectName}_webUrl`]
  const returnData = await new Promise((resolve, reject) => {
    let num = 0
    for (let i = 0; i < urlArr.length; i++) {
      console.log(`${path.join(__dirname, './test.js')}`)
      const spawnObj = fork(`${path.join(__dirname, './test.js')}`, { env: { url: urlArr[i] } }, (data, err) => {
        console.log(data)
      })
      // spawnObj.stdout.on('data', (data) => {
      //   console.log(`stdout: ${data}`)
      // })
      spawnObj.on('message', (data) => {
        console.log(data)
        num++
        if (num === urlArr.length) {
          resolve(data)
        }
      })
      // spawnObj.stderr.on('data', (data) => {
      //   console.error(`stderr: ${data}`)
      // })
      // spawnObj.on('exit', code => {
      //   console.log('exit code : ' + code)
      // })
      // spawnObj.on('close', function (code) {
      //   console.log('close code : ' + code)
      // })
      // spawnObj.on('error', function (code) {
      //   console.log('启动子进程失败')
      // })
    }
  })
  ctx.body = returnData
}
