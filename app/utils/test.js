const puppeteer = require('puppeteer')

async function checkPageStatus (url) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  let responseNum = 0
  const returnData = {
    error_code: 0,
    data: {
      error_list: []
    },
    message: ''
  }
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
  await page.goto(url, { waitUntil: 'networkidle0' })
  // fullPage: true，页面很长，全部截图，否则只能截图一半
  // await page.screenshot({ path: 'example.png', fullPage: true  })
  await browser.close()
  console.log('Done')
  if (returnData.data.error_list.length > 0) {
    returnData.error_code = 4000132
    returnData.message = `共${responseNum}个请求，其中存在${returnData.data.error_list.length}个失败请求。`
  } else {
    returnData.data = {}
    returnData.message = `校验通过，共${responseNum}个请求。`
  }
  process.send(returnData)
  // ctx.body = returnData
}

// eslint-disable-next-line func-call-spacing
const atime = new Date().getTime();

(async () => {
  await checkPageStatus(process.env.url)
  console.log(new Date().getTime() - atime)
})()
