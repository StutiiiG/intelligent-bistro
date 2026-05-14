import { View, Text, Pressable, Image } from "react-native";
import { useCart } from "../store/cart.js";
import { MENU_BY_ID } from "../data/menu.js";

export default function CartLine({ line }) {
  const item = MENU_BY_ID[line.item_id];
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  if (!item) return null;

  return (
    <View className="mb-3 flex-row items-center rounded-2xl bg-bone p-3">
      <Image
        source={{ uri: item.image }}
        className="h-16 w-16 rounded-xl"
        resizeMode="cover"
      />
      <View className="ml-3 flex-1">
        <Text className="font-display text-base font-semibold text-ink">
          {item.name}
        </Text>
        {line.note ? (
          <Text className="mt-0.5 text-xs italic text-ink/60">
            {line.note}
          </Text>
        ) : null}
        <Text className="mt-1 text-sm text-ink/70">
          ${(item.price * line.quantity).toFixed(2)}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Pressable
          onPress={() =>
            setQuantity(line.item_id, line.quantity - 1, line.note)
          }
          className="h-8 w-8 items-center justify-center rounded-full bg-cream active:opacity-70"
        >
          <Text className="text-lg text-ink">−</Text>
        </Pressable>
        <Text className="mx-3 w-5 text-center font-semibold text-ink">
          {line.quantity}
        </Text>
        <Pressable
          onPress={() =>
            setQuantity(line.item_id, line.quantity + 1, line.note)
          }
          className="h-8 w-8 items-center justify-center rounded-full bg-cream active:opacity-70"
        >
          <Text className="text-lg text-ink">+</Text>
        </Pressable>
        <Pressable
          onPress={() => remove(line.item_id, line.note)}
          className="ml-2 h-8 w-8 items-center justify-center"
        >
          <Text className="text-base text-terracotta">×</Text>
        </Pressable>
      </View>
    </View>
  );
}
