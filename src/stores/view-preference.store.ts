import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ViewMode = "list" | "grid";

interface ViewPreferenceState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const getDefaultViewMode = (): ViewMode => {
  if (typeof window === "undefined") return "list";
  return window.innerWidth < 768 ? "list" : "grid";
};

export const useViewPreferenceStore = create<ViewPreferenceState>()(
  persist(
    (set) => ({
      viewMode: getDefaultViewMode(),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: "view-preference",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
