
这是一个极简的文字游戏项目。

#### Demo游戏设定

这是一个校园生存游戏。
故事背景：玩家是一名高中生，在学校中经历各种事件，做出选择，并发现世界背后的阴谋。
实体：
- 只有一个角色，就是 "PLAYER" 玩家。
- 有若干道具，可通过消耗道具影响事件走势。
属性：
- 玩家角色有4个数值型属性，分别是 "道德" "知识" "体魄" "魅力"
  - 每个属性的初始值为 0 ，范围是 -20 到 +20
- 玩家角色还有一个道具列表，包含各种道具的ID，可用于条件判断
- 游戏有一些全局属性，用于影响事件的触发和处理
  - 比如通过 IsInEventSequence 和 CurrentEventSequence 来控制某些连锁事件的触发
事件：
- 玩家在学校中经历各种事件，比如上课、放学、参加社团活动等。
- 这些事件通常会给出两个行动选项，玩家可以通过选择不同的行动来影响事件的结果。
- 这些事件或选择会改变玩家的属性值，或者改变玩家持有的道具。
  - 当玩家的任何一个属性达到 -20 或 +20 时，都会导致玩家死亡。
  - 道德 -20 时，玩家会被混混杀死。
  - 道德 +20 时，玩家会在见义勇为时死亡。
  - 知识 -20 时，玩家会被迫退学。
  - 知识 +20 时，玩家会因为太刻苦而猝死。
  - 体魄 -20 时，玩家会因病重而死。
  - 体魄 +20 时，玩家会在锻炼时猝死。
  - 魅力 -20 时，玩家会被霸凌致死。
  - 魅力 +20 时，玩家会被情杀。
  - 因此游戏的乐趣就在于要通过各种选择，维持数值的平衡，避免走向极端。
  - 一些道具可以在关键时刻通过修正数值来避免死亡。
  - 一些道具有危险的效果，会在每个回合都固定改变数值，增加死亡的危险。玩家必须想办法除去这些道具。
- 玩家死亡时，游戏结束，记录玩家存活的回合数作为得分。


#### 游戏界面

- 极简的界面，不需要任何美观层面的考虑，只要把信息展示清楚即可
- 从上到下布局
  - 状态区: 展示玩家当前所有属性状态以及持有的道具等
  - 历史区: 展示玩家经历过的事件
  - 操作区: 列出当下所有可选择的行动
- 注意界面设计要具有通用性，不要局限于前面给出的 Demo 游戏
  - 比如状态区应该是动态生成的，而不是写死的4个属性
  - 历史区和操作区也应该是通用的，能够适应不同的事件和行动


#### 核心游戏机制

- 读取状态 → 触发事件 → 玩家反应 → 更新状态


#### 主要数据结构

