export const createNanoEvent = () => ({
  listeners: [],
  emit(...args) {
    const callbacks = this.listeners || [];
    for (let i = 0, length = callbacks.length; i < length; i++) {
      callbacks[i](...args);
    }
  },
  on(cb) {
    this.listeners?.push(cb) || (this.listeners = [cb]);
    return () => {
      this.listeners = this.listeners.filter((i) => cb !== i);
    };
  },
});
