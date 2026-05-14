# The Intelligent Bistro

A high-fidelity mobile experience where an AI host manages restaurant ordering through conversation. Built with **React Native (Expo)** + **NativeWind** on the frontend and **Node.js (Express)** + the **Anthropic SDK** on the backend.

The AI (called "Alfred") parses natural-language orders like *"add two spicy chicken sandwiches and a large water"* into structured cart actions and applies them in real time — no slash commands, no buttons, just conversation.

## Architecture

```
┌──────────────────────────────┐       ┌──────────────────────────────┐
│  Expo App (mobile/)          │       │  Express API (backend/)      │
│                              │       │                              │
│  • Menu / Cart / Chat tabs   │ HTTPS │  POST /api/chat              │
│  • Zustand cart store        │──────▶│   → Claude w/ tool use       │
│  • NativeWind styling        │       │   → returns {reply, actions} │
│  • applyActions(actions)     │◀──────│                              │
└──────────────────────────────┘       └──────────────────────────────┘
```

### How the AI interaction works

The backend exposes a single `POST /api/chat` endpoint. It sends the conversation + current cart to **Claude (Opus 4.7)** along with two tools defined via the Messages API:

- `update_cart(actions[], reply)` — emit one or more structured mutations: `add`, `remove`, `set_quantity`, `clear`.
- `respond(reply)` — reply without mutating the cart (for questions, recs, chit-chat).

`tool_choice: { type: "any" }` forces the model to always pick one. The structured `actions` array is applied client-side by `cart.applyActions()` — UI updates atomically without re-fetching state. This keeps the model honest about *what* it just did, separately from what it *says* it did.

## Project layout

```
intelligent-bistro/
├── backend/
│   ├── src/
│   │   ├── server.js         # Express + Anthropic SDK + tool definitions
│   │   └── menu.js           # Canonical menu data
│   ├── .env.example
│   └── package.json
└── mobile/
    ├── App.js                # Tab navigation entry
    ├── src/
    │   ├── screens/          # MenuScreen, CartScreen, ChatScreen
    │   ├── components/       # MenuCard, CartLine, ChatBubble
    │   ├── store/cart.js     # Zustand store + applyActions reducer
    │   ├── api/client.js     # fetch wrapper for /api/chat
    │   └── data/menu.js      # Client-side menu mirror
    ├── tailwind.config.js    # NativeWind theme (cream/ink/terracotta)
    └── package.json
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # then put your ANTHROPIC_API_KEY in .env
npm run dev                # starts http://localhost:3001
```

Verify with `curl http://localhost:3001/api/health`.

### 2. Mobile

```bash
cd mobile
npm install
cp .env.example .env       # leave the default for localhost dev
npm start                  # opens Expo dev tools
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

> **Note on physical devices:** `localhost` won't resolve from a phone on your LAN. Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your machine's LAN IP (e.g. `http://192.168.1.42:3001`).

## Beyond the brief — features that set this apart

These weren't required but make the experience feel like a finished product:

### 💡 Smart Pairings (proactive AI suggestions in the cart)
The **Cart** tab includes an "Alfred suggests" card that hits `/api/pairings` whenever the cart composition changes (debounced 600 ms). The model is given a dedicated `suggest_pairings` tool with its own schema (`item_id` + short `reason`) and returns 2–3 complementary items the guest hasn't ordered yet. Tap "Add" on any suggestion to pull it into the order. This is genuinely useful — most demos show *reactive* AI; this one is *proactive*.

### 🥬 Dietary filter chips
Secondary chip row under the category filter (Vegetarian / Spicy / Sweet) — filters the menu by a tag taxonomy on each item. Combinable with category filters.

### 💾 Cart persistence
Zustand `persist` middleware backed by **AsyncStorage**. Close the app, reopen it — your order is exactly where you left it.

### Architectural touches worth pointing out in the demo
- **Three separate AI surfaces, one shared menu schema.** Chat, pairings, and chef's pick are three different system prompts + tool definitions, but they all reference the same `VALID_IDS` enum on the server, so any of them can mutate the cart with the same guarantees.
- **Cart fingerprinting.** `PairingsCard` re-queries the AI only when the *set* of items changes — not on quantity tweaks — so adjusting "3 → 4 burgers" doesn't trigger a request.
- **Forced tool choice for deterministic endpoints.** Chef's Pick and Pairings pin `tool_choice` to a specific tool, so we never have to handle a free-text fallback.

## Tech

- **Frontend:** React Native, Expo SDK 51, NativeWind 4 (Tailwind for RN), Zustand
- **Backend:** Node.js (ESM), Express, `@anthropic-ai/sdk`
- **Model:** `claude-opus-4-7` via the Messages API with `tool_choice: any`

## Built with

This project was built using **Claude Code** (Anthropic's CLI agent) as the primary coding assistant, with the official `@anthropic-ai/sdk` for the runtime AI calls.
