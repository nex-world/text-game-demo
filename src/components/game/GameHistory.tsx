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

  const getEntryClassName = (entry: string): string => {
    if (entry.includes('事件：')) return 'bg-blue-50';
    if (entry.includes('行动：')) return 'bg-green-50';
    if (entry.includes('游戏结束')) return 'bg-red-50';
    if (entry.includes('变化：')) return 'bg-yellow-50';
    if (entry.includes('道具：') || entry.includes('获得道具') || entry.includes('失去道具')) {
      return 'bg-gray-100';
    }
    return 'bg-gray-50';
  };

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
                className={`rounded px-3 py-2 text-sm ${getEntryClassName(entry)}`}
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
