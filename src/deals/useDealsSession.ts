import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { DealsCoordinator, DealsCoordinatorInput } from "./coordinator";
import { DealsSession, dealsSessionKey, emptyDealsSession } from "./session";

/** No automatic fetch/refresh. Changing input clears visible results immediately. */
export function useDealsSession(coordinator: DealsCoordinator, input: DealsCoordinatorInput, now: () => number = Date.now) {
  const session = useMemo(() => new DealsSession(coordinator, now), [coordinator, now]);
  const state = useSyncExternalStore(session.subscribe, session.getState, session.getState);
  useEffect(() => { session.setInput(input); }, [session, input]);
  useEffect(() => () => session.cancel(), [session]);
  const refresh = useCallback((bypassCache = true) => { session.setInput(input); return session.refresh(bypassCache); }, [session, input]);
  const cancel = useCallback(() => session.cancel(), [session]);
  const decide = useCallback((id: string, decision: "accepted" | "rejected") => session.decide(id, decision), [session]);
  return { ...(state.inputKey === dealsSessionKey(input) ? state : emptyDealsSession(input)), refresh, cancel, decide };
}
