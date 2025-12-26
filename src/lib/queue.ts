type Task<T> = () => Promise<T>;

interface QueueOptions {
  concurrency: number;
}

export class TaskQueue {
  private queue: Array<() => void> = [];
  private running = 0;
  private concurrency: number;

  constructor(options: QueueOptions = { concurrency: 5 }) {
    this.concurrency = options.concurrency;
  }

  enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.running++;
        try {
          const result = await task();
          resolve(result);
        } catch (e) {
          reject(e);
        } finally {
          this.running--;
          this.processNext();
        }
      };

      this.queue.push(run);
      this.processNext();
    });
  }

  private processNext() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      task?.();
    }
  }

  get pending() {
    return this.queue.length;
  }

  get active() {
    return this.running;
  }
}

const concurrency = parseInt(process.env.CONCURRENCY || "10", 10);
export const screenshotQueue = new TaskQueue({ concurrency });
