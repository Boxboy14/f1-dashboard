const PER_SECOND = 3;
const PER_MINUTE = 30;
const MAX_RETRIES = 4;
const DEFAULT_BACKOFF = 2_000;

const queue = [];
let dispatched = [];
let timer = null;
let pausedUntil = 0;

function scheduleNext(delay = 0) {
  if (timer) return;
  timer = setTimeout(pump, Math.max(0, delay));
}

function pump() {
  timer = null;
  const now = Date.now();
  dispatched = dispatched.filter((t) => now - t < 60_000);

  if (queue.length === 0) return;

  if (now < pausedUntil) {
    scheduleNext(pausedUntil - now);
    return;
  }

  const inLastSecond = dispatched.filter((t) => now - t < 1_000).length;
  const slotFree = inLastSecond < PER_SECOND && dispatched.length < PER_MINUTE;

  if (slotFree) {
    const job = queue.shift();
    dispatched.push(now);
    runJob(job);
    scheduleNext(0);
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

function runJob(job) {
  Promise.resolve()
    .then(job.run)
    .then((result) => {
      if (result?.status === 429 && job.attempts < MAX_RETRIES) {
        const retryAfter = Number(result.headers?.get?.("retry-after"));
        const backoff =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1_000
            : DEFAULT_BACKOFF * 2 ** job.attempts;
        pausedUntil = Math.max(pausedUntil, Date.now() + backoff);
        job.attempts += 1;
        queue.unshift(job);
        scheduleNext(backoff);
        return;
      }
      job.resolve(result);
    }, job.reject);
}

function schedule(run) {
  return new Promise((resolve, reject) => {
    queue.push({ run, resolve, reject, attempts: 0 });
    scheduleNext();
  });
}

export { schedule };
