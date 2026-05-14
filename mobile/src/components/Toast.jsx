import { View, Text, Pressable } from "react-native";
import { useToast } from "../store/toast.js";

export default function Toast() {
  const visible = useToast((s) => s.visible);
  const title = useToast((s) => s.title);
  const message = useToast((s) => s.message);
  const actions = useToast((s) => s.actions);
  const hide = useToast((s) => s.hide);

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(13, 13, 13, 0.45)",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <View
        className="rounded-3xl bg-cream"
        style={{
          width: "100%",
          maxWidth: 360,
          padding: 24,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
        }}
      >
        <Text className="font-display text-xl font-bold text-ink">
          {title}
        </Text>
        {message ? (
          <Text className="mt-2 text-[15px] leading-6 text-ink/70">
            {message}
          </Text>
        ) : null}

        <View className="mt-5 flex-row" style={{ justifyContent: "flex-end" }}>
          {actions.length === 0 ? (
            <Pressable
              onPress={hide}
              className="rounded-full bg-ink px-5 py-2 active:opacity-80"
            >
              <Text className="text-sm font-semibold text-cream">OK</Text>
            </Pressable>
          ) : (
            actions.map((a, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  hide();
                  a.onPress?.();
                }}
                className={`ml-2 rounded-full px-5 py-2 active:opacity-80 ${
                  a.primary ? "bg-terracotta" : "bg-bone"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    a.primary ? "text-cream" : "text-ink"
                  }`}
                >
                  {a.label}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </View>
    </View>
  );
}
