const Koa = require('koa')
const bodyParser = require('koa-body')

const router = require('./app/router')
const cors = require('./app/middleware/cors')
const params = require('./app/middleware/params')

const app = new Koa()
const port = 7078

app.use(cors())
app.use(bodyParser({ multipart: true }))
app.use(params())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(port)

console.log(`http://127.0.0.1:${port}`)
