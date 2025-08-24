import type { 
  GameInstance as IGameInstance, 
  GameConfig,
  EventTemplate,
  ActionTemplate,
  GameCallbacks,
} from '../types';
import { GameState } from './game-state';
import { GameEngine } from './game-engine';
import { Action } from './event';
import { getPropertyNumber } from '../utils/property-utils';

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
          const currentMorality = getPropertyNumber(player.getProperty('morality'));
          const currentKnowledge = getPropertyNumber(player.getProperty('knowledge'));
          
          player.setProperty('morality', { 
            key: 'morality', 
            value: currentMorality - 1, 
            _type: 'Number' 
          });
          
          player.setProperty('knowledge', { 
            key: 'knowledge', 
            value: currentKnowledge + 2, 
            _type: 'Number' 
          });

          this.callbacks.onPropertyChange?.('PLAYER', 'morality', currentMorality, currentMorality - 1);
          this.callbacks.onPropertyChange?.('PLAYER', 'knowledge', currentKnowledge, currentKnowledge + 2);
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

    const items = player.getProperty('items');
    if (items?._type !== 'List' || !items.value.includes(itemKey)) {
      return false;
    }

    // 根据道具效果执行相应逻辑
    switch (itemKey) {
      case 'lucky_charm':
        this.useLuckyCharm();
        break;
      case 'energy_drink':
        this.useEnergyDrink();
        break;
      case 'love_letter':
        this.useLoveLetter();
        break;
      default:
        return false;
    }

    // 移除一次性道具
    if (['lucky_charm', 'energy_drink', 'love_letter'].includes(itemKey)) {
      const newItems = items.value.filter((item: any) => item !== itemKey);
      player.setProperty('items', {
        key: 'items',
        itemType: 'String',
        value: newItems,
        _type: 'List'
      });
    }

    return true;
  }

  private useLuckyCharm(): void {
    // 护身符逻辑：在即将死亡时可以拯救角色
    const player = this.state.getEntity('PLAYER');
    if (!player) return;

    const morality = getPropertyNumber(player.getProperty('morality'));
    const knowledge = getPropertyNumber(player.getProperty('knowledge'));
    const physique = getPropertyNumber(player.getProperty('physique'));
    const charm = getPropertyNumber(player.getProperty('charm'));

    // 将所有极值拉回安全范围
    if (morality <= -19 || morality >= 19) {
      player.setProperty('morality', { key: 'morality', value: 0, _type: 'Number' });
    }
    if (knowledge <= -19 || knowledge >= 19) {
      player.setProperty('knowledge', { key: 'knowledge', value: 0, _type: 'Number' });
    }
    if (physique <= -19 || physique >= 19) {
      player.setProperty('physique', { key: 'physique', value: 0, _type: 'Number' });
    }
    if (charm <= -19 || charm >= 19) {
      player.setProperty('charm', { key: 'charm', value: 0, _type: 'Number' });
    }
  }

  private useEnergyDrink(): void {
    const player = this.state.getEntity('PLAYER');
    if (!player) return;

    const currentPhysique = getPropertyNumber(player.getProperty('physique'));
    const currentCharm = getPropertyNumber(player.getProperty('charm'));

    player.setProperty('physique', {
      key: 'physique',
      value: Math.min(currentPhysique + 3, 20),
      _type: 'Number'
    });

    player.setProperty('charm', {
      key: 'charm',
      value: Math.max(currentCharm - 1, -20),
      _type: 'Number'
    });
  }

  private useLoveLetter(): void {
    const player = this.state.getEntity('PLAYER');
    if (!player) return;

    const currentCharm = getPropertyNumber(player.getProperty('charm'));

    player.setProperty('charm', {
      key: 'charm',
      value: Math.min(currentCharm + 2, 20),
      _type: 'Number'
    });

    // 可能触发特殊事件（这里简化处理）
  }

  public getGameState(): GameState {
    return this.state;
  }

  public getScore(): number {
    return this.state.rounds;
  }
}