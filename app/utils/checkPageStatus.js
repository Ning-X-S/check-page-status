const config = require('../../config')
const puppeteer = require('puppeteer')
const cluster = require('cluster')
// const reg = /lehe.com\/api/

cluster.setupMaster({
  exec: './worker.js',
  slient: true
})

module.exports = {
  checkPageStatus
}

async function checkPageStatus (ctx, next) {
  console.log(`${ctx.params.projectName}_webUrl`)
  const returnData = {
    error_code: 0,
    data: {
      error_list: []
    },
    message: ''
  }
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  let responseNum = 0
  await page.setRequestInterception(true)
  page.on('request', async (request) => {
    request.continue()
  })
  page.on('requestfailed', (requestfailed) => {
    console.log('requestfailed:' + requestfailed.url())
    if (requestfailed.resourceType() === 'xhr') {
      console.log('requestfailed:' + requestfailed.url())
    }
  })
  page.on('requestfinished', async (requestfinished) => {
  })
  page.on('response', async (response) => {
    responseNum += 1
    if (response.status() !== 200) {
      returnData.data.error_list.push({
        url: response.url(),
        code: response.status(),
        type: response.request().resourceType()
      })
    }
  })
  // waitUntil:等页面的请求全部响应完毕，再执行close操作，否则拿不到response
  await page.goto(config[`${ctx.params.projectName}_webUrl`][0], { waitUntil: 'networkidle0' })
  // fullPage: true，页面很长，全部截图，否则只能截图一半
  await page.screenshot({ path: 'example-all.png', fullPage: true })
  await browser.close()
  console.log('Done')
  if (returnData.data.error_list.length > 0) {
    returnData.error_code = 4000132
    returnData.message = `共${responseNum}个请求，其中存在${returnData.data.error_list.length}个失败请求。`
  } else {
    returnData.data = {}
    returnData.message = `校验通过，共${responseNum}个请求。`
  }
  ctx.body = returnData
}
