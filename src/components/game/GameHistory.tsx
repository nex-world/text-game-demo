import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useGameStore } from '../../store/game-store';

export function GameHistory() {
  const { gameHistory, isGameOver } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameHistory]);

  return (
    <Card className={`${isGameOver ? 'opacity-60' : ''}`}>
      <CardHeader>
        <CardTitle>游戏历史</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollRef}
          className="space-y-2 max-h-64 overflow-y-auto pr-2"
        >
          {gameHistory.length > 0 ? (
            gameHistory.map((entry, index) => (
              <div 
                key={index}
                className={`text-sm p-2 rounded border-l-2 ${
                  entry.includes('事件：') ? 'border-blue-400 bg-blue-50' :
                  entry.includes('行动：') ? 'border-green-400 bg-green-50' :
                  entry.includes('游戏结束') ? 'border-red-400 bg-red-50' :
                  entry.includes('变化：') ? 'border-yellow-400 bg-yellow-50' :
                  'border-gray-400 bg-gray-50'
                }`}
              >
                {entry}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              暂无历史记录
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}