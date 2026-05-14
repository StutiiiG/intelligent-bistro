import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { MENU, MENU_BY_ID } from "./menu.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const anthropic = new Anthropic();

const MODEL = "claude-opus-4-7";

const VALID_IDS = MENU.map((m) => m.id);

const TOOLS = [
  {
    name: "update_cart",
    description:
      "Apply one or more changes to the user's shopping cart. Use this whenever the user expresses an intent to add, remove, or modify items. Multiple actions in one call are fine (e.g. add a sandwich and a drink).",
    input_schema: {
      type: "object",
      properties: {
        actions: {
          type: "array",
          description: "Ordered list of cart mutations to apply.",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["add", "remove", "set_quantity", "clear"],
                description:
                  "add: increment quantity by `quantity`. remove: remove the item entirely. set_quantity: replace quantity with `quantity` (0 removes). clear: empty the entire cart (no item_id needed).",
              },
              item_id: {
                type: "string",
                enum: VALID_IDS,
                description:
                  "The menu item id to modify. Required for add/remove/set_quantity.",
              },
              quantity: {
                type: "integer",
                minimum: 1,
                description:
                  "Quantity for add/set_quantity. Defaults to 1 if omitted.",
              },
              note: {
                type: "string",
                description:
                  "Optional preparation note from the user (e.g. 'no onions', 'extra spicy', 'large').",
              },
            },
            required: ["type"],
          },
        },
        reply: {
          type: "string",
          description:
            "A short, friendly natural-language confirmation to show the user. One or two sentences.",
        },
      },
      required: ["actions", "reply"],
    },
  },
  {
    name: "respond",
    description:
      "Reply to the user without changing the cart. Use this for menu questions, recommendations, greetings, or clarification.",
    input_schema: {
      type: "object",
      properties: {
        reply: {
          type: "string",
          description: "The natural-language reply to show the user.",
        },
      },
      required: ["reply"],
    },
  },
];

const PAIRING_TOOL = {
  name: "suggest_pairings",
  description:
    "Suggest 2 or 3 complementary items the guest may want to add. Each pairing has a short, appetizing reason.",
  input_schema: {
    type: "object",
    properties: {
      pairings: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            item_id: { type: "string", enum: VALID_IDS },
            reason: {
              type: "string",
              description:
                "Short pitch (one short sentence) for why this pairs well.",
            },
          },
          required: ["item_id", "reason"],
        },
      },
    },
    required: ["pairings"],
  },
};

function buildSystemPrompt() {
  const menuLines = MENU.map(
    (m) =>
      `- ${m.id} | ${m.name} ($${m.price.toFixed(2)}) — ${m.description} [${m.category}]`,
  ).join("\n");

  return `You are Alfred, the AI host at "The Intelligent Bistro." You help guests browse the menu and manage their order through conversation.

You have access to two tools:
- update_cart: call this whenever the user wants to add, remove, or modify items. Emit one or more structured actions.
- respond: call this for everything else (questions, recommendations, chit-chat, clarification).

ALWAYS call exactly one of these tools. Never reply with plain text.

# Menu (use these exact item_id values)
${menuLines}

# Guidelines
- Be warm and concise. One or two sentences per reply.
- If the user is ambiguous ("a drink", "something spicy"), pick the best match yourself unless there are multiple equally-good options — only then ask.
- When the user says a quantity like "two" or "a couple", translate it to an integer.
- Treat "large" / "small" / "extra X" / "no Y" as preparation notes — pass them in the note field.
- If the user asks to remove or clear, do it.
- Don't invent items that aren't on the menu. If asked for something we don't have, suggest the closest alternative.`;
}

function formatCartForPrompt(cart) {
  if (!cart || cart.length === 0) return "The cart is currently empty.";
  return cart
    .map((line) => {
      const item = MENU_BY_ID[line.item_id];
      const name = item ? item.name : line.item_id;
      const note = line.note ? ` (${line.note})` : "";
      return `- ${line.quantity}× ${name}${note}`;
    })
    .join("\n");
}

