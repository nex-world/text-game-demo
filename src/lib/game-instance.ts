import type { 
  GameInstance as IGameInstance, 
  GameConfig,
  EventTemplate,
  ActionTemplate,
  GameCallbacks,
  ListItem,
} from '../types';
import { GameState } from './game-state';
import { GameEngine } from './game-engine';
import { Action } from './event';
import { clamp, getPropertyNumber } from '../utils/property-utils';

const playerStatKeys = ['morality', 'knowledge', 'physique', 'charm'] as const;
type PlayerStatKey = typeof playerStatKeys[number];

const playerStatLabels: Record<PlayerStatKey, string> = {
  morality: '道德',
  knowledge: '知识',
  physique: '体魄',
  charm: '魅力',
};

export class GameInstance implements IGameInstance {
  state: GameState;
  private engine: GameEngine;
  private config: GameConfig;
  private callbacks: GameCallbacks;
  private eventTemplates: EventTemplate[];
  private actionTemplates: ActionTemplate[];

  constructor(config: GameConfig, callbacks: GameCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
    this.engine = new GameEngine();
    this.eventTemplates = config.eventTemplates;
    this.actionTemplates = config.actionTemplates;
    this.state = new GameState(config.initialState);
  }

  init(): void {
    // 初始化游戏状态
    this.state = new GameState(this.config.initialState);
    
    // 检查死亡条件
    this.checkGameOver();
    
    // 触发初始事件
    this.triggerAvailableEvents();
  }

  update(): void {
    // 增加回合数
    this.state.incrementRounds();
    
    // 应用被动效果（如诅咒道具）
    this.applyPassiveEffects();
    
    // 检查死亡条件
    if (this.checkGameOver()) {
      return;
    }
    
    // 触发可用事件
    this.triggerAvailableEvents();
  }

  private checkGameOver(): boolean {
    const player = this.state.getEntity('PLAYER');
    if (!player) return false;

    const morality = getPropertyNumber(player.getProperty('morality'));
    const knowledge = getPropertyNumber(player.getProperty('knowledge'));
    const physique = getPropertyNumber(player.getProperty('physique'));
    const charm = getPropertyNumber(player.getProperty('charm'));

    let gameOverReason: string | null = null;

    if (morality <= -20) {
      gameOverReason = '道德值过低，你被混混杀死了。';
    } else if (morality >= 20) {
      gameOverReason = '道德值过高，你在见义勇为时不幸死亡。';
    } else if (knowledge <= -20) {
      gameOverReason = '知识水平太低，你被迫退学了。';
    } else if (knowledge >= 20) {
      gameOverReason = '过度学习，你因劳累过度而猝死。';
    } else if (physique <= -20) {
      gameOverReason = '体质太差，你因病重而死。';
    } else if (physique >= 20) {
      gameOverReason = '锻炼过度，你在运动时猝死。';
    } else if (charm <= -20) {
      gameOverReason = '魅力太低，你被霸凌致死。';
    } else if (charm >= 20) {
      gameOverReason = '魅力过高，你被人情杀。';
    }

    if (gameOverReason && this.consumeLuckyCharmForDeath()) {
      return false;
    }

    if (gameOverReason) {
      this.callbacks.onGameOver?.(gameOverReason, this.state.rounds);
      return true;
    }

    return false;
  }

  private applyPassiveEffects(): void {
    const player = this.state.getEntity('PLAYER');
    if (!player) return;

    const items = player.getProperty('items');
    if (items?._type === 'List') {
      for (const itemKey of items.value) {
        if (itemKey === 'curse_book') {
          // 诅咒之书的效果：每回合道德-1，知识+2
          this.setPlayerNumber(player, 'morality', getPropertyNumber(player.getProperty('morality')) - 1);
          this.setPlayerNumber(player, 'knowledge', getPropertyNumber(player.getProperty('knowledge')) + 2);
        }
      }
    }
  }

  private triggerAvailableEvents(): void {
    // 触发可用的自动事件
    for (const eventTemplate of this.eventTemplates) {
      const event = this.engine.createEvent(eventTemplate, this.state);
      if (event && this.engine.canExecuteEvent(event, this.state)) {
        this.engine.executeEvent(event, this.state);
        this.callbacks.onEventTriggered?.(event);
        break; // 每次只触发一个事件
      }
    }
  }

  public getAvailableActions(): Action[] {
    const actions: Action[] = [];
    
    for (const actionTemplate of this.actionTemplates) {
      const action = this.engine.createAction(actionTemplate, this.state);
      if (action && this.engine.canExecuteEvent(action, this.state)) {
        actions.push(action);
      }
    }
    
    return actions;
  }

