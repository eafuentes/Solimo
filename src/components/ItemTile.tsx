import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ItemTileProps {
  id: string;
  value?: string | number;
  selected?: boolean;
  onPress: (id: string) => void;
}

/**
 * Individual item tile (tap target)
 * Large, friendly, accessible size
 */
export const ItemTile: React.FC<ItemTileProps> = ({
  id,
  value,
  selected = false,
  onPress,
}: ItemTileProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(id)}
      className={`w-24 h-24 rounded-lg justify-center items-center border-4 ${
        selected ? 'bg-blue-200 border-blue-500' : 'bg-white border-gray-200'
      }`}
      activeOpacity={0.7}
    >
      <Text className="text-4xl font-bold">{value}</Text>
    </TouchableOpacity>
  );
};

export default ItemTile;
