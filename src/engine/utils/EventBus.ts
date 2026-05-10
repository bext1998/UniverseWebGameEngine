import { Relay } from "../core/Relay";

export class EventBus<EventMap extends object> extends Relay<EventMap> {}
