import type { 
  GameState as IGameState, 
  GameStateData, 
  Property, 
  PropertyPath 
} from '../types';
import { Entity } from './entity';
import { Event } from './event';
import { 
  parsePropertyPath, 
  getNestedProperty, 
  setNestedProperty, 
  cloneProperty 
} from '../utils/property-utils';

export class GameState implements IGameState {
  entities: Entity[];
  globalProperties: Property[];
  history: Event[];
  rounds: number;

  constructor(data: GameStateData) {
    this.entities = data.entities.map(entityData => new Entity(entityData));
    this.globalProperties = data.globalProperties.map(cloneProperty);
    this.history = data.history.map(eventData => new Event(eventData));
    this.rounds = data.rounds;
  }

  getEntity(keyOrId: string): Entity | undefined {
    return this.entities.find(entity => entity.key === keyOrId || entity.id === keyOrId);
  }

  addEntity(entity: Entity): void {
    const existingIndex = this.entities.findIndex(e => e.id === entity.id);
    if (existingIndex >= 0) {
      this.entities[existingIndex] = entity;
    } else {
      this.entities.push(entity);
    }
  }

  removeEntity(keyOrId: string): void {
    this.entities = this.entities.filter(entity => 
      entity.key !== keyOrId && entity.id !== keyOrId
    );
  }

  getEntityProperty(entityKey: string, propKeyChain: PropertyPath): Property | undefined {
    const entity = this.getEntity(entityKey);
    if (!entity) return undefined;
    return entity.getProperty(propKeyChain);
  }

  setEntityProperty(entityKey: string, propKeyChain: PropertyPath, value: Property): void {
    const entity = this.getEntity(entityKey);
    if (entity) {
      entity.setProperty(propKeyChain, value);
    }
  }

  getGlobalProperty(keyChain: PropertyPath): Property | undefined {
    const keys = parsePropertyPath(keyChain);
    return getNestedProperty(this.globalProperties, keys);
  }

  setGlobalProperty(keyChain: PropertyPath, value: Property): void {
    const keys = parsePropertyPath(keyChain);
    this.globalProperties = setNestedProperty(this.globalProperties, keys, value);
  }

  getData(): GameStateData {
    return {
      entities: this.entities.map(entity => entity.getData()),
      globalProperties: this.globalProperties.map(cloneProperty),
      history: this.history.map(event => event.getData()),
      rounds: this.rounds,
    };
  }

  clone(): GameState {
    return new GameState(this.getData());
  }

  addToHistory(event: Event): void {
    this.history.push(event);
  }

  incrementRounds(): void {
    this.rounds += 1;
  }
}