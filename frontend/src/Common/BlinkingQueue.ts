import blinkingMapping from '../data/BlinkingMapping.json'

class BlinkingQueue {

  private queue: string[] = [];
  private timeouts: NodeJS.Timeout[] = [];

  enqueue(item: string): void {
    const blinkMap = blinkingMapping.filter((obj: any) => {
      return obj.key === item
    })
    if (blinkMap.length > 0) {
      this.queue.push(blinkMap[0].source);  
      console.log(`Enqueued: ${blinkMap[0].source}`);
    } else {
      this.queue.push(item);
      console.log(`Enqueued: ${item}`);
    }
  

    const timeout = setTimeout(() => {
      this.dequeue();
    }, 5000);

    this.timeouts.push(timeout);
  }

  private dequeue(): void {
    if (this.queue.length > 0) {
      const item = this.queue.shift();
      console.log(`Dequeued after 5 seconds: ${item}`);
      this.timeouts.shift();
    }
  }

  search(target: string): boolean {
    const blinkMap = blinkingMapping.filter((obj: any) => {
      return obj.key === target
    })
    if (blinkMap.length > 0) {
      return this.queue.includes(blinkMap[0].source);  
    } else {
      return this.queue.includes(target);
    }
    //console.log(this.displayQueue())
    
  }

  // Helper method to display the current queue
  displayQueue(): void {
    console.log("Current queue:", this.queue);
  }

  // New method to get the current size of the queue
  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
    this.queue = [];
    console.log("Queue cleared");
  }



}

export default BlinkingQueue;