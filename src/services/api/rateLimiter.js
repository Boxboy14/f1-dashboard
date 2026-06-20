// OpenF1 free tier allows 3 requests/second and 30 requests/minute (verified
// live: the 31st request in a rolling minute returns 429). TanStack Query can
// fire many queries at once (e.g. ~24 race-result lookups when the Overview
// page mounts), which blows past both limits. This queue releases requests on
// a schedule that respects both rolling windows, so callers just await their
// turn instead of being rejected.
//
// The window counts are an in-memory estimate, so they can drift out of sync
// with OpenF1's server-side counter — e.g. a Vite hot-reload wipes this state,
// a second tab shares the same IP budget, or the clock skews. When that
// happens a request still 429s. So the limiter is also 429-aware: on a 429 it
// pauses the whole queue (honouring Retry-After) and re-queues the request, so
// the app self-heals transparently instead of surfacing the error.

const PER_SECOND = 3;
const PER_MINUTE = 30;
const MAX_RETRIES = 4; // give up after this many 429s on a single request
const DEFAULT_BACKOFF = 2_000; // when Retry-After is absent: 2s, 4s, 8s…

const queue = [];
let dispatched = []; // timestamps (ms) of requests already released
let timer = null;
let pausedUntil = 0; // honour a server backoff before releasing anything more

function scheduleNext(delay = 0) {
  if (timer) return; // a pump is already pending
  timer = setTimeout(pump, Math.max(0, delay));
}

function pump() {
  timer = null;
  const now = Date.now();
  dispatched = dispatched.filter((t) => now - t < 60_000);

  if (queue.length === 0) return;

  if (now < pausedUntil) {
    scheduleNext(pausedUntil - now); // a 429 backoff is in effect
    return;
  }

  const inLastSecond = dispatched.filter((t) => now - t < 1_000).length;
  const slotFree = inLastSecond < PER_SECOND && dispatched.length < PER_MINUTE;

  if (slotFree) {
    const job = queue.shift();
    dispatched.push(now);
    runJob(job);
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

function runJob(job) {
  Promise.resolve()
    .then(job.run)
    .then((result) => {
      // A 429 means OpenF1's counter is ahead of ours: pause the queue for the
      // server-advised window and retry this same request. Its budget slot is
      // already spent (kept in `dispatched`), but the request hasn't succeeded.
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

// Queue a request. `run` is a function returning a promise (the actual fetch);
// it is invoked only when a rate-limit slot is free.
function schedule(run) {
  return new Promise((resolve, reject) => {
    queue.push({ run, resolve, reject, attempts: 0 });
    scheduleNext();
  });
}

export { schedule };