```ts
// 属性或数值
type Property = StringProperty | NumberProperty | BooleanProperty | ListProperty | DeepProperty;
type ListItem = string | number | boolean | Property;
type GameContentTypeString =
  'String' |
  'Number' |
  'Boolean' |
  'EntityKey' |    // string
  'EventKey' |     // string
  'Any';           // ListItem
interface StringProperty { key: string; value: string; _type?: "String"; }
interface NumberProperty { key: string; value: number; _type?: "Number"; }
interface BooleanProperty { key: string; value: boolean; _type?: "Boolean"; }
interface ListProperty {
  key: string;
  itemType: GameContentTypeString;
  value: ListItem[];
  _type?: "List";
}
interface DeepProperty { key: string; value: Property[]; _type?: "Deep"; }

// 实体 游戏中的角色、物体等
interface EntityData {
  id: string;  // 唯一标识符
  key: string; // 语义化的标识符
  properties: Property[];
}
interface Entity extends EntityData {
  getProperty(keyChain: string|string[]): Property | undefined;
  setProperty(keyChain: string|string[], value: Property): void;
  getData(): EntityData;
}



// 事件论元 事件的参与者 participant
type EventArgumentSelectorMethodName =
  'keyIs' |
  'PLAYER' |
  'entityKeyIs' |
  'eventKeyIs' |
  'LocationKeyIs' |
  string;
interface EventArgumentTemplate {
  name: string;
  selector: EventArgumentSelectorMethodName;
}
interface EventArgument {
  template: EventArgumentTemplate['name'];
  params: any[];
}

// 事件条件
type ConditionMethodName =
  'eq' | 'neq' |
  'gt' | 'lte' |
  'lt' | 'gte' |
  'is' | 'not' |
  'in' | 'contains' |
  'notIn' | 'notContains' |
  string;
interface ConditionTemplate {
  method: ConditionMethodName;
  params: any[]; // 通常涉及 EventArgument 的 name 、 Property 的 keyChain ，以及具体条件的参数等
}

// 事件效果
type EffectMethodName =
  'delta' |     // 数值差值
  'toggle' |    // 切换布尔值
  'set' |       // 直接修改
  'add' |       // 给列表添加元素
  'remove' |    // 从列表移除元素
  string;       // 其他潜在的方法
interface EffectTemplate {
  method: EffectMethodName;
  params: any[]; // 通常涉及 EventArgument 的 name 、 Property 的 keyChain ，以及具体变化的参数等
}

// 事件
interface EventTemplate {
  name: string;
  args: EventArgumentTemplate[];
  descTemplate: string;  // 使用 lodash-es 的模板字符串，其中的变量是 args 的 name
  conditions: ConditionTemplate[];
  effects: EffectTemplate[];
}
interface EventData {
  id: string;
  template: EventTemplate;
  args: EventArgument[];
  state: 'pending' | 'resolved' | 'rejected';
  done: boolean;
  result: any;
}
interface Event extends EventData {
  getDesc(): string;
  getArg(name: string): EventArgument | undefined;
  getData(): EventData;
}


// 行动
// 行动是玩家可以选择触发的事件
interface ActionTemplate extends EventTemplate { isAction: true }
interface ActionData extends EventData {}
interface Action extends ActionData {}

// 普通事件如何给出行动选项？
// 通过设置 effects 改变全局状态中的 "availableActionNames" 这一 property 来实现。
// 每个行动选项都设置 condition ，可根据 "availableActionNames" 以及其他上下文信息来决定是否可用。


// 游戏状态
interface GameStateData {
  entities: EntityData[];
  globalProperties: Property[];
  history: EventData[];
  rounds: number;
}
interface GameState extends GameStateData {
  entities: Entity[];
  getEntity(keyOrId: string): Entity | undefined;
  addEntity(entity: Entity): void;
  removeEntity(keyOrId: string): void;
  getEntityProperty(entityKey: string, propKeyChain: string|string[]): Property | undefined;
  setEntityProperty(entityKey: string, propKeyChain: string|string[], value: Property): void;

  globalProperties: Property[];
  getGlobalProperty(keyChain: string|string[]): Property | undefined;
  setGlobalProperty(keyChain: string|string[], value: Property): void;
  getData(): GameStateData;

  history: Event[];
  rounds: number;
}

// 游戏实例
interface GameInstance {
  state: GameState;
  init: () => void;
  update: () => void;

}
```

#### 游戏配置文件

- src/data/
  - property-defs.json       // demo 中为4个属性定义
  - entity-templates.json    // demo 中为主角和道具的模板
  - event-templates.json     // demo 中为各种事件(包括 actions)的模板
  - initial-state.json       // demo 中为初始状态定义


#### 技术栈

- TypeScript, Vite
- React, tsx
- Zustand
- UI: Tailwind CSS + shadcn
- 存档管理: idb
- 校验: Zod


#### 开发要求

- 尽可能极致简化，避免任何不必要的复杂性
- 禁止使用 enum, 这是一种糟糕的做法，应该直接使用联合类型来代替。
- 不允许直接在 package.json 中编辑依赖项，必须使用 pnpm 来管理。
- 通过命令行来初始化或使用 shadcn, vite 等工具，而不要手动创建相关的文件夹和文件。
  - 比如用 `pnpm dlx shadcn@latest add <组件名>` 来添加 shadcn 组件。
- tsconfig 要支持不带 .ts 后缀名的导入。

