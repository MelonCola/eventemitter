type EventNames<T extends string | symbol | { [K in string | symbol]: any[] }> = T extends string | symbol
	? T
	: keyof T;
type EventArgs<T extends string | symbol | { [K in string | symbol]: any[] }, K extends EventNames<T>> = T extends
	| string
	| symbol
	? any[]
	: K extends keyof T
	? T[K]
	: never;

interface Listener<T extends any[]> {
	fn: ListenerFn<T>;
	once: boolean;
	context: any;
	priority: number;
}

interface ListenerFn<T extends any[]> {
	(eventInfo: { shouldCancel: boolean }, ...args: T): void;
}

const PREFIX = "~";

/**
 * Gets all own properties and symbols.
 * @param e The object.
 */
const getAllOwn = <T>(e: { [key in string | symbol]: T[] }) => {
	const names = Object.getOwnPropertyNames(e);
	// Feature detect symbols
	const myObject = Object as any;
	const symbols = myObject.getOwnPropertySymbols ? myObject.getOwnPropertySymbols(e) : [];
	const res: (string | symbol)[] = [];
	return res.concat(names).concat(symbols);
};

/**
 * The priority of an event. The lower the value the high the priority.
 */
enum Priority {
	HIGHEST = -1000,
	HIGHER = -100,
	HIGH = -10,
	NORMAL = 0,
	LOW = 10,
	LOWER = 100,
	LOWEST = 1000,
}

/**
 * The event emitter class. You can either instatiate it directly or subclass it.
 */
class EventEmitter<EventTypes extends { [event: string | symbol]: (...args: any[]) => void }> {
	/**
	 * Allow `EventEmitter` to be imported as module namespace.
	 */
	public static EventEmitter = EventEmitter;

	/**
	 * The priority of an event. The lower the value the high the priority.
	 */
	public static Priority = Priority;

	/**
	 * Expose the prefix.
	 */
	public static prefixed: string | false = PREFIX;

	/**
	 * The actual event storage.
	 */
	private _events: Partial<{ [key in keyof EventTypes]: Listener<Parameters<EventTypes[key]>>[] }> = {};

	/**
	 * The prefix used by this emitter.
	 */
	public prefix: string | false = EventEmitter.prefixed;

	/**
	 * Only exists for compatibility with eventemitter3 unit tests.
	 * Don't know what to do with types
	 */
	protected get _eventsCount() {
		return getAllOwn(<any>this._events).length;
	}

	/**
	 * Return an array listing the events for which the emitter has registered
	 * listeners.
	 * Don't know what to do with types
	 */
	public eventNames(): (keyof EventTypes)[] {
		return getAllOwn(<any>this._events).map((e) => this.unPrefix(e as keyof EventTypes));
	}

	/**
	 * Return the listeners registered for a given event.
	 */
	public listeners<Event extends keyof EventTypes>(iEvent: Event): ListenerFn<Parameters<EventTypes[Event]>>[] {
		const event = this.doPrefix(iEvent);
		const events = this._events[event];
		return events ? events.map((e) => e.fn) : [];
	}

	/**
	 * Return the number of listeners listening to a given event.
	 */
	public listenerCount(event: keyof EventTypes): number {
		event = this.doPrefix(event);
		const events = this._events[event];
		return events ? events.length : 0;
	}

	/**
	 * Calls each of the listeners registered for a given event.
	 */
	public emit<Event extends keyof EventTypes>(iEvent: Event, ...args: Parameters<EventTypes[Event]>): boolean {
		const event = this.doPrefix(iEvent);
		const events = this._events[event];
		if (!events || !events.length) {
			return false;
		}
		const eventInfo = { shouldCancel: false };
		for (let i = 0; i < events.length; i++) {
			const currentEvent = events[i];
			if (currentEvent.once) {
				events.splice(i, 1);
				i--;
			}
			currentEvent.fn.apply(currentEvent.context, [eventInfo, ...args]);
			if (eventInfo.shouldCancel) break;
		}
		if (events.length === 0) {
			delete this._events[event];
		}
		return true;
	}

	/**
	 * Add a listener for a given event.
	 */
	public on<Event extends keyof EventTypes>(
		event: Event,
		fn: ListenerFn<Parameters<EventTypes[Event]>>,
		context?: any,
		priority = 0
	) {
		return this.addEventListener(event, fn, context, false, priority);
	}

	/**
	 * Add a one-time listener for a given event.
	 */
	public once<Event extends keyof EventTypes>(
		event: Event,
		fn: ListenerFn<Parameters<EventTypes[Event]>>,
		context?: any,
		priority = 0
	) {
		return this.addEventListener(event, fn, context, true, priority);
	}

	/**
	 * Add a listener for a given event.
	 */
	public addEventListener<Event extends keyof EventTypes>(
		iEvent: Event,
		fn: ListenerFn<Parameters<EventTypes[Event]>>,
		context?: any,
		once?: boolean,
		priority = 0
	) {
		if (typeof fn !== "function") {
			throw new TypeError("The listener must be a function");
		}
		const event = this.doPrefix(iEvent);
		const events: Listener<Parameters<EventTypes[Event]>>[] = this._events[event] || [];
		events.push({ context: context, fn: fn, priority: priority, once: !!once });
		this.sort(events);
		this._events[event] = events;
		return this;
	}

	/**
	 * Remove the listeners of a given event.
	 */
	public off<Event extends keyof EventTypes>(
		event: Event,
		fn: ListenerFn<Parameters<EventTypes[Event]>>,
		context?: any,
		once?: boolean
	) {
		this.removeEventListener(event, fn, context, once);
	}

	/**
	 * Remove the listeners of a given event.
	 */
	public removeEventListener<Event extends keyof EventTypes>(
		iEvent: Event,
		fn?: ListenerFn<Parameters<EventTypes[Event]>>,
		context?: any,
		once?: boolean,
		priority?: number
	) {
		if (!fn) {
			this.removeAllListeners(iEvent);
		} else {
			const event = this.doPrefix(iEvent);
			let events = this._events[event];
			if (events) {
				for (let i = 0; i < events.length; i++) {
					const currentEvent = events[i];
					if (
						currentEvent.fn === fn &&
						(!context || currentEvent.context === context) &&
						(!once || currentEvent.once === once) &&
						(!priority || currentEvent.priority === priority)
					) {
						events.splice(i, 1);
						i--;
					}
				}
				if (events.length === 0) {
					delete this._events[event];
				}
			}
		}
		return this;
	}

	/**
	 * Remove all listeners, or those of the specified event.
	 */
	public removeAllListeners(event?: keyof EventTypes) {
		if (event) {
			event = this.doPrefix(event);
			delete this._events[event];
		} else {
			this._events = {};
		}
		return this;
	}

	/**
	 * Adds the prefix to the given event name.
	 * @param name The event name.
	 */
	private doPrefix(name: keyof EventTypes) {
		if (typeof name === "string" && this.prefix) {
			return (this.prefix + name) as keyof EventTypes;
		}
		return name;
	}

	/**
	 * Removes the prefix from the given event name.
	 * @param name The event name.
	 */
	private unPrefix(name: keyof EventTypes) {
		if (typeof name === "string" && this.prefix) {
			return name.slice(this.prefix.length) as keyof EventTypes;
		}
		return name;
	}

	/**
	 * Sorts the given listener list.
	 * @param events The list.
	 */
	private sort(events: Listener<any>[]) {
		events.sort((a, b) => a.priority - b.priority);
	}
}
export = EventEmitter;
