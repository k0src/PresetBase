export class DBEventBinder {
  #events = [];

  bind(element, event, handler) {
    element.addEventListener(event, handler);
    this.#events.push({ element, event, handler });
  }

  unbind(element, event, handler) {
    element.removeEventListener(event, handler);
    this.#events = this.#events.filter(
      (e) => e.element !== element || e.event !== event || e.handler !== handler
    );
  }

  unbindAll() {
    for (const { element, event, handler } of this.#events) {
      element.removeEventListener(event, handler);
    }
    this.#events = [];
  }
}
