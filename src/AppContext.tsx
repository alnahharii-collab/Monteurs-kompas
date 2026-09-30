import { createContext, useContext, type Dispatch } from 'react';
import type { Action, Session } from './logic/session';

export interface AppCtx {
  session: Session;
  dispatch: Dispatch<Action>;
}

export const AppContext = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp buiten AppContext');
  return ctx;
}
