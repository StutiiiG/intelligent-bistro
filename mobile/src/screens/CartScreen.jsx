import { View, Text, ScrollView, Pressable } from "react-native";
import { useCart, cartSubtotal } from "../store/cart.js";
import CartLine from "../components/CartLine.jsx";
import PairingsCard from "../components/PairingsCard.jsx";

export default function CartScreen({ onCheckout }) {
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = cartSubtotal(lines);
  const tax = subtotal * 0.0925;
  const total = subtotal + tax;

  return (
    <View className="flex-1 bg-cream">
      <View className="flex-row items-end justify-between px-5 pt-2 pb-3">
        <Text className="font-display text-3xl font-bold text-ink">
          Your Order
        </Text>
        {lines.length > 0 ? (
          <Pressable onPress={clear} className="pb-1">
            <Text className="text-sm text-terracotta">Clear all</Text>
          </Pressable>
        ) : null}
      </View>

      {lines.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center text-lg text-ink/40">
            Nothing in your cart yet.{"\n"}Add something from the menu or ask
            Alfred for a recommendation.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-2"
          style={{ minHeight: 0 }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {lines.map((l, i) => (
            <CartLine key={`${l.item_id}-${l.note ?? ""}-${i}`} line={l} />
          ))}
          <PairingsCard />
        </ScrollView>
      )}

      {lines.length > 0 ? (
        <View className="border-t border-ink/10 bg-bone px-5 py-4">
          <Row label="Subtotal" value={subtotal} />
          <Row label="Tax (9.25%)" value={tax} muted />
          <View className="my-2 h-px bg-ink/10" />
          <Row label="Total" value={total} bold />
          <Pressable
            onPress={onCheckout}
            className="mt-3 items-center rounded-full bg-terracotta py-3 active:opacity-80"
          >
            <Text className="text-base font-semibold text-cream">
              Place order — ${total.toFixed(2)}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Row({ label, value, bold, muted }) {
  return (
    <View className="flex-row justify-between py-0.5">
      <Text
        className={`${bold ? "font-display text-base font-semibold text-ink" : muted ? "text-sm text-ink/50" : "text-sm text-ink/70"}`}
      >
        {label}
      </Text>
      <Text
        className={`${bold ? "font-display text-base font-semibold text-ink" : muted ? "text-sm text-ink/50" : "text-sm text-ink"}`}
      >
        ${value.toFixed(2)}
      </Text>
    </View>
  );
}
