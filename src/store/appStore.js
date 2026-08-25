import { createContext, useContext } from 'react';
import {
  INITIAL_EVENTS,
  INITIAL_EVENT,
  INITIAL_ORDERS,
  ORDER_STATUS,
  MAX_QTY_PER_ORDER,
  generateOrderId,
  generateUniqueCode,
  generateTicketId,
  syncOrderSequence,
} from '../data/mockData';

export const AppContext = createContext(null);
export const AppDispatchContext = createContext(null);

export const STORAGE_KEY = 'karcix-state-v2';

export const initialState = {
  events: INITIAL_EVENTS,
  event: INITIAL_EVENT,
  orders: INITIAL_ORDERS,
  lastCreatedOrderId: null,
};

/**
 * State disimpan di localStorage supaya pesanan tersinkronisasi antar-tab
 * dan tidak hilang saat halaman di-refresh.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.events) && !parsed?.event) return initialState;
    if (Array.isArray(parsed?.orders)) {
      syncOrderSequence(parsed.orders);
    }
    const events = parsed.events || (parsed.event ? [parsed.event] : INITIAL_EVENTS);
    return {
      ...initialState,
      ...parsed,
      events,
      event: events[0] || INITIAL_EVENT,
    };
  } catch {
    return initialState;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Kuota storage penuh — abaikan, state tetap di memori.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

/** Kembalikan kuota tier saat pesanan batal/kedaluwarsa di seluruh events */
function restoreTierStock(events, order) {
  return (events || INITIAL_EVENTS).map((evt) => {
    const hasTier = evt.tiers?.some((t) => t.id === order.tierId);
    if (!hasTier) return evt;
    return {
      ...evt,
      tiers: evt.tiers.map((t) =>
        t.id === order.tierId ? { ...t, sold: Math.max(0, t.sold - order.qty) } : t
      ),
    };
  });
}

/** Ubah satu pesanan pending menjadi status akhir sambil mengembalikan kuotanya. */
function releaseOrder(state, orderId, nextStatus) {
  const order = state.orders.find((o) => o.id === orderId);
  // Hanya pesanan pending yang boleh dilepas, supaya kuota tidak dikembalikan dua kali.
  if (!order || order.status !== ORDER_STATUS.PENDING) return state;

  const updatedEvents = restoreTierStock(state.events, order);

  return {
    ...state,
    orders: state.orders.map((o) =>
      o.id === orderId ? { ...o, status: nextStatus } : o
    ),
    events: updatedEvents,
    event: updatedEvents.find((e) => e.id === state.event?.id) || updatedEvents[0],
  };
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'CREATE_ORDER': {
      const { id, buyerName, email, whatsapp, tierId, qty, paymentMethod } = action.payload;
      
      // Cari event yang memiliki tier ini
      const targetEvent =
        state.events?.find((e) => e.tiers?.some((t) => t.id === tierId)) ||
        state.event;
      
      if (!targetEvent) return state;
      const tier = targetEvent.tiers?.find((t) => t.id === tierId);
      if (!tier) return state;

      // Jaga-jaga kalau UI dilewati
      const remaining = tier.quota - tier.sold;
      const safeQty = Math.min(qty, remaining, MAX_QTY_PER_ORDER);
      if (safeQty < 1) return state;

      const uniqueCode = action.payload.uniqueCode || generateUniqueCode();
      const orderId = id || generateOrderId();
      const newOrder = {
        id: orderId,
        eventId: targetEvent.id,
        eventTitle: targetEvent.title,
        buyerName,
        email,
        whatsapp,
        tierId,
        tierName: tier.name,
        qty: safeQty,
        unitPrice: tier.price,
        uniqueCode,
        totalAmount: tier.price * safeQty + uniqueCode,
        paymentMethod: paymentMethod || 'qris',
        status: ORDER_STATUS.PENDING,
        receiptUrl: null,
        ticketId: null,
        checkedIn: false,
        timestamp: new Date().toISOString(),
      };

      try {
        localStorage.setItem('karcix-last-order-id', orderId);
      } catch {}

      const updatedEvents = (state.events || INITIAL_EVENTS).map((evt) => {
        if (evt.id !== targetEvent.id) return evt;
        return {
          ...evt,
          tiers: evt.tiers.map((t) =>
            t.id === tierId ? { ...t, sold: t.sold + safeQty } : t
          ),
        };
      });

      return {
        ...state,
        events: updatedEvents,
        event: updatedEvents.find((e) => e.id === state.event?.id) || updatedEvents[0],
        orders: [...state.orders.filter((o) => o.id !== orderId), newOrder],
        lastCreatedOrderId: orderId,
      };
    }

    case 'UPLOAD_RECEIPT': {
      const { orderId, receiptUrl } = action.payload;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, receiptUrl } : o
        ),
      };
    }

    case 'APPROVE_ORDER': {
      const { orderId } = action.payload;
      return {
        ...state,
        orders: state.orders.map((o) => {
          if (o.id !== orderId || o.status !== ORDER_STATUS.PENDING) return o;
          return {
            ...o,
            status: ORDER_STATUS.PAID,
            ticketId: generateTicketId(o.tierName, o.id),
          };
        }),
      };
    }

    case 'REJECT_ORDER':
      return releaseOrder(state, action.payload.orderId, ORDER_STATUS.CANCELLED);

    case 'EXPIRE_ORDER':
      return releaseOrder(state, action.payload.orderId, ORDER_STATUS.EXPIRED);

    case 'CHECK_IN': {
      const { ticketId } = action.payload;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.ticketId === ticketId ? { ...o, checkedIn: true } : o
        ),
      };
    }

    case 'ADD_EVENT': {
      const newEvent = action.payload;
      const updatedEvents = [newEvent, ...(state.events || [])];
      return {
        ...state,
        events: updatedEvents,
        event: updatedEvents[0],
      };
    }

    case 'UPDATE_EVENT': {
      const targetId = action.payload.id || action.payload.eventId || state.event?.id;
      const updatedEvents = (state.events || INITIAL_EVENTS).map((evt) =>
        evt.id === targetId ? { ...evt, ...action.payload } : evt
      );
      return {
        ...state,
        events: updatedEvents,
        event: updatedEvents.find((e) => e.id === targetId) || updatedEvents[0],
      };
    }

    case 'DELETE_EVENT': {
      const targetId = action.payload.eventId || action.payload.id;
      const updatedEvents = (state.events || []).filter((e) => e.id !== targetId);
      return {
        ...state,
        events: updatedEvents,
        event: updatedEvents[0] || null,
      };
    }

    case 'UPDATE_TIER': {
      const { tierId, updates } = action.payload;
      const updatedEvents = (state.events || INITIAL_EVENTS).map((evt) => ({
        ...evt,
        tiers: (evt.tiers || []).map((t) =>
          t.id === tierId ? { ...t, ...updates } : t
        ),
      }));
      return {
        ...state,
        events: updatedEvents,
        event: updatedEvents.find((e) => e.id === state.event?.id) || updatedEvents[0],
      };
    }

    case 'SET_STATE': {
      const serverOrders = action.payload.orders || [];
      const serverIds = new Set(serverOrders.map((o) => o.id));
      // Pertahankan pesanan lokal yang sedang dalam proses kirim ke Supabase
      const localInFlight = (state.orders || []).filter((o) => !serverIds.has(o.id));
      const mergedOrders = [...serverOrders, ...localInFlight];

      const events = action.payload.events || (action.payload.event ? [action.payload.event] : state.events);
      const event = action.payload.event || events[0] || state.event;

      let lastId = state.lastCreatedOrderId || action.payload.lastCreatedOrderId;
      if (!lastId) {
        try {
          lastId = localStorage.getItem('karcix-last-order-id');
        } catch {}
      }

      return {
        ...state,
        ...action.payload,
        events,
        event,
        orders: mergedOrders,
        lastCreatedOrderId: lastId,
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (!context) throw new Error('useAppDispatch must be used within AppProvider');
  return context;
}
