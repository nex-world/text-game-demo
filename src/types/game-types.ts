import { z } from 'zod';

// 游戏内容类型
export const GameContentTypeStringSchema = z.union([
  z.literal('String'),
  z.literal('Number'),
  z.literal('Boolean'),
  z.literal('EntityKey'),
  z.literal('EventKey'),
  z.literal('Any'),
]);

export type GameContentTypeString = z.infer<typeof GameContentTypeStringSchema>;

// 基础属性类型
export const StringPropertySchema = z.object({
  key: z.string(),
  value: z.string(),
  _type: z.literal('String').optional(),
});

export const NumberPropertySchema = z.object({
  key: z.string(),
  value: z.number(),
  _type: z.literal('Number').optional(),
});

export const BooleanPropertySchema = z.object({
  key: z.string(),
  value: z.boolean(),
  _type: z.literal('Boolean').optional(),
});

// 递归类型定义需要用 z.lazy
export const PropertySchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    StringPropertySchema,
    NumberPropertySchema,
    BooleanPropertySchema,
    ListPropertySchema,
    DeepPropertySchema,
  ])
);

export const ListItemSchema: z.ZodType<any> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), PropertySchema])
);

export const ListPropertySchema = z.object({
  key: z.string(),
  itemType: GameContentTypeStringSchema,
  value: z.array(ListItemSchema),
  _type: z.literal('List').optional(),
});

export const DeepPropertySchema: z.ZodType<any> = z.object({
  key: z.string(),
  value: z.array(PropertySchema),
  _type: z.literal('Deep').optional(),
});

export type StringProperty = z.infer<typeof StringPropertySchema>;
export type NumberProperty = z.infer<typeof NumberPropertySchema>;
export type BooleanProperty = z.infer<typeof BooleanPropertySchema>;
export type ListProperty = z.infer<typeof ListPropertySchema>;
export type DeepProperty = z.infer<typeof DeepPropertySchema>;
export type Property = z.infer<typeof PropertySchema>;
export type ListItem = z.infer<typeof ListItemSchema>;

// 实体相关
export const EntityDataSchema = z.object({
  id: z.string(),
  key: z.string(),
  properties: z.array(PropertySchema),
});

export type EntityData = z.infer<typeof EntityDataSchema>;

// 事件论元相关
export const EventArgumentSelectorMethodNameSchema = z.union([
  z.literal('keyIs'),
  z.literal('PLAYER'),
  z.literal('entityKeyIs'),
  z.literal('eventKeyIs'),
  z.literal('LocationKeyIs'),
  z.string(),
]);

export const EventArgumentTemplateSchema = z.object({
  name: z.string(),
  selector: EventArgumentSelectorMethodNameSchema,
});

export const EventArgumentSchema = z.object({
  template: z.string(),
  params: z.array(z.any()),
});

export type EventArgumentSelectorMethodName = z.infer<typeof EventArgumentSelectorMethodNameSchema>;
export type EventArgumentTemplate = z.infer<typeof EventArgumentTemplateSchema>;
export type EventArgument = z.infer<typeof EventArgumentSchema>;

// 事件条件相关
export const ConditionMethodNameSchema = z.union([
  z.literal('eq'),
  z.literal('neq'),
  z.literal('gt'),
  z.literal('lte'),
  z.literal('lt'),
  z.literal('gte'),
  z.literal('is'),
  z.literal('not'),
  z.literal('in'),
  z.literal('contains'),
  z.literal('notIn'),
  z.literal('notContains'),
  z.string(),
]);

export const ConditionTemplateSchema = z.object({
  method: ConditionMethodNameSchema,
  params: z.array(z.any()),
});

export type ConditionMethodName = z.infer<typeof ConditionMethodNameSchema>;
export type ConditionTemplate = z.infer<typeof ConditionTemplateSchema>;

// 事件效果相关
export const EffectMethodNameSchema = z.union([
  z.literal('delta'),
  z.literal('toggle'),
  z.literal('set'),
  z.literal('add'),
  z.literal('remove'),
  z.string(),
]);

export const EffectTemplateSchema = z.object({
  method: EffectMethodNameSchema,
  params: z.array(z.any()),
});

export type EffectMethodName = z.infer<typeof EffectMethodNameSchema>;
export type EffectTemplate = z.infer<typeof EffectTemplateSchema>;

// 事件相关
export const EventTemplateSchema = z.object({
  name: z.string(),
  args: z.array(EventArgumentTemplateSchema),
  descTemplate: z.string(),
  conditions: z.array(ConditionTemplateSchema),
  effects: z.array(EffectTemplateSchema),
});

export const EventStateSchema = z.union([
  z.literal('pending'),
  z.literal('resolved'),
  z.literal('rejected'),
]);

export const EventDataSchema = z.object({
  id: z.string(),
  template: EventTemplateSchema,
  args: z.array(EventArgumentSchema),
  state: EventStateSchema,
  done: z.boolean(),
  result: z.any(),
});

export type EventTemplate = z.infer<typeof EventTemplateSchema>;
export type EventState = z.infer<typeof EventStateSchema>;
export type EventData = z.infer<typeof EventDataSchema>;

// 行动相关
export const ActionTemplateSchema = EventTemplateSchema.extend({
  isAction: z.literal(true),
});

export const ActionDataSchema = EventDataSchema;

export type ActionTemplate = z.infer<typeof ActionTemplateSchema>;
export type ActionData = z.infer<typeof ActionDataSchema>;

// 游戏状态相关
export const GameStateDataSchema = z.object({
  entities: z.array(EntityDataSchema),
  globalProperties: z.array(PropertySchema),
  history: z.array(EventDataSchema),
  rounds: z.number(),
});

export type GameStateData = z.infer<typeof GameStateDataSchema>;