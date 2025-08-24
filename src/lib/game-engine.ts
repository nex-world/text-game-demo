import type { 
  GameState, 
  EventTemplate, 
  ActionTemplate, 
  EventArgument, 
  ConditionTemplate,
  EffectTemplate,
  Property,
  EventArgumentSelector,
  ConditionChecker,
  EffectExecutor,
} from '../types';
import { Event, Action } from './event';
import { 
  generateId, 
  getPropertyNumber, 
  getPropertyList, 
  getPropertyString,
  getPropertyBoolean 
} from '../utils/property-utils';

export class GameEngine {
  private argumentSelectors: Map<string, EventArgumentSelector> = new Map();
  private conditionCheckers: Map<string, ConditionChecker> = new Map();
  private effectExecutors: Map<string, EffectExecutor> = new Map();

  constructor() {
    this.initializeArgumentSelectors();
    this.initializeConditionCheckers();
    this.initializeEffectExecutors();
  }

  private initializeArgumentSelectors(): void {
    this.argumentSelectors.set('PLAYER', (gameState) => {
      return gameState.getEntity('PLAYER');
    });

    this.argumentSelectors.set('keyIs', (gameState, params) => {
      const [key] = params;
      return gameState.getEntity(key);
    });

    this.argumentSelectors.set('entityKeyIs', (gameState, params) => {
      const [key] = params;
      return gameState.getEntity(key);
    });
  }

  private initializeConditionCheckers(): void {
    this.conditionCheckers.set('eq', (gameState, args) => {
      const [path, expectedValue] = args[0].params;
      const actualValue = this.resolveValue(gameState, path, args);
      return actualValue === expectedValue;
    });

    this.conditionCheckers.set('neq', (gameState, args) => {
      const [path, expectedValue] = args[0].params;
      const actualValue = this.resolveValue(gameState, path, args);
      return actualValue !== expectedValue;
    });

    this.conditionCheckers.set('gt', (gameState, args) => {
      const [path, threshold] = args[0].params;
      const actualValue = this.resolveValue(gameState, path, args);
      return Number(actualValue) > Number(threshold);
    });

    this.conditionCheckers.set('lt', (gameState, args) => {
      const [path, threshold] = args[0].params;
      const actualValue = this.resolveValue(gameState, path, args);
      return Number(actualValue) < Number(threshold);
    });

    this.conditionCheckers.set('gte', (gameState, args) => {
      const [path, threshold] = args[0].params;
      const actualValue = this.resolveValue(gameState, path, args);
      return Number(actualValue) >= Number(threshold);
    });

    this.conditionCheckers.set('lte', (gameState, args) => {
      const [path, threshold] = args[0].params;
      const actualValue = this.resolveValue(gameState, path, args);
      return Number(actualValue) <= Number(threshold);
    });

    this.conditionCheckers.set('in', (gameState, args) => {
      const [item, arrayPath] = args[0].params;
      const array = this.resolveValue(gameState, arrayPath, args);
      return Array.isArray(array) && array.includes(item);
    });

    this.conditionCheckers.set('contains', (gameState, args) => {
      const [arrayPath, item] = args[0].params;
      const array = this.resolveValue(gameState, arrayPath, args);
      return Array.isArray(array) && array.includes(item);
    });

    this.conditionCheckers.set('notIn', (gameState, args) => {
      const [item, arrayPath] = args[0].params;
      const array = this.resolveValue(gameState, arrayPath, args);
      return Array.isArray(array) && !array.includes(item);
    });

    this.conditionCheckers.set('notContains', (gameState, args) => {
      const [arrayPath, item] = args[0].params;
      const array = this.resolveValue(gameState, arrayPath, args);
      return Array.isArray(array) && !array.includes(item);
    });
  }

  private initializeEffectExecutors(): void {
    this.effectExecutors.set('delta', (gameState, args) => {
      // args[0] 应该包含效果的详细信息
      const effectInfo = args[0];
      if (effectInfo && effectInfo.params) {
        const [path, delta] = effectInfo.params;
        const currentValue = this.resolveValue(gameState, path, args);
        const newValue = Number(currentValue) + Number(delta);
        this.setValue(gameState, path, newValue, args);
      }
    });

    this.effectExecutors.set('set', (gameState, args) => {
      const effectInfo = args[0];
      if (effectInfo && effectInfo.params) {
        const [path, newValue] = effectInfo.params;
        this.setValue(gameState, path, newValue, args);
      }
    });

    this.effectExecutors.set('toggle', (gameState, args) => {
      const effectInfo = args[0];
      if (effectInfo && effectInfo.params) {
        const [path] = effectInfo.params;
        const currentValue = this.resolveValue(gameState, path, args);
        const newValue = !Boolean(currentValue);
        this.setValue(gameState, path, newValue, args);
      }
    });

    this.effectExecutors.set('add', (gameState, args) => {
      const effectInfo = args[0];
      if (effectInfo && effectInfo.params) {
        const [arrayPath, item] = effectInfo.params;
        const array = this.resolveValue(gameState, arrayPath, args);
        if (Array.isArray(array)) {
          const newArray = [...array, item];
          this.setValue(gameState, arrayPath, newArray, args);
        }
      }
    });

    this.effectExecutors.set('remove', (gameState, args) => {
      const effectInfo = args[0];
      if (effectInfo && effectInfo.params) {
        const [arrayPath, item] = effectInfo.params;
        const array = this.resolveValue(gameState, arrayPath, args);
        if (Array.isArray(array)) {
          const newArray = array.filter(x => x !== item);
          this.setValue(gameState, arrayPath, newArray, args);
        }
      }
    });
  }

