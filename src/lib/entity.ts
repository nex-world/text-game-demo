import type { Entity as IEntity, EntityData, Property, PropertyPath } from '../types';
import { 
  parsePropertyPath, 
  getNestedProperty, 
  setNestedProperty, 
  cloneProperty 
} from '../utils/property-utils';

export class Entity implements IEntity {
  id: string;
  key: string;
  properties: Property[];

  constructor(data: EntityData) {
    this.id = data.id;
    this.key = data.key;
    this.properties = data.properties.map(cloneProperty);
  }

  getProperty(keyChain: PropertyPath): Property | undefined {
    const keys = parsePropertyPath(keyChain);
    return getNestedProperty(this.properties, keys);
  }

  setProperty(keyChain: PropertyPath, value: Property): void {
    const keys = parsePropertyPath(keyChain);
    this.properties = setNestedProperty(this.properties, keys, value);
  }

  getData(): EntityData {
    return {
      id: this.id,
      key: this.key,
      properties: this.properties.map(cloneProperty),
    };
  }

  clone(): Entity {
    return new Entity(this.getData());
  }
}