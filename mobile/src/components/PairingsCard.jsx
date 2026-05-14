import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { fetchPairings } from "../api/client.js";
import { useCart } from "../store/cart.js";
import { MENU_BY_ID } from "../data/menu.js";

// Debounce key — refetch pairings when the set of item_ids changes,
// not on every quantity tweak.
function cartFingerprint(lines) {
  return lines
    .map((l) => l.item_id)
    .sort()
    .join(",");
}

export default function PairingsCard() {
  const lines = useCart((s) => s.lines);
  const add = useCart((s) => s.add);
  const [pairings, setPairings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fp = cartFingerprint(lines);

  useEffect(() => {
    if (!fp) {
      setPairings([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      fetchPairings(lines)
        .then((res) => {
          if (!cancelled) setPairings(res.pairings ?? []);
        })
        .catch(() => {
          if (!cancelled) setPairings([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 600); // debounce: let rapid taps settle
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fp]);

  if (!fp) return null;

  return (
    <View className="mb-3 rounded-2xl bg-bone p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-display text-base font-semibold text-ink">
          Alfred suggests
        </Text>
        {loading ? <ActivityIndicator size="small" color="#1A1A1A" /> : null}
      </View>

      {pairings.length === 0 && !loading ? (
        <Text className="text-sm text-ink/50">
          Your order looks complete.
        </Text>
      ) : null}

      {pairings.map((p) => {
        const item = MENU_BY_ID[p.item_id];
        if (!item) return null;
        return (
          <View
            key={p.item_id}
            className="mt-2 flex-row items-center justify-between rounded-xl bg-cream px-3 py-2.5"
          >
            <View className="flex-1 pr-3">
              <Text className="font-display text-sm font-semibold text-ink">
                {item.name}{" "}
                <Text className="font-normal text-ink/50">
                  · ${item.price.toFixed(2)}
                </Text>
              </Text>
              <Text className="mt-0.5 text-xs italic text-ink/60">
                {p.reason}
              </Text>
            </View>
            <Pressable
              onPress={() => add(item.id, 1)}
              className="rounded-full bg-sage px-3 py-1.5 active:opacity-80"
            >
              <Text className="text-xs font-semibold text-cream">Add</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
