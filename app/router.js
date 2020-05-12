const Router = require('koa-router')

const router = new Router()
// const { checkPageStatus } = require('./utils/checkPageStatus')

const { checkPageStatus } = require('./utils/master')

// const { checkPageStatus } = require('./utils/child')

router.get('/test', (ctx, next) => {
  ctx.body = {
    error_code: 0,
    message: '测试成功',
    data: {}
  }
})

router.get('/check_page_status/:projectName', async (ctx, next) => {
  await checkPageStatus(ctx, next)
})
router.post('/check_page_status/:projectName', async (ctx, next) => {
  await checkPageStatus(ctx, next)
})

module.exports = router
