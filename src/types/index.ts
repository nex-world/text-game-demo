// 导出所有类型定义
export * from './game-types';
export * from './interfaces';

// 重新导出常用类型 - 从正确的模块导出
export type {
  Entity,
  Event,
  Action,
  GameState,
  GameInstance,
  GameConfig,
  PropertyDefinition,
  EntityTemplate,
  GameCallbacks,
  UIState,
  GameSave,
} from './interfaces';

export type {
  Property,
  StringProperty,
  NumberProperty,
  BooleanProperty,
  ListProperty,
  DeepProperty,
  GameContentTypeString,
  EntityData,
  EventData,
  ActionData,
  GameStateData,
  EventArgument,
  EventArgumentTemplate,
  ConditionTemplate,
  EffectTemplate,
  EventTemplate,
  ActionTemplate,
} from './game-types';