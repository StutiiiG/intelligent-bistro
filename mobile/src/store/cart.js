import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MENU_BY_ID } from "../data/menu.js";

// Cart line: { item_id, quantity, note? }
//
// Lines are keyed by `item_id` + `note`, so "2× burger" and "1× burger no onions"
// stay as separate lines.

function keyOf(item_id, note) {
  return note ? `${item_id}::${note}` : item_id;
}

export const useCart = create(
  persist(
    (set, get) => ({
      lines: [],

      add: (item_id, quantity = 1, note) => {
        if (!MENU_BY_ID[item_id]) return;
        set((state) => {
          const key = keyOf(item_id, note);
          const existing = state.lines.find(
            (l) => keyOf(l.item_id, l.note) === key,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                keyOf(l.item_id, l.note) === key
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { item_id, quantity, note }] };
        });
      },

      remove: (item_id, note) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) =>
              !(l.item_id === item_id && (note == null || l.note === note)),
          ),
        })),

      setQuantity: (item_id, quantity, note) => {
        if (quantity <= 0) {
          get().remove(item_id, note);
          return;
        }
        set((state) => {
          const key = keyOf(item_id, note);
          const existing = state.lines.find(
            (l) => keyOf(l.item_id, l.note) === key,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                keyOf(l.item_id, l.note) === key ? { ...l, quantity } : l,
              ),
            };
          }
          return { lines: [...state.lines, { item_id, quantity, note }] };
        });
      },

      clear: () => set({ lines: [] }),

      /**
       * Apply a list of structured actions returned by the AI.
       * Each action: { type, item_id?, quantity?, note? }
       */
      applyActions: (actions) => {
        if (!Array.isArray(actions)) return;
        for (const a of actions) {
          switch (a.type) {
            case "add":
              if (a.item_id) get().add(a.item_id, a.quantity ?? 1, a.note);
              break;
            case "remove":
              if (a.item_id) get().remove(a.item_id, a.note);
              break;
            case "set_quantity":
              if (a.item_id != null && a.quantity != null) {
                get().setQuantity(a.item_id, a.quantity, a.note);
              }
              break;
            case "clear":
              get().clear();
              break;
            default:
              break;
          }
        }
      },
    }),
    {
      name: "bistro-cart-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export function cartSubtotal(lines) {
  return lines.reduce((sum, l) => {
    const item = MENU_BY_ID[l.item_id];
    if (!item) return sum;
    return sum + item.price * l.quantity;
  }, 0);
}

export function cartItemCount(lines) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
