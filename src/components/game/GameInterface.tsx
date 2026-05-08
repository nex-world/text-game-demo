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
    resetGame,
    score,
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
                回合: {score}
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

      </main>

      {/* 游戏结束模态框 */}
      <GameOverModal />
    </div>
  );
}
