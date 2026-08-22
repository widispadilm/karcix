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

  // Sync to sessionStorage as fallback
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    async function load() {
      const data = await fetchSupabaseState();
      if (data && isMounted) {
        baseDispatch({
          type: 'SET_STATE',
          payload: {
            event: data.event || state.event,
            orders: data.orders || state.orders,
          },
        });
      }
    }
    load();

    // Setup Supabase Realtime subscriptions
    if (supabase) {
      const channel = supabase
        .channel('karcix-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          async () => {
            const data = await fetchSupabaseState();
            if (data && isMounted) {
              baseDispatch({
                type: 'SET_STATE',
                payload: { event: data.event, orders: data.orders },
              });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'event_tiers' },
          async () => {
            const data = await fetchSupabaseState();
            if (data && isMounted) {
              baseDispatch({
                type: 'SET_STATE',
                payload: { event: data.event, orders: data.orders },
              });
            }
          }
        )
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }
  }, []);

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
