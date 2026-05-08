import entityTemplates from '../data/entity-templates.json';

interface ItemInfo {
  name: string;
  effect: string;
}

const itemInfoMap = new Map<string, ItemInfo>(
  entityTemplates
    .filter((template) => template.key !== 'PLAYER')
    .map((template) => {
      const effect = template.properties.find((property) => property.key === 'effect')?.value;
      return [
        template.key,
        {
          name: template.name,
          effect: String(effect ?? template.description ?? template.key),
        },
      ];
    })
);

export function getItemName(itemKey: string): string {
  return itemInfoMap.get(itemKey)?.name ?? itemKey;
}

export function getItemEffect(itemKey: string): string {
  return itemInfoMap.get(itemKey)?.effect ?? '';
}

export function getItemActionLabel(itemKey: string): string {
  return itemKey === 'curse_book' ? '丢弃' : '使用';
}