  public performAction(actionName: string): boolean {
    const actionTemplate = this.actionTemplates.find(template => template.name === actionName);
    if (!actionTemplate) return false;

    const action = this.engine.createAction(actionTemplate, this.state);
    if (!action || !this.engine.canExecuteEvent(action, this.state)) {
      return false;
    }

    this.engine.executeEvent(action, this.state);
    this.callbacks.onActionPerformed?.(action);
    
    return true;
  }

  public useItem(itemKey: string): boolean {
    const player = this.state.getEntity('PLAYER');
    if (!player) return false;

    if (!this.hasPlayerItem(itemKey)) {
      return false;
    }

    let message: string | null = null;

    switch (itemKey) {
      case 'lucky_charm':
        message = this.useLuckyCharm();
        break;
      case 'energy_drink':
        message = this.useEnergyDrink();
        break;
      case 'love_letter':
        message = this.useLoveLetter();
        break;
      case 'curse_book':
        message = this.discardCurseBook();
        break;
      default:
        return false;
    }

    if (!message) {
      return false;
    }

    this.callbacks.onItemUsed?.(itemKey, message);
    this.checkGameOver();
    return true;
  }

  private useLuckyCharm(): string | null {
    const stabilizedStats = this.stabilizeDangerousStats(15);

    if (stabilizedStats.length === 0) {
      return '幸运符没有反应';
    }

    this.removePlayerItem('lucky_charm');
    return `幸运符生效：${stabilizedStats.join('、')}回到安全范围`;
  }

  private consumeLuckyCharmForDeath(): boolean {
    if (!this.hasPlayerItem('lucky_charm')) {
      return false;
    }

    const stabilizedStats = this.stabilizeDangerousStats(20);
    if (stabilizedStats.length === 0) {
      return false;
    }

    this.removePlayerItem('lucky_charm');
    this.callbacks.onItemUsed?.(
      'lucky_charm',
      `幸运符碎裂：${stabilizedStats.join('、')}回到安全范围`
    );
    return true;
  }

  private stabilizeDangerousStats(threshold: number): string[] {
    const player = this.state.getEntity('PLAYER');
    if (!player) return [];

    const changedStats: string[] = [];

    for (const key of playerStatKeys) {
      const value = getPropertyNumber(player.getProperty(key));
      if (Math.abs(value) >= threshold) {
        this.setPlayerNumber(player, key, value > 0 ? 10 : -10);
        changedStats.push(playerStatLabels[key]);
      }
    }

    return changedStats;
  }

  private useEnergyDrink(): string {
    const player = this.state.getEntity('PLAYER');
    if (!player) return '';

    const currentPhysique = getPropertyNumber(player.getProperty('physique'));
    const currentCharm = getPropertyNumber(player.getProperty('charm'));

    this.setPlayerNumber(player, 'physique', clamp(currentPhysique + 4, -20, 19));
    this.setPlayerNumber(player, 'charm', clamp(currentCharm - 1, -19, 20));
    this.removePlayerItem('energy_drink');

    return '能量饮料生效：体魄+4，魅力-1';
  }

  private useLoveLetter(): string {
    const player = this.state.getEntity('PLAYER');
    if (!player) return '';

    const currentCharm = getPropertyNumber(player.getProperty('charm'));
    const currentMorality = getPropertyNumber(player.getProperty('morality'));

    this.setPlayerNumber(player, 'charm', clamp(currentCharm + 3, -20, 19));
    this.setPlayerNumber(player, 'morality', clamp(currentMorality - 1, -19, 20));
    this.removePlayerItem('love_letter');

    return '情书生效：魅力+3，道德-1';
  }

  private discardCurseBook(): string {
    this.removePlayerItem('curse_book');
    return '丢掉了诅咒之书：每回合惩罚停止';
  }

  private setPlayerNumber(player: ReturnType<GameState['getEntity']>, key: PlayerStatKey, value: number): void {
    if (!player) return;

    const oldValue = getPropertyNumber(player.getProperty(key));
    if (oldValue === value) return;

    player.setProperty(key, {
      key,
      value,
      _type: 'Number',
    });

    this.callbacks.onPropertyChange?.('PLAYER', key, oldValue, value);
  }

  private hasPlayerItem(itemKey: string): boolean {
    const player = this.state.getEntity('PLAYER');
    const items = player?.getProperty('items');
    return items?._type === 'List' && items.value.includes(itemKey);
  }

  private removePlayerItem(itemKey: string): void {
    const player = this.state.getEntity('PLAYER');
    const items = player?.getProperty('items');
    if (items?._type !== 'List') return;

    player?.setProperty('items', {
      key: 'items',
      itemType: 'String',
      value: items.value.filter((item: ListItem) => item !== itemKey),
      _type: 'List'
    });
  }

  public getGameState(): GameState {
    return this.state;
  }

  public getScore(): number {
    return this.state.rounds;
  }
}
