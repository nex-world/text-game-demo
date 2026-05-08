import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useGameStore } from '../../store/game-store';
import { getItemActionLabel, getItemEffect, getItemName } from '../../utils/item-utils';

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
            <h4 className="text-sm font-medium">道具</h4>
            <div className="space-y-2">
              {playerStats.items.map((item) => (
                <Button
                  key={item}
                  variant="secondary"
                  size="sm"
                  className="h-auto w-full justify-between gap-3 py-2 text-left"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="min-w-0">
                    <div className="font-medium">{getItemName(item)}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {getItemEffect(item)}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs">{getItemActionLabel(item)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
