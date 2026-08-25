import { useEffect, useMemo, useReducer, useCallback } from 'react';
import {
  AppContext,
  AppDispatchContext,
  appReducer,
  loadState,
  saveState,
} from './appStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchSupabaseState,
  createOrderInSupabase,
  approveOrderInSupabase,
  releaseOrderInSupabase,
  checkInTicketInSupabase,
  uploadReceiptToSupabase,
  updateEventInSupabase,
  updateTierInSupabase,
} from '../lib/supabaseSync';

export default function AppProvider({ children }) {
  const [state, baseDispatch] = useReducer(appReducer, undefined, loadState);

  // Sync to localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Listen for storage events across different tabs in the same browser
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'karcix-state-v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.orders && parsed?.event) {
            baseDispatch({
              type: 'SET_STATE',
              payload: parsed,
            });
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [baseDispatch]);

  // Load from Supabase on mount & Realtime Sync
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    async function load() {
      try {
        const data = await fetchSupabaseState();
        if (data && isMounted) {
          baseDispatch({
            type: 'SET_STATE',
            payload: {
              event: data.event,
              orders: data.orders,
            },
          });
        }
      } catch (err) {
        console.error('Error in fetchSupabaseState:', err);
      }
    }

    load();

    // Re-sync on window focus (e.g. when user switches back to browser tab)
    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);

    // Periodic sync every 4 seconds to guarantee multi-device sync
    const pollInterval = setInterval(load, 4000);

    // Setup Supabase Realtime subscriptions
    let channel;
    if (supabase) {
      channel = supabase
        .channel('karcix-realtime-all')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            load();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'event_tiers' },
          () => {
            load();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events' },
          () => {
            load();
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [baseDispatch]);

  // Enhanced dispatch that writes to Supabase asynchronously if configured
  const dispatch = useCallback(
    (action) => {
      // Always update local reducer state immediately for smooth UI
      baseDispatch(action);

      if (!isSupabaseConfigured) return;

      switch (action.type) {
        case 'CREATE_ORDER':
          createOrderInSupabase(action.payload).catch((err) =>
            console.error('Supabase CREATE_ORDER failed:', err)
          );
          break;
        case 'APPROVE_ORDER':
          approveOrderInSupabase(action.payload.orderId).catch((err) =>
            console.error('Supabase APPROVE_ORDER failed:', err)
          );
          break;
        case 'REJECT_ORDER':
          releaseOrderInSupabase(action.payload.orderId, 'cancelled').catch((err) =>
            console.error('Supabase REJECT_ORDER failed:', err)
          );
          break;
        case 'EXPIRE_ORDER':
          releaseOrderInSupabase(action.payload.orderId, 'expired').catch((err) =>
            console.error('Supabase EXPIRE_ORDER failed:', err)
          );
          break;
        case 'CHECK_IN':
          checkInTicketInSupabase(action.payload.ticketId).catch((err) =>
            console.error('Supabase CHECK_IN failed:', err)
          );
          break;
        case 'UPLOAD_RECEIPT':
          uploadReceiptToSupabase(action.payload.orderId, action.payload.receiptUrl).catch((err) =>
            console.error('Supabase UPLOAD_RECEIPT failed:', err)
          );
          break;
        case 'UPDATE_EVENT':
          updateEventInSupabase('evt-001', action.payload);
          break;
        case 'UPDATE_TIER':
          updateTierInSupabase(action.payload.tierId, action.payload.updates);
          break;
        default:
          break;
      }
    },
    [baseDispatch]
  );

  const value = useMemo(
    () => ({
      ...state,
      lastCreatedOrder:
        state.orders.find((o) => o.id === state.lastCreatedOrderId) || null,
    }),
    [state]
  );

  return (
    <AppContext.Provider value={value}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}
