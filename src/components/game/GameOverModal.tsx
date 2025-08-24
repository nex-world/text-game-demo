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

          {/* 评价文本 */}
          <div className="text-center text-sm text-muted-foreground">
            {score >= 50 && "令人敬佩！你在这个危险的世界中生存了很久。"}
            {score >= 30 && score < 50 && "不错的表现！你已经掌握了生存的基本技巧。"}
            {score >= 20 && score < 30 && "还算可以，继续努力保持平衡。"}
            {score >= 10 && score < 20 && "需要更好地平衡各项属性。"}
            {score < 10 && "别灰心，多试几次你会找到诀窍的。"}
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

          {/* 提示信息 */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>提示：合理平衡四项属性是生存的关键</p>
            <p>避免任何属性达到±20的极值</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}