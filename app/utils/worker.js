const puppeteer = require('puppeteer')

const whiteStatus = [200, 301, 302]
async function checkPageStatus (url) {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  let responseNum = 0
  const returnData = {
    check_url: url,
    request_num: 0,
    error_num: 0,
    error_list: []
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
    const status = response.status()
    if (!whiteStatus.includes(status)) {
      returnData.error_list.push({
        url: response.url(),
        code: status,
        type: response.request().resourceType()
      })
      returnData.error_num += 1
    }
  })
  // waitUntil:等页面的请求全部响应完毕，再执行close操作，否则拿不到response
  await page.goto(url, { waitUntil: 'networkidle0' })
  // fullPage: true，页面很长，全部截图，否则只能截图一半
  await page.screenshot({ path: 'example-master.png', fullPage: true })
  await browser.close()
  console.log('Done')
  returnData.request_num = responseNum
  process.send(returnData)
}

process.on('message', async (data) => {
  await checkPageStatus(data)
})