  private resolveValue(gameState: GameState, path: string, args: EventArgument[]): any {
    if (path.startsWith('@')) {
      const [prefix, ...keyParts] = path.substring(1).split('.');
      
      if (prefix === 'global') {
        const property = gameState.getGlobalProperty(keyParts);
        return this.getPropertyValue(property);
      }
      
      // 查找对应的参数实体
      const argEntity = args.find(arg => arg.template === prefix);
      if (argEntity && argEntity.params[0]) {
        const entity = gameState.getEntity(argEntity.params[0]);
        if (entity) {
          const property = entity.getProperty(keyParts);
          return this.getPropertyValue(property);
        }
      }
    }
    
    return path;
  }

  private setValue(gameState: GameState, path: string, value: any, args: EventArgument[]): void {
    if (path.startsWith('@')) {
      const [prefix, ...keyParts] = path.substring(1).split('.');
      
      if (prefix === 'global') {
        const property = this.createProperty(keyParts[keyParts.length - 1], value);
        gameState.setGlobalProperty(keyParts, property);
        return;
      }
      
      // 查找对应的参数实体
      const argEntity = args.find(arg => arg.template === prefix);
      if (argEntity && argEntity.params[0]) {
        const entity = gameState.getEntity(argEntity.params[0]);
        if (entity) {
          const property = this.createProperty(keyParts[keyParts.length - 1], value);
          entity.setProperty(keyParts, property);
        }
      }
    }
  }

  private getPropertyValue(property: Property | undefined): any {
    if (!property) return undefined;
    
    switch (property._type) {
      case 'Number': return getPropertyNumber(property);
      case 'String': return getPropertyString(property);
      case 'Boolean': return getPropertyBoolean(property);
      case 'List': return getPropertyList(property);
      default: return property.value;
    }
  }

  private createProperty(key: string, value: any): Property {
    if (typeof value === 'number') {
      return { key, value, _type: 'Number' };
    } else if (typeof value === 'boolean') {
      return { key, value, _type: 'Boolean' };
    } else if (Array.isArray(value)) {
      return { key, value, itemType: 'Any', _type: 'List' };
    } else {
      return { key, value: String(value), _type: 'String' };
    }
  }

  public checkCondition(condition: ConditionTemplate, gameState: GameState): boolean {
    const checker = this.conditionCheckers.get(condition.method);
    if (!checker) {
      console.warn(`Unknown condition method: ${condition.method}`);
      return false;
    }
    
    const conditionArgs = [{ template: 'condition', params: condition.params }];
    return checker(gameState, conditionArgs);
  }

  public executeEffect(effect: EffectTemplate, gameState: GameState, eventArgs: EventArgument[]): void {
    const executor = this.effectExecutors.get(effect.method);
    if (!executor) {
      console.warn(`Unknown effect method: ${effect.method}`);
      return;
    }
    
    // 创建一个包含效果信息的特殊参数
    const effectArgs = [{ template: 'effect', params: effect.params }, ...eventArgs];
    executor(gameState, effectArgs);
  }

  public createEvent(template: EventTemplate, gameState: GameState): Event | null {
    const args = this.resolveEventArguments(template, gameState);
    if (!args) return null;

    const eventData = {
      id: generateId(),
      template,
      args,
      state: 'pending' as const,
      done: false,
      result: null,
    };

    return new Event(eventData);
  }

  public createAction(template: ActionTemplate, gameState: GameState): Action | null {
    const args = this.resolveEventArguments(template, gameState);
    if (!args) return null;

    const actionData = {
      id: generateId(),
      template,
      args,
      state: 'pending' as const,
      done: false,
      result: null,
    };

    return new Action(actionData);
  }

  private resolveEventArguments(template: EventTemplate, gameState: GameState): EventArgument[] | null {
    const args: EventArgument[] = [];
    
    for (const argTemplate of template.args) {
      const selector = this.argumentSelectors.get(argTemplate.selector);
      if (!selector) {
        console.warn(`Unknown argument selector: ${argTemplate.selector}`);
        return null;
      }
      
      const resolvedValue = selector(gameState, []);
      args.push({
        template: argTemplate.name,
        params: [resolvedValue?.key || resolvedValue?.id || argTemplate.selector],
      });
    }
    
    return args;
  }

  public canExecuteEvent(event: Event, gameState: GameState): boolean {
    return event.template.conditions.every(condition => 
      this.checkCondition(condition, gameState)
    );
  }

  public executeEvent(event: Event, gameState: GameState): void {
    if (!this.canExecuteEvent(event, gameState)) {
      event.state = 'rejected';
      return;
    }

    for (const effect of event.template.effects) {
      this.executeEffect(effect, gameState, event.args);
    }

    event.state = 'resolved';
    event.done = true;
    gameState.history.push(event);
  }
}