import { create } from 'zustand';
import {
  DEFAULT_DESIGN,
  EMPTY_CONTENT,
  type ContentMap,
  type DesignOptions,
  type TabId,
} from '@/lib/types';

interface QrState {
  activeTab: TabId;
  content: ContentMap;
  design: DesignOptions;
  setActiveTab: (tab: TabId) => void;
  setContent: <K extends TabId>(tab: K, value: ContentMap[K]) => void;
  resetContent: (tab: TabId) => void;
  setDesign: (patch: Partial<DesignOptions>) => void;
  resetDesign: () => void;
}

export const useQrStore = create<QrState>((set) => ({
  activeTab: 'text',
  content: EMPTY_CONTENT,
  design: DEFAULT_DESIGN,
  setActiveTab: (activeTab) => set({ activeTab }),
  setContent: (tab, value) => set((s) => ({ content: { ...s.content, [tab]: value } })),
  resetContent: (tab) => set((s) => ({ content: { ...s.content, [tab]: EMPTY_CONTENT[tab] } })),
  setDesign: (patch) => set((s) => ({ design: { ...s.design, ...patch } })),
  resetDesign: () => set({ design: DEFAULT_DESIGN }),
}));
