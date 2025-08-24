import type { GameConfig, PropertyDefinition, EntityTemplate } from '../types';
import { 
  EventTemplateSchema,
  ActionTemplateSchema,
  GameStateDataSchema,
} from '../types/game-types';

// 导入JSON文件
import propertyDefsData from '../data/property-defs.json';
import entityTemplatesData from '../data/entity-templates.json';
import eventTemplatesData from '../data/event-templates.json';
import actionTemplatesData from '../data/action-templates.json';
import initialStateData from '../data/initial-state.json';

export class GameConfigLoader {
  private static instance: GameConfigLoader;

  static getInstance(): GameConfigLoader {
    if (!GameConfigLoader.instance) {
      GameConfigLoader.instance = new GameConfigLoader();
    }
    return GameConfigLoader.instance;
  }

  async loadGameConfig(): Promise<GameConfig> {
    try {
      // 验证和解析属性定义
      const propertyDefs = this.validatePropertyDefs(propertyDefsData);
      
      // 验证和解析实体模板
      const entityTemplates = this.validateEntityTemplates(entityTemplatesData);
      
      // 验证和解析事件模板
      const eventTemplates = eventTemplatesData.map(template => 
        EventTemplateSchema.parse(template)
      );
      
      // 验证和解析行动模板
      const actionTemplates = actionTemplatesData.map(template => 
        ActionTemplateSchema.parse(template)
      );
      
      // 验证和解析初始状态
      const initialState = GameStateDataSchema.parse(initialStateData);

      return {
        propertyDefs,
        entityTemplates,
        eventTemplates,
        actionTemplates,
        initialState,
      };
    } catch (error) {
      console.error('Failed to load game config:', error);
      throw new Error('Failed to load game configuration');
    }
  }

  private validatePropertyDefs(data: any[]): PropertyDefinition[] {
    return data.map(item => {
      try {
        // 由于我们没有定义PropertyDefinitionSchema，这里手动验证
        if (!item.key || !item.name || !item.type) {
          throw new Error('Invalid property definition');
        }
        return item as PropertyDefinition;
      } catch (error) {
        console.error('Invalid property definition:', item, error);
        throw error;
      }
    });
  }

  private validateEntityTemplates(data: any[]): EntityTemplate[] {
    return data.map(item => {
      try {
        // 手动验证实体模板
        if (!item.key || !item.name || !Array.isArray(item.properties)) {
          throw new Error('Invalid entity template');
        }
        return item as EntityTemplate;
      } catch (error) {
        console.error('Invalid entity template:', item, error);
        throw error;
      }
    });
  }

  // 获取特定属性定义
  getPropertyDef(propertyDefs: PropertyDefinition[], key: string): PropertyDefinition | undefined {
    return propertyDefs.find(def => def.key === key);
  }

  // 获取特定实体模板
  getEntityTemplate(entityTemplates: EntityTemplate[], key: string): EntityTemplate | undefined {
    return entityTemplates.find(template => template.key === key);
  }

  // 验证游戏配置的完整性
  validateGameConfig(config: GameConfig): boolean {
    try {
      // 检查是否有PLAYER实体
      const playerTemplate = this.getEntityTemplate(config.entityTemplates, 'PLAYER');
      if (!playerTemplate) {
        console.error('Missing PLAYER entity template');
        return false;
      }

      // 检查是否有必要的属性定义
      const requiredProps = ['morality', 'knowledge', 'physique', 'charm'];
      for (const propKey of requiredProps) {
        const propDef = this.getPropertyDef(config.propertyDefs, propKey);
        if (!propDef) {
          console.error(`Missing property definition: ${propKey}`);
          return false;
        }
      }

      // 检查初始状态是否包含PLAYER实体
      const playerEntity = config.initialState.entities.find(e => e.key === 'PLAYER');
      if (!playerEntity) {
        console.error('Missing PLAYER entity in initial state');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Game config validation failed:', error);
      return false;
    }
  }
}

// 导出单例实例
export const gameConfigLoader = GameConfigLoader.getInstance();