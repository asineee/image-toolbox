import { useState, useCallback } from 'react';
import { ProcessingSettings, ToolType } from '../types/image';

export interface HistoryEntry {
  settings: ProcessingSettings;
  activeTool?: ToolType;
  timestamp: number;
}

export interface UseEditorHistoryOptions {
  maxHistoryLength?: number;
}

export function useEditorHistory(options: UseEditorHistoryOptions = {}) {
  const maxHistory = options.maxHistoryLength || 30;

  const [past, setPast] = useState<HistoryEntry[]>([]);
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  const cloneSettings = (settings: ProcessingSettings): ProcessingSettings => {
    return JSON.parse(JSON.stringify(settings));
  };

  const isDuplicateEntry = (a: HistoryEntry, b: HistoryEntry): boolean => {
    return JSON.stringify(a.settings) === JSON.stringify(b.settings);
  };

  const pushState = useCallback(
    (settings: ProcessingSettings, activeTool?: ToolType) => {
      const newEntry: HistoryEntry = {
        settings: cloneSettings(settings),
        activeTool,
        timestamp: Date.now(),
      };

      setPast((prevPast) => {
        const lastEntry = prevPast[prevPast.length - 1];
        if (lastEntry && isDuplicateEntry(lastEntry, newEntry)) {
          return prevPast;
        }
        const updated = [...prevPast, newEntry];
        if (updated.length > maxHistory) {
          return updated.slice(updated.length - maxHistory);
        }
        return updated;
      });

      setFuture([]);
    },
    [maxHistory]
  );

  const undo = useCallback(
    (currentSettings: ProcessingSettings, currentTool?: ToolType): HistoryEntry | null => {
      if (past.length === 0) return null;

      const previousEntry = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      const currentEntry: HistoryEntry = {
        settings: cloneSettings(currentSettings),
        activeTool: currentTool,
        timestamp: Date.now(),
      };

      setPast(newPast);
      setFuture((prevFuture) => [currentEntry, ...prevFuture]);

      return previousEntry;
    },
    [past]
  );

  const redo = useCallback(
    (currentSettings: ProcessingSettings, currentTool?: ToolType): HistoryEntry | null => {
      if (future.length === 0) return null;

      const nextEntry = future[0];
      const newFuture = future.slice(1);

      const currentEntry: HistoryEntry = {
        settings: cloneSettings(currentSettings),
        activeTool: currentTool,
        timestamp: Date.now(),
      };

      setFuture(newFuture);
      setPast((prevPast) => [...prevPast, currentEntry]);

      return nextEntry;
    },
    [future]
  );

  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    pastCount: past.length,
    futureCount: future.length,
    pushState,
    undo,
    redo,
    clearHistory,
  };
}