app.get("/api/menu", (_req, res) => {
  res.json({ menu: MENU });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: MODEL });
});

app.post("/api/chat", async (req, res) => {
  const { message, cart = [], history = [] } = req.body ?? {};
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message (string) is required" });
  }

  const cartContext = `Current cart:\n${formatCartForPrompt(cart)}`;

  const messages = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    {
      role: "user",
      content: `${cartContext}\n\nUser: ${message}`,
    },
  ];

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(),
      tools: TOOLS,
      tool_choice: { type: "any" },
      messages,
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse) {
      // Fallback: shouldn't happen with tool_choice=any, but be defensive.
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join(" ");
      return res.json({ reply: text || "Sorry, could you say that again?", actions: [] });
    }

    if (toolUse.name === "update_cart") {
      const { actions = [], reply = "" } = toolUse.input ?? {};
      return res.json({ reply, actions });
    }

    if (toolUse.name === "respond") {
      const { reply = "" } = toolUse.input ?? {};
      return res.json({ reply, actions: [] });
    }

    return res.json({ reply: "Hmm, I'm not sure what I just did.", actions: [] });
  } catch (err) {
    console.error("chat error:", err);
    const status = err?.status ?? 500;
    res.status(status).json({
      error: err?.message ?? "internal error",
      type: err?.type,
    });
  }
});

app.post("/api/pairings", async (req, res) => {
  const { cart = [] } = req.body ?? {};
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.json({ pairings: [] });
  }

  const cartContext = formatCartForPrompt(cart);
  const menuLines = MENU.map(
    (m) => `- ${m.id} | ${m.name} ($${m.price.toFixed(2)}) — ${m.category}`,
  ).join("\n");

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: `You are a sommelier-style host suggesting pairings at "The Intelligent Bistro." Given the current cart, propose 2–3 items that round out the meal — a drink if there's only food, a side if there's only a main, a dessert if the meal feels incomplete. Never suggest items already in the cart. Keep reasons short and appetizing.\n\n# Menu\n${menuLines}`,
      tools: [PAIRING_TOOL],
      tool_choice: { type: "tool", name: "suggest_pairings" },
      messages: [
        {
          role: "user",
          content: `Current cart:\n${cartContext}\n\nWhat pairs well?`,
        },
      ],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    const pairings = (toolUse?.input?.pairings ?? []).filter(
      (p) => !cart.some((line) => line.item_id === p.item_id),
    );
    res.json({ pairings });
  } catch (err) {
    console.error("pairings error:", err);
    res
      .status(err?.status ?? 500)
      .json({ error: err?.message ?? "internal error" });
  }
});

app.post("/api/chef-pick", async (req, res) => {
  const { prompt = "" } = req.body ?? {};
  const menuLines = MENU.map(
    (m) => `- ${m.id} | ${m.name} ($${m.price.toFixed(2)}) — ${m.description} [${m.category}]`,
  ).join("\n");

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `You are the chef at "The Intelligent Bistro." Curate a balanced 3-course meal for one guest: one main, one side or starter, and one drink or dessert. Use the update_cart tool to add the items, and in your reply, describe the meal in 1–2 evocative sentences (no bullet points).\n\n# Menu (use these exact item_id values)\n${menuLines}`,
      tools: TOOLS,
      tool_choice: { type: "tool", name: "update_cart" },
      messages: [
        {
          role: "user",
          content:
            prompt && prompt.trim()
              ? `Tonight's craving: ${prompt}. Curate a meal.`
              : "Curate tonight's chef's pick.",
        },
      ],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    const { actions = [], reply = "" } = toolUse?.input ?? {};
    res.json({ reply, actions });
  } catch (err) {
    console.error("chef-pick error:", err);
    res
      .status(err?.status ?? 500)
      .json({ error: err?.message ?? "internal error" });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`Intelligent Bistro backend listening on http://localhost:${PORT}`);
  console.log(`Model: ${MODEL}`);
});
