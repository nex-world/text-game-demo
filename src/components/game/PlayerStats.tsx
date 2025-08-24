import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { useGameStore } from '../../store/game-store';

export function PlayerStats() {
  const { playerStats, isGameOver } = useGameStore();

  const getStatColor = (value: number): "destructive" | "secondary" | "default" => {
    if (value <= -15) return 'destructive';
    if (value >= 15) return 'destructive';
    if (value <= -10 || value >= 10) return 'secondary';
    return 'default';
  };

  const getProgressValue = (value: number): number => {
    // 将 -20 到 20 的范围映射到 0 到 100
    return ((value + 20) / 40) * 100;
  };

  const formatStatValue = (value: number): string => {
    return value >= 0 ? `+${value}` : `${value}`;
  };

  return (
    <Card className={`${isGameOver ? 'opacity-60' : ''}`}>
      <CardHeader>
        <CardTitle>角色状态</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 四维属性 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">道德</span>
              <Badge variant={getStatColor(playerStats.morality)}>
                {formatStatValue(playerStats.morality)}
              </Badge>
            </div>
            <Progress 
              value={getProgressValue(playerStats.morality)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">知识</span>
              <Badge variant={getStatColor(playerStats.knowledge)}>
                {formatStatValue(playerStats.knowledge)}
              </Badge>
            </div>
            <Progress 
              value={getProgressValue(playerStats.knowledge)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">体魄</span>
              <Badge variant={getStatColor(playerStats.physique)}>
                {formatStatValue(playerStats.physique)}
              </Badge>
            </div>
            <Progress 
              value={getProgressValue(playerStats.physique)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">魅力</span>
              <Badge variant={getStatColor(playerStats.charm)}>
                {formatStatValue(playerStats.charm)}
              </Badge>
            </div>
            <Progress 
              value={getProgressValue(playerStats.charm)} 
              className="h-2"
            />
          </div>
        </div>

        {/* 道具列表 */}
        <div className="space-y-2">
          <span className="text-sm font-medium">持有道具</span>
          <div className="flex flex-wrap gap-2">
            {playerStats.items.length > 0 ? (
              playerStats.items.map((item, index) => (
                <Badge key={index} variant="outline">
                  {item}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">无</span>
            )}
          </div>
        </div>

        {/* 游戏信息 */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span>回合数</span>
            <span className="font-medium">{useGameStore.getState().score}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}