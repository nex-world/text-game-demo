import type { Property, PropertyPath } from '../types';

/**
 * 解析属性路径，支持链式访问如 "player.morality" 或 ["player", "morality"]
 */
export function parsePropertyPath(path: PropertyPath): string[] {
  if (Array.isArray(path)) {
    return path;
  }
  return path.split('.');
}

/**
 * 在属性数组中查找指定键的属性
 */
export function findProperty(properties: Property[], key: string): Property | undefined {
  return properties.find(prop => prop.key === key);
}

/**
 * 在属性数组中设置指定键的属性
 */
export function setProperty(properties: Property[], key: string, value: Property): Property[] {
  const index = properties.findIndex(prop => prop.key === key);
  if (index >= 0) {
    const newProperties = [...properties];
    newProperties[index] = value;
    return newProperties;
  } else {
    return [...properties, value];
  }
}

/**
 * 深度获取嵌套属性值
 */
export function getNestedProperty(properties: Property[], keyChain: string[]): Property | undefined {
  if (keyChain.length === 0) return undefined;
  
  const [firstKey, ...restKeys] = keyChain;
  const property = findProperty(properties, firstKey);
  
  if (!property) return undefined;
  
  if (restKeys.length === 0) {
    return property;
  }
  
  if (property._type === 'Deep') {
    return getNestedProperty(property.value, restKeys);
  }
  
  return undefined;
}

/**
 * 深度设置嵌套属性值
 */
export function setNestedProperty(properties: Property[], keyChain: string[], value: Property): Property[] {
  if (keyChain.length === 0) return properties;
  
  const [firstKey, ...restKeys] = keyChain;
  
  if (restKeys.length === 0) {
    return setProperty(properties, firstKey, value);
  }
  
  const existingProperty = findProperty(properties, firstKey);
  
  if (!existingProperty || existingProperty._type !== 'Deep') {
    const newDeepProperty: Property = {
      key: firstKey,
      value: setNestedProperty([], restKeys, value),
      _type: 'Deep'
    };
    return setProperty(properties, firstKey, newDeepProperty);
  }
  
  const updatedDeepProperty: Property = {
    ...existingProperty,
    value: setNestedProperty(existingProperty.value, restKeys, value),
  };
  
  return setProperty(properties, firstKey, updatedDeepProperty);
}

/**
 * 克隆属性对象
 */
export function cloneProperty(property: Property): Property {
  if (property._type === 'List') {
    return {
      ...property,
      value: [...property.value],
    };
  } else if (property._type === 'Deep') {
    return {
      ...property,
      value: property.value.map(cloneProperty),
    };
  } else {
    return { ...property };
  }
}

/**
 * 解析模板字符串，支持 lodash 风格的插值
 */
export function interpolateTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\$\{([^}]+)\}/g, (match, expression) => {
    try {
      // 简单的表达式解析，支持点号访问
      const keys = expression.trim().split('.');
      let value = data;
      for (const key of keys) {
        value = value?.[key];
      }
      return value != null ? String(value) : match;
    } catch {
      return match;
    }
  });
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 检查值是否在范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 获取属性的数值（如果是数值类型）
 */
export function getPropertyNumber(property: Property | undefined): number {
  if (property?._type === 'Number') {
    return property.value;
  }
  return 0;
}

/**
 * 获取属性的字符串值
 */
export function getPropertyString(property: Property | undefined): string {
  if (property?._type === 'String') {
    return property.value;
  }
  return '';
}

/**
 * 获取属性的布尔值
 */
export function getPropertyBoolean(property: Property | undefined): boolean {
  if (property?._type === 'Boolean') {
    return property.value;
  }
  return false;
}

/**
 * 获取属性的列表值
 */
export function getPropertyList(property: Property | undefined): any[] {
  if (property?._type === 'List') {
    return property.value;
  }
  return [];
}