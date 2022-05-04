interface ListenerFn<T extends any[]> {
    (eventInfo: {
        shouldCancel: boolean;
    }, ...args: T): void;
}
/**
 * The priority of an event. The lower the value the high the priority.
 */
declare enum Priority {
    HIGHEST = -1000,
    HIGHER = -100,
    HIGH = -10,
    NORMAL = 0,
    LOW = 10,
    LOWER = 100,
    LOWEST = 1000
}
/**
 * The event emitter class. You can either instatiate it directly or subclass it.
 */
declare class EventEmitter<EventTypes extends {
    [event: string | symbol]: (...args: any[]) => void;
}> {
    /**
     * Allow `EventEmitter` to be imported as module namespace.
     */
    static EventEmitter: typeof EventEmitter;
    /**
     * The priority of an event. The lower the value the high the priority.
     */
    static Priority: typeof Priority;
    /**
     * Expose the prefix.
     */
    static prefixed: string | false;
    /**
     * The actual event storage.
     */
    private _events;
    /**
     * The prefix used by this emitter.
     */
    prefix: string | false;
    /**
     * Only exists for compatibility with eventemitter3 unit tests.
     * Don't know what to do with types
     */
    protected get _eventsCount(): number;
    /**
     * Return an array listing the events for which the emitter has registered
     * listeners.
     * Don't know what to do with types
     */
    eventNames(): (keyof EventTypes)[];
    /**
     * Return the listeners registered for a given event.
     */
    listeners<Event extends keyof EventTypes>(iEvent: Event): ListenerFn<Parameters<EventTypes[Event]>>[];
    /**
     * Return the number of listeners listening to a given event.
     */
    listenerCount(event: keyof EventTypes): number;
    /**
     * Calls each of the listeners registered for a given event.
     */
    emit<Event extends keyof EventTypes>(iEvent: Event, ...args: Parameters<EventTypes[Event]>): boolean;
    /**
     * Add a listener for a given event.
     */
    on<Event extends keyof EventTypes>(event: Event, fn: ListenerFn<Parameters<EventTypes[Event]>>, context?: any, priority?: number): this;
    /**
     * Add a one-time listener for a given event.
     */
    once<Event extends keyof EventTypes>(event: Event, fn: ListenerFn<Parameters<EventTypes[Event]>>, context?: any, priority?: number): this;
    /**
     * Add a listener for a given event.
     */
    addEventListener<Event extends keyof EventTypes>(iEvent: Event, fn: ListenerFn<Parameters<EventTypes[Event]>>, context?: any, once?: boolean, priority?: number): this;
    /**
     * Remove the listeners of a given event.
     */
    off<Event extends keyof EventTypes>(event: Event, fn: ListenerFn<Parameters<EventTypes[Event]>>, context?: any, once?: boolean): void;
    /**
     * Remove the listeners of a given event.
     */
    removeEventListener<Event extends keyof EventTypes>(iEvent: Event, fn?: ListenerFn<Parameters<EventTypes[Event]>>, context?: any, once?: boolean, priority?: number): this;
    /**
     * Remove all listeners, or those of the specified event.
     */
    removeAllListeners(event?: keyof EventTypes): this;
    /**
     * Adds the prefix to the given event name.
     * @param name The event name.
     */
    private doPrefix;
    /**
     * Removes the prefix from the given event name.
     * @param name The event name.
     */
    private unPrefix;
    /**
     * Sorts the given listener list.
     * @param events The list.
     */
    private sort;
}
export = EventEmitter;
//# sourceMappingURL=index.d.ts.map