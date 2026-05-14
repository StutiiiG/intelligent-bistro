import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { MENU, CATEGORIES, DIET_FILTERS } from "../data/menu.js";
import MenuCard from "../components/MenuCard.jsx";
import { useCart } from "../store/cart.js";

export default function MenuScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDiet, setActiveDiet] = useState(null);

  const items = useMemo(() => {
    return MENU.filter((m) => {
      if (activeCategory !== "All" && m.category !== activeCategory)
        return false;
      if (activeDiet && !(m.tags ?? []).includes(activeDiet)) return false;
      return true;
    });
  }, [activeCategory, activeDiet]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF5ED", minHeight: 0 }}>
      <View className="px-5 pt-3 pb-3">
        <Text className="font-display text-3xl font-bold text-ink">
          The Bistro
        </Text>
        <Text className="mt-1 text-sm text-ink/60">
          Slow food, fast service. Tap an item or talk to Alfred.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5"
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingRight: 20, alignItems: "center" }}
      >
        {["All", ...CATEGORIES].map((cat) => {
          const selected = activeCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              className={`mr-2 rounded-full px-4 py-2 ${
                selected ? "bg-ink" : "bg-bone"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected ? "text-cream" : "text-ink/70"
                }`}
              >
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-2 px-5"
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingRight: 20, alignItems: "center" }}
      >
        {DIET_FILTERS.map((f) => {
          const selected = activeDiet === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setActiveDiet(selected ? null : f.key)}
              className={`mr-2 flex-row items-center rounded-full border px-3 py-1.5 ${
                selected
                  ? "border-sage bg-sage"
                  : "border-ink/15 bg-transparent"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  selected ? "text-cream" : "text-ink/60"
                }`}
              >
                {selected ? "✓ " : ""}
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1, minHeight: 0, marginTop: 12 }}
        contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 20 }}
      >
        {items.length === 0 ? (
          <View className="mt-12 items-center">
            <Text className="text-ink/40">No items match those filters.</Text>
          </View>
        ) : (
          items.map((item) => <MenuCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </View>
  );
}
