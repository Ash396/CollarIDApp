// React view of the shared CollarID session in api.ts. Every screen that
// cares (Home account card, Saved schedules, radio editor, Map tab) reads
// this one store, so signing in or out anywhere updates all of them.
import { useEffect, useSyncExternalStore } from 'react';
import {
  getRole,
  getSessionGeneration,
  getToken,
  getUsername,
  isSessionLoaded,
  loadSession,
  onSessionChange,
} from './api';

export type SessionSnapshot = {
  /** false until the stored session has been read (Keychain + AsyncStorage). */
  ready: boolean;
  signedIn: boolean;
  username: string | null;
  role: string;
  isAdmin: boolean;
  /** Changes on every sign-in / sign-out / expiry. Not a secret. */
  generation: number;
};

let _snapshot: SessionSnapshot | null = null;

function computeSnapshot(): SessionSnapshot {
  const signedIn = !!getToken();
  const role = getRole();
  return {
    ready: isSessionLoaded(),
    signedIn,
    username: signedIn ? getUsername() : null,
    role,
    isAdmin: signedIn && role === 'admin',
    generation: getSessionGeneration(),
  };
}

function sameSnapshot(a: SessionSnapshot, b: SessionSnapshot): boolean {
  return (
    a.ready === b.ready &&
    a.signedIn === b.signedIn &&
    a.username === b.username &&
    a.role === b.role &&
    a.generation === b.generation
  );
}

// useSyncExternalStore needs the SAME object back while nothing changed.
function getSnapshot(): SessionSnapshot {
  const next = computeSnapshot();
  if (!_snapshot || !sameSnapshot(_snapshot, next)) _snapshot = next;
  return _snapshot;
}

export function useSession(): SessionSnapshot {
  const snap = useSyncExternalStore(onSessionChange, getSnapshot, getSnapshot);
  useEffect(() => {
    loadSession().catch(() => {});
  }, []);
  return snap;
}
