
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const path = require('path')
const config = require('../../config')

cluster.setupMaster({
  exec: path.join('./app/utils/worker.js'),
  slient: true
})

module.exports = {
  checkPageStatus
}

async function checkPageStatus (ctx, next) {
  console.log(ctx.params.projectName)
  const returnData = []
  if (cluster.isMaster) {
    cluster.on('fork', function (worker) {
      console.log(`[master] : fork worker ${worker.id}`)
    })
    cluster.on('exit', function (worker, code, signal) {
      console.log(`[master] : worker ${worker.id} died`)
    })
    const urlArr = config[`${ctx.params.projectName}_webUrl`]
    for (let i = 0; i < urlArr.length; i++) {
      const worker = cluster.fork()
      // 接收子进程数据
      worker.on('message', function (data) {
        // 完成一个，记录并打印进度
        console.log(1)
        console.log(data)
        returnData.push(data)
      })
      console.log(urlArr[i])
      worker.send(urlArr[i])
    }
  } else {
    process.on('message', function (data) {
      ctx.body = data
    })
  }
  ctx.body = returnData
}
