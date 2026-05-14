import { View, Text, Image, Pressable } from "react-native";
import { useCart } from "../store/cart.js";

export default function MenuCard({ item }) {
  const add = useCart((s) => s.add);

  return (
    <View className="mb-4 overflow-hidden rounded-2xl bg-bone shadow-sm">
      <Image
        source={{ uri: item.image }}
        className="h-44 w-full"
        resizeMode="cover"
      />
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="font-display text-lg font-semibold text-ink">
              {item.name}
            </Text>
            <Text className="mt-1 text-sm leading-5 text-ink/70">
              {item.description}
            </Text>
          </View>
          <Text className="font-display text-lg font-semibold text-terracotta">
            ${item.price.toFixed(2)}
          </Text>
        </View>

        <Pressable
          onPress={() => add(item.id, 1)}
          className="mt-3 self-start rounded-full bg-ink px-4 py-2 active:opacity-80"
        >
          <Text className="text-sm font-medium text-cream">Add to cart</Text>
        </Pressable>
      </View>
    </View>
  );
}
