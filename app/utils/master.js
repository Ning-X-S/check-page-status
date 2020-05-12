
const cluster = require('cluster')
const path = require('path')
const config = require('../../config')
// const numCPUs = require('os').cpus().length

cluster.setupMaster({
  exec: path.join('./app/utils/worker.js'),
  slient: true
})

module.exports = {
  checkPageStatus
}

async function checkPageStatus (ctx, next) {
  try {
    const res = await new Promise((resolve, reject) => {
      let num = 0
      const urlArr = config[`${ctx.params.projectName}_webUrl`]
      const returnDataTemp = {
        error_code: 0,
        data: {
          request_total: 0,
          exception_total: 0,
          check_page_num: urlArr.length,
          check_page_result: []
        },
        message: '测试通过'
      }
      if (cluster.isMaster) {
        cluster.on('fork', function (worker) {
          console.log(`[master] : fork worker ${worker.id}`)
        })
        cluster.on('exit', function (worker, code, signal) {
          console.log(`[master] : worker ${worker.id} died`)
        })
        for (let i = 0; i < urlArr.length; i++) {
          const worker = cluster.fork()
          worker.send(urlArr[i])
          // 接收子进程数据
          worker.on('message', function (data) {
          // 完成一个，记录并打印进度
            returnDataTemp.data.check_page_result.push(data)
            num++
            if (num === urlArr.length) {
              const result = clearData(returnDataTemp)
              resolve(result)
            }
          })
        }
      } else {
        process.on('message', function (data) {
          ctx.body = data
        })
      }
    })
    ctx.body = res
  } catch (err) {
    ctx.body = {
      error_code: 4000132,
      data: {},
      message: err.message
    }
  }
}

function clearData (info) {
  const result = info
  const handleData = result.data.check_page_result.reduce((result, item) => {
    return {
      exceptionNum: result.exceptionNum + item.error_num,
      requestNum: result.requestNum + item.request_num
    }
  }, { exceptionNum: 0, requestNum: 0 })
  result.data.request_total = handleData.requestNum
  result.data.exception_total = handleData.exceptionNum
  if (handleData.exceptionNum) {
    result.error_code = 4000132
    result.message = `共测试${result.data.check_page_num}个网页，共${handleData.requestNum}个请求，存在${handleData.exceptionNum}个请求异常。`
  }
  return result
}
