const queue = [];
let running = 0;
const MAX_CONCURRENCY = 5; // Change as needed

/**
 * Enqueue a task with concurrency control
 * @param {() => Promise<any>} taskFn - Async function to run
 * @returns {Promise<any>}
 */
export const enqueueTask = (taskFn) => {
  return new Promise((resolve, reject) => {
    queue.push({ taskFn, resolve, reject });
    processQueue();
  });
};

const processQueue = async () => {
  if (running >= MAX_CONCURRENCY || queue.length === 0) return;

  const { taskFn, resolve, reject } = queue.shift();
  running++;

  try {
    const result = await taskFn();
    resolve(result);
  } catch (err) {
    reject(err);
  } finally {
    running--;
    processQueue();
  }
};
