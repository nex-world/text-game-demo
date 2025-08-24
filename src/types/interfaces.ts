import type {
  EntityData,
  Property,
  EventData,
  EventTemplate,
  EventArgument,
  ActionTemplate,
  ActionData,
  GameStateData,
} from './game-types';

// Entity 类接口
export interface Entity extends EntityData {
  getProperty(keyChain: string | string[]): Property | undefined;
  setProperty(keyChain: string | string[], value: Property): void;
  getData(): EntityData;
}

// Event 类接口
export interface Event extends EventData {
  getDesc(): string;
  getArg(name: string): EventArgument | undefined;
  getData(): EventData;
}

// Action 类接口
export interface Action extends ActionData {
  getDesc(): string;
  getArg(name: string): EventArgument | undefined;
  getData(): ActionData;
}

// GameState 类接口
export interface GameState extends GameStateData {
  entities: Entity[];
  history: Event[];
  
  getEntity(keyOrId: string): Entity | undefined;
  addEntity(entity: Entity): void;
  removeEntity(keyOrId: string): void;
  getEntityProperty(entityKey: string, propKeyChain: string | string[]): Property | undefined;
  setEntityProperty(entityKey: string, propKeyChain: string | string[], value: Property): void;

  getGlobalProperty(keyChain: string | string[]): Property | undefined;
  setGlobalProperty(keyChain: string | string[], value: Property): void;
  getData(): GameStateData;
}

// GameInstance 接口
export interface GameInstance {
  state: GameState;
  init(): void;
  update(): void;
}

// 游戏配置接口
export interface GameConfig {
  propertyDefs: PropertyDefinition[];
  entityTemplates: EntityTemplate[];
  eventTemplates: EventTemplate[];
  actionTemplates: ActionTemplate[];
  initialState: GameStateData;
}

// 属性定义
export interface PropertyDefinition {
  key: string;
  name: string;
  type: 'String' | 'Number' | 'Boolean' | 'List' | 'Deep';
  defaultValue: any;
  min?: number;
  max?: number;
  description?: string;
}

// 实体模板
export interface EntityTemplate {
  key: string;
  name: string;
  properties: Property[];
  description?: string;
}

// 工具函数类型
export type PropertyPath = string | string[];

// 条件检查函数类型
export type ConditionChecker = (gameState: GameState, args: EventArgument[]) => boolean;

// 效果执行函数类型
export type EffectExecutor = (gameState: GameState, args: EventArgument[]) => void;

// 事件选择器函数类型
export type EventArgumentSelector = (gameState: GameState, params: any[]) => any;

// 游戏事件回调
export interface GameCallbacks {
  onGameOver?: (reason: string, score: number) => void;
  onPropertyChange?: (entityKey: string, propertyKey: string, oldValue: any, newValue: any) => void;
  onEventTriggered?: (event: Event) => void;
  onActionPerformed?: (action: Action) => void;
}

// UI 状态
export interface UIState {
  selectedAction: string | null;
  isGameOver: boolean;
  gameOverReason: string | null;
  score: number;
}

// 游戏存档
export interface GameSave {
  timestamp: number;
  gameState: GameStateData;
  metadata: {
    name: string;
    rounds: number;
    created: string;
  };
}