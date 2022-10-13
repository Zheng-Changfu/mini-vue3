const queue = [];

// 是否在更新中
let isFlushing = false;
const resolvedPromise = Promise.resolve();

export function queueJob(job) {
  // job = update = effect.run
  if (!queue.length || !queue.includes(job)) {
    queue.push(job);
    queueFlash();
  }
}

function queueFlash() {
  if (!isFlushing) {
    isFlushing = true;
    resolvedPromise.then(flushJobs);
  }
}

function flushJobs() {
  for (let i = 0; i < queue.length; i++) {
    const job = queue[i];
    job();
  }
  queue.length = 0;
  isFlushing = false; // 执行完一轮更新在开放下一批更新
}

export function nextTick(fn) {
  console.log(1111);
  return fn ? resolvedPromise.then(fn) : resolvedPromise;
}
