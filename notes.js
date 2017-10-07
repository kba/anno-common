function promiseWaterfall(tasks) {
  return tasks.reduce((acc, task) => {
    return acc.then((res) => {
      return task().then((result) => {
        res.push(result)
        return res
      })
    })
  }, Promise.resolve([]))
}

function promisify(ctx, fn, ...args) {
  return new Promise((resolve, reject) => {
    return ctx[fn](...args, (err, ret) => err ? reject(err) : resolve(ret))
  })
}

