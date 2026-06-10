// OpenF1 free tier allows 3 requests/second and 30 requests/minute. TanStack
// Query can fire many queries at once (e.g. ~24 race-result lookups when the
// Overview page mounts), which blows past both limits and returns 429s. This
// queue releases requests on a schedule that respects both rolling windows, so
// callers just await their turn instead of being rejected.

const PER_SECOND = 3;
const PER_MINUTE = 30;

const queue = [];
let dispatched = []; // timestamps (ms) of requests already released
let timer = null;

function scheduleNext(delay = 0) {
  if (timer) return; // a pump is already pending
  timer = setTimeout(pump, delay);
}

function pump() {
  timer = null;
  const now = Date.now();
  dispatched = dispatched.filter((t) => now - t < 60_000);

  if (queue.length === 0) return;

  const inLastSecond = dispatched.filter((t) => now - t < 1_000).length;
  const slotFree = inLastSecond < PER_SECOND && dispatched.length < PER_MINUTE;

  if (slotFree) {
    const job = queue.shift();
    dispatched.push(now);
    Promise.resolve().then(job.run).then(job.resolve, job.reject);
    scheduleNext(0); // immediately try the next one (up to the caps)
    return;
  }

  const waits = [];
  if (inLastSecond >= PER_SECOND) {
    const oldestInSecond = Math.min(
      ...dispatched.filter((t) => now - t < 1_000)
    );
    waits.push(1_000 - (now - oldestInSecond));
  }
  if (dispatched.length >= PER_MINUTE) {
    waits.push(60_000 - (now - dispatched[0]));
  }
  scheduleNext(Math.max(10, Math.min(...waits)));
}

// Queue a request. `run` is a function returning a promise (the actual fetch);
// it is invoked only when a rate-limit slot is free.
function schedule(run) {
  return new Promise((resolve, reject) => {
    queue.push({ run, resolve, reject });
    scheduleNext();
  });
}

export { schedule };
