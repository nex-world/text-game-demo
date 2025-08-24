import { useEffect } from 'react';
import { Button } from '../ui/button';
import { useGameStore } from '../../store/game-store';
import { PlayerStats } from './PlayerStats';
import { GameHistory } from './GameHistory';
import { ActionPanel } from './ActionPanel';
import { GameOverModal } from './GameOverModal';
import { LoadingScreen, ErrorScreen } from './LoadingScreen';

export function GameInterface() {
  const { 
    gameInstance, 
    isLoading, 
    error, 
    initGame, 
    resetGame 
  } = useGameStore();

  useEffect(() => {
    if (!gameInstance && !isLoading && !error) {
      initGame();
    }
  }, [gameInstance, isLoading, error, initGame]);

  // 加载状态
  if (isLoading) {
    return <LoadingScreen />;
  }

  // 错误状态
  if (error) {
    return <ErrorScreen error={error} onRetry={initGame} />;
  }

  // 未初始化状态
  if (!gameInstance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">校园生存游戏</h1>
          <p className="text-muted-foreground">点击开始游戏</p>
          <Button onClick={initGame}>开始游戏</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 游戏标题栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">校园生存游戏</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                回合: {useGameStore.getState().score}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetGame}
              >
                重置游戏
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主游戏区域 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：玩家状态 */}
          <div className="lg:col-span-1 space-y-6">
            <PlayerStats />
          </div>

          {/* 中间：游戏历史 */}
          <div className="lg:col-span-1">
            <GameHistory />
          </div>

          {/* 右侧：操作面板 */}
          <div className="lg:col-span-1">
            <ActionPanel />
          </div>
        </div>

        {/* 游戏说明 */}
        <div className="mt-8 bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">游戏说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">游戏目标</h4>
              <ul className="space-y-1">
                <li>• 在校园中生存尽可能多的回合</li>
                <li>• 平衡四项属性：道德、知识、体魄、魅力</li>
                <li>• 避免任何属性达到极值（±20）</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">死亡条件</h4>
              <ul className="space-y-1">
                <li>• 道德 -20：被混混杀死</li>
                <li>• 道德 +20：见义勇为时死亡</li>
                <li>• 知识 -20：被迫退学</li>
                <li>• 知识 +20：学习过度猝死</li>
                <li>• 体魄 -20：因病重而死</li>
                <li>• 体魄 +20：锻炼过度猝死</li>
                <li>• 魅力 -20：被霸凌致死</li>
                <li>• 魅力 +20：被情杀</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* 游戏结束模态框 */}
      <GameOverModal />
    </div>
  );
}