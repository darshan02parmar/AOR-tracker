"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Tiny UI context shared by every component on the new dashboard.
 *
 * Concerns:
 *   - which inline edit panel (timeline row) is currently open
 *   - a single transient toast message
 *
 * TODO(dashboard-new): hook real save flows in `saveMilestoneEdit` to
 * `updateMilestoneAction` once we merge with `/dashboard` data.
 */

export type DashboardV2UiValue = {
  openEditKey: string | null;
  toggleEdit: (key: string) => void;
  closeEdit: () => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
};

const Ctx = createContext<DashboardV2UiValue | null>(null);

export function DashboardV2UiProvider({ children }: { children: ReactNode }) {
  const [openEditKey, setOpenEditKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleEdit = useCallback((key: string) => {
    setOpenEditKey((cur) => (cur === key ? null : key));
  }, []);
  const closeEdit = useCallback(() => setOpenEditKey(null), []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const value = useMemo(
    () => ({
      openEditKey,
      toggleEdit,
      closeEdit,
      toastMessage,
      showToast,
    }),
    [openEditKey, toggleEdit, closeEdit, toastMessage, showToast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDashboardV2Ui(): DashboardV2UiValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error(
      "useDashboardV2Ui must be used inside <DashboardV2UiProvider>.",
    );
  }
  return v;
}
