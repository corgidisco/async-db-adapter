
import { Job } from "../../interfaces/queue"
import { BeanstalkdQueue } from "./queue"

export class BeanstalkdJob<P> implements Job<P> {

  public isDeleted = false

  constructor(public id: string, public queue: BeanstalkdQueue<P>, public payload: P) {
  }

  public delete(): Promise<boolean> {
    return this.queue.delete(this)
  }
}
