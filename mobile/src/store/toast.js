import { create } from "zustand";

export const useToast = create((set) => ({
  visible: false,
  title: "",
  message: "",
  actions: [],
  show: ({ title, message, actions = [] }) =>
    set({ visible: true, title, message, actions }),
  hide: () => set({ visible: false }),
}));
