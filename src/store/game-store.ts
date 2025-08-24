import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { UIState, GameCallbacks, Action } from '../types';
import { GameInstance } from '../lib/game-instance';
import { gameConfigLoader } from '../lib/config-loader';

interface GameStore extends UIState {
  // 游戏实例
  gameInstance: GameInstance | null;
  
  // 游戏状态
  isLoading: boolean;
  error: string | null;
  
  // 可用行动
  availableActions: Action[];
  
  // 玩家属性
  playerStats: {
    morality: number;
    knowledge: number;
    physique: number;
    charm: number;
    items: string[];
  };
  
  // 游戏历史
  gameHistory: string[];
  
  // 操作方法
  initGame: () => Promise<void>;
  performAction: (actionName: string) => void;
  useItem: (itemKey: string) => void;
  resetGame: () => void;
  
  // 内部方法
  updateGameState: () => void;
  addToHistory: (message: string) => void;
}

const initialUIState: UIState = {
  selectedAction: null,
  isGameOver: false,
  gameOverReason: null,
  score: 0,
};

const initialPlayerStats = {
  morality: 0,
  knowledge: 0,
  physique: 0,
  charm: 0,
  items: [],
};

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    ...initialUIState,
    gameInstance: null,
    isLoading: false,
    error: null,
    availableActions: [],
    playerStats: initialPlayerStats,
    gameHistory: [],

    // 初始化游戏
    initGame: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // 加载游戏配置
        const config = await gameConfigLoader.loadGameConfig();
        
        // 验证配置
        if (!gameConfigLoader.validateGameConfig(config)) {
          throw new Error('Invalid game configuration');
        }
        
        // 创建游戏回调
        const callbacks: GameCallbacks = {
          onGameOver: (reason: string, score: number) => {
            set({ 
              isGameOver: true, 
              gameOverReason: reason, 
              score 
            });
            get().addToHistory(`游戏结束：${reason} 最终得分：${score}`);
          },
          
          onPropertyChange: (entityKey: string, propertyKey: string, oldValue: any, newValue: any) => {
            if (entityKey === 'PLAYER') {
              get().updateGameState();
              get().addToHistory(`${propertyKey} 变化：${oldValue} → ${newValue}`);
            }
          },
          
          onEventTriggered: (event) => {
            const description = event.getDesc();
            get().addToHistory(`事件：${description}`);
          },
          
          onActionPerformed: (action) => {
            const description = action.getDesc();
            get().addToHistory(`行动：${description}`);
            
            // 执行游戏更新
            get().gameInstance?.update();
            get().updateGameState();
          },
        };
        
        // 创建游戏实例
        const gameInstance = new GameInstance(config, callbacks);
        gameInstance.init();
        
        set({ 
          gameInstance,
          isLoading: false,
          isGameOver: false,
          gameOverReason: null,
          score: 0,
        });
        
        // 更新游戏状态
        get().updateGameState();
        get().addToHistory('游戏开始！你是一名高中生，在学校中经历各种事件...');
        
      } catch (error) {
        console.error('Failed to initialize game:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          isLoading: false,
        });
      }
    },

    // 执行行动
    performAction: (actionName: string) => {
      const { gameInstance, isGameOver } = get();
      if (!gameInstance || isGameOver) return;
      
      const success = gameInstance.performAction(actionName);
      if (success) {
        set({ selectedAction: actionName });
        // 游戏状态更新会在回调中处理
      }
    },

    // 使用道具
    useItem: (itemKey: string) => {
      const { gameInstance, isGameOver } = get();
      if (!gameInstance || isGameOver) return;
      
      const success = gameInstance.useItem(itemKey);
      if (success) {
        get().addToHistory(`使用了道具：${itemKey}`);
        get().updateGameState();
      }
    },

    // 重置游戏
    resetGame: () => {
      set({
        ...initialUIState,
        gameInstance: null,
        availableActions: [],
        playerStats: initialPlayerStats,
        gameHistory: [],
        error: null,
      });
    },

    // 更新游戏状态
    updateGameState: () => {
      const { gameInstance } = get();
      if (!gameInstance) return;

      const gameState = gameInstance.getGameState();
      const player = gameState.getEntity('PLAYER');
      
      if (player) {
        const playerStats = {
          morality: player.getProperty('morality')?._type === 'Number' ? 
            player.getProperty('morality')!.value as number : 0,
          knowledge: player.getProperty('knowledge')?._type === 'Number' ? 
            player.getProperty('knowledge')!.value as number : 0,
          physique: player.getProperty('physique')?._type === 'Number' ? 
            player.getProperty('physique')!.value as number : 0,
          charm: player.getProperty('charm')?._type === 'Number' ? 
            player.getProperty('charm')!.value as number : 0,
          items: player.getProperty('items')?._type === 'List' ? 
            player.getProperty('items')!.value as string[] : [],
        };
        
        set({ playerStats });
      }
      
      // 更新可用行动
      const availableActions = gameInstance.getAvailableActions();
      set({ 
        availableActions,
        score: gameInstance.getScore(),
      });
    },

    // 添加到历史记录
    addToHistory: (message: string) => {
      set(state => ({
        gameHistory: [...state.gameHistory, message],
      }));
    },
  }))
);

// 订阅游戏状态变化
useGameStore.subscribe(
  (state) => state.gameInstance,
  (gameInstance) => {
    if (gameInstance) {
      // 游戏实例创建后的额外处理
      console.log('Game instance created');
    }
  }
);