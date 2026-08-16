export class ObjectPool<T> {
  private readonly available: T[] = [];
  private readonly active = new Set<T>();
  private readonly factory: () => T;

  constructor(factory: () => T, initialSize = 0) {
    this.factory = factory;
    for (let index = 0; index < initialSize; index += 1) {
      this.available.push(factory());
    }
  }

  acquire(): T {
    const item = this.available.pop() ?? this.factory();
    this.active.add(item);
    return item;
  }

  release(item: T): void {
    if (!this.active.delete(item)) {
      return;
    }

    this.available.push(item);
  }

  forEachActive(callback: (item: T) => void): void {
    this.active.forEach(callback);
  }

  drain(dispose: (item: T) => void): void {
    this.active.forEach(dispose);
    this.available.forEach(dispose);
    this.active.clear();
    this.available.length = 0;
  }

  get activeCount(): number {
    return this.active.size;
  }
}
