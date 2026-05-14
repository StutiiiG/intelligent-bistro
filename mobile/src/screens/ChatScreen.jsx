import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useCart } from "../store/cart.js";
import { sendChat } from "../api/client.js";
import ChatBubble from "../components/ChatBubble.jsx";

const SUGGESTIONS = [
  "Two spicy chicken sandwiches and a large water",
  "What's something light?",
  "Add a margherita and an iced latte",
  "Make it three pepperoni pizzas instead",
  "Clear my cart",
];

export default function ChatScreen() {
  const lines = useCart((s) => s.lines);
  const applyActions = useCart((s) => s.applyActions);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I'm Alfred. Tell me what you're in the mood for and I'll get your order started.",
    },
  ]);
  const scrollRef = useRef(null);

  async function send(text) {
    const userText = text.trim();
    if (!userText || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setBusy(true);
    try {
      const history = messages
        .filter((m) => !!m.text)
        .map((m) => ({ role: m.role, content: m.text }));
      const res = await sendChat({
        message: userText,
        cart: lines,
        history,
      });
      applyActions(res.actions ?? []);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: res.reply || "Done.",
          actions: res.actions,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Sorry — I couldn't reach the kitchen. (${err.message})`,
        },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() =>
        scrollRef.current?.scrollToEnd({ animated: true }),
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-cream"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View className="px-5 pt-2 pb-3">
        <Text className="font-display text-3xl font-bold text-ink">Alfred</Text>
        <Text className="mt-1 text-sm text-ink/60">
          Your AI host. Just say what you want.
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-5"
        style={{ minHeight: 0 }}
        contentContainerStyle={{ paddingBottom: 8 }}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            role={m.role}
            text={m.text}
            actions={m.actions}
          />
        ))}
        {busy ? (
          <View className="mb-3 max-w-[60%] self-start rounded-2xl bg-bone px-4 py-3">
            <ActivityIndicator size="small" color="#1A1A1A" />
          </View>
        ) : null}
      </ScrollView>

      {messages.length <= 2 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 pb-2"
          style={{ flexGrow: 0, flexShrink: 0 }}
          contentContainerStyle={{ paddingRight: 20, alignItems: "center" }}
        >
          {SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => send(s)}
              className="mr-2 rounded-full bg-bone px-3 py-2"
            >
              <Text className="text-xs text-ink/70">{s}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View className="flex-row items-center border-t border-ink/10 bg-bone px-3 py-3">
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          placeholder="Add two iced lattes…"
          placeholderTextColor="#1A1A1A66"
          className="mr-2 flex-1 rounded-full bg-cream px-4 py-2.5 text-[15px] text-ink"
          editable={!busy}
          returnKeyType="send"
        />
        <Pressable
          onPress={() => send(input)}
          disabled={busy || !input.trim()}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            busy || !input.trim() ? "bg-ink/30" : "bg-ink"
          }`}
        >
          <Text className="text-base text-cream">↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
