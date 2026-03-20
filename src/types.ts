export type ActivityId =
  | 'colors'
  | 'shapes'
  | 'numbers'
  | 'patterns'
  | 'memory'
  | 'sorting'
  | 'logic'
  | 'writing';

export type Difficulty = 1 | 2 | 3;
export type AgeBand = '3-4' | '5-6' | '7-8' | '9-10';
export type PromptType = 'tap_one' | 'tap_many';
export type ItemType = 'color' | 'shape' | 'number' | 'icon';

export type Item = {
  id: string;
  type: ItemType;
  value?: string | number;
  assetKey?: string;
};

export type Prompt = {
  id: string;
  type: PromptType;
  instruction: string;
  items: Item[];
  correctIds: string[];
};
