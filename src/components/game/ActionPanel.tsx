import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useGameStore } from '../../store/game-store';

export function ActionPanel() {
  const { 
    availableActions, 
    selectedAction, 
    isGameOver, 
    playerStats,
    performAction,
    useItem 
  } = useGameStore();

  const handleActionClick = (actionName: string) => {
    if (!isGameOver) {
      performAction(actionName);
    }
  };

  const handleItemClick = (itemKey: string) => {
    if (!isGameOver) {
      useItem(itemKey);
    }
  };

  if (isGameOver) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>游戏操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">游戏已结束</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>可选行动</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 行动选项 */}
        <div className="space-y-2">
          {availableActions.length > 0 ? (
            availableActions.map((action) => (
              <Button
                key={action.id}
                variant={selectedAction === action.template.name ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleActionClick(action.template.name)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{action.getDesc()}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {action.template.name}
                  </span>
                </div>
              </Button>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              暂无可用行动
            </div>
          )}
        </div>

        {/* 道具使用 */}
        {playerStats.items.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">使用道具</h4>
            <div className="grid grid-cols-2 gap-2">
              {playerStats.items.map((item, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  className="h-auto py-2"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex flex-col items-center">
                    <Badge variant="outline" className="mb-1">
                      {item}
                    </Badge>
                    <span className="text-xs">使用</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 游戏提示 */}
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• 属性值范围：-20 到 +20</p>
            <p>• 达到极值（±20）会导致游戏结束</p>
            <p>• 合理使用道具可以避免危险</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}