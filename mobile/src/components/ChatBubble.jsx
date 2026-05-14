import { View, Text } from "react-native";

export default function ChatBubble({ role, text, actions }) {
  const isUser = role === "user";
  return (
    <View
      className={`mb-3 max-w-[85%] rounded-2xl px-4 py-3 ${
        isUser ? "self-end bg-ink" : "self-start bg-bone"
      }`}
    >
      <Text
        className={`text-[15px] leading-5 ${
          isUser ? "text-cream" : "text-ink"
        }`}
      >
        {text}
      </Text>
      {!isUser && actions && actions.length > 0 ? (
        <View className="mt-2 border-t border-ink/10 pt-2">
          {actions.map((a, i) => (
            <Text key={i} className="text-xs text-sage">
              ✓ {summarizeAction(a)}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function summarizeAction(a) {
  switch (a.type) {
    case "add":
      return `added ${a.quantity ?? 1} × ${a.item_id}${a.note ? ` (${a.note})` : ""}`;
    case "remove":
      return `removed ${a.item_id}`;
    case "set_quantity":
      return `set ${a.item_id} to ${a.quantity}`;
    case "clear":
      return "cleared cart";
    default:
      return a.type;
  }
}
