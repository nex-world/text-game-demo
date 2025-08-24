import { Card, CardContent } from '../ui/card';

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <h2 className="text-xl font-semibold">加载游戏中...</h2>
            <p className="text-muted-foreground">正在初始化校园生存游戏</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorScreen({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-4xl">⚠️</div>
            <h2 className="text-xl font-semibold text-destructive">加载失败</h2>
            <p className="text-muted-foreground">{error}</p>
            {onRetry && (
              <button 
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                重试
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}