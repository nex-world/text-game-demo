import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useGameStore } from '../../store/game-store';

export function GameOverModal() {
  const { 
    isGameOver, 
    gameOverReason, 
    score, 
    resetGame, 
    initGame 
  } = useGameStore();

  if (!isGameOver) return null;

  const handleRestart = async () => {
    resetGame();
    await initGame();
  };

  const getScoreRating = (score: number): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (score >= 50) return { text: "传奇", variant: "default" };
    if (score >= 30) return { text: "优秀", variant: "secondary" };
    if (score >= 20) return { text: "良好", variant: "outline" };
    if (score >= 10) return { text: "普通", variant: "secondary" };
    return { text: "新手", variant: "destructive" };
  };

  const rating = getScoreRating(score);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">游戏结束</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 死亡原因 */}
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-destructive">
              {gameOverReason}
            </p>
          </div>

          {/* 得分显示 */}
          <div className="text-center space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">存活回合</p>
              <p className="text-3xl font-bold">{score}</p>
            </div>
            
            <div className="flex justify-center">
              <Badge variant={rating.variant} className="text-lg px-4 py-1">
                {rating.text}
              </Badge>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button 
              onClick={handleRestart}
              className="flex-1"
            >
              重新开始
            </Button>
            <Button 
              variant="outline"
              onClick={resetGame}
              className="flex-1"
            >
              返回主页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
