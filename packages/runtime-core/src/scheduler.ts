const queue = [];
let isFlushing = false;
let resolvedPromise = Promise.resolve();
export function queueJob(job) {
  // job = effect.run -> componentUpdateFn
  if (!queue.length || !queue.includes(job)) {
    queue.push(job);
    queueFlush();
  }
}

function queueFlush() {
  if (!isFlushing) {
    isFlushing = true;
    resolvedPromise.then(flushJob);
  }
}

function flushJob() {
  for (let i = 0; i < queue.length; i++) {
    queue[i]();
  }
  queue.length = 0;
  isFlushing = false;
}

/**
 * this.count ++
 * queue: [job]
 * job() // componentUpdateFn -> render 
 */

export function nextTick(fn) {
  return fn ? resolvedPromise.then(fn) : resolvedPromise;
}
// await this.$nextTick()
// this.$nextTick(() =>{})
