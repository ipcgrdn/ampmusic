import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchHistoryState {
  history: string[];
  addToHistory: (query: string) => void;
  removeFromHistory: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (query: string) => 
        set((state) => ({
          history: [
            query,
            ...state.history.filter((item) => item !== query)
          ].slice(0, 10), // 최근 10개만 유지
        })),
      removeFromHistory: (query: string) =>
        set((state) => ({
          history: state.history.filter((item) => item !== query),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'search-history',
    }
  )
); 