import "./global.css";
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";

import MenuScreen from "./src/screens/MenuScreen.jsx";
import CartScreen from "./src/screens/CartScreen.jsx";
import ChatScreen from "./src/screens/ChatScreen.jsx";
import Toast from "./src/components/Toast.jsx";

import { useCart, cartItemCount } from "./src/store/cart.js";
import { useToast } from "./src/store/toast.js";

const TAB_BAR_HEIGHT = 64;

const TABS = [
  { key: "menu", label: "Menu" },
  { key: "chat", label: "Alfred" },
  { key: "cart", label: "Cart" },
];

export default function App() {
  const [tab, setTab] = useState("menu");
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const count = cartItemCount(lines);
  const showToast = useToast((s) => s.show);

  function handleCheckout() {
    showToast({
      title: "Order placed",
      message: "Thanks! Your food is on the way.",
      actions: [
        {
          label: "OK",
          primary: true,
          onPress: () => {
            clear();
            setTab("menu");
          },
        },
      ],
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF5ED", position: "relative" }}>
      <StatusBar style="dark" />

      {/* Content area: absolutely positioned, leaves room for the tab bar */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: TAB_BAR_HEIGHT,
          overflow: "hidden",
        }}
      >
        <View style={{ flex: 1, display: tab === "menu" ? "flex" : "none" }}>
          <MenuScreen onNavigateToCart={() => setTab("cart")} />
        </View>
        <View style={{ flex: 1, display: tab === "chat" ? "flex" : "none" }}>
          <ChatScreen />
        </View>
        <View style={{ flex: 1, display: tab === "cart" ? "flex" : "none" }}>
          <CartScreen onCheckout={handleCheckout} />
        </View>
      </View>

      {/* Tab bar: absolutely pinned to the bottom */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: TAB_BAR_HEIGHT,
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: "rgba(26,26,26,0.10)",
          backgroundColor: "#F5EFE6",
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          const showBadge = t.key === "cart" && count > 0;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
              className="active:opacity-70"
            >
              <View className="flex-row items-center">
                <Text
                  className={`font-display text-base ${
                    active ? "text-ink" : "text-ink/40"
                  }`}
                >
                  {t.label}
                </Text>
                {showBadge ? (
                  <View className="ml-1.5 min-w-[18px] rounded-full bg-terracotta px-1.5 py-0.5">
                    <Text className="text-center text-[10px] font-bold text-cream">
                      {count}
                    </Text>
                  </View>
                ) : null}
              </View>
              {active ? (
                <View className="mt-1 h-0.5 w-6 rounded-full bg-terracotta" />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Toast />
    </View>
  );
}
