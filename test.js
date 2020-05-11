async function refresh () {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(1111)
      resolve(1111)
    }, 3000)
  }).then((res) => {
    console.log(res)
  })
  console.log(222)
}

(async () => {
  await refresh()
})()

const spa = require('cluster').fork('./test.js')
console.log(spa)
