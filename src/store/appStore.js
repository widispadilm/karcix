import { createContext, useContext } from 'react';
import {
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

export const STORAGE_KEY = 'karcix-state-v1';

export const initialState = {
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
    if (!parsed?.event || !Array.isArray(parsed?.orders)) return initialState;
    syncOrderSequence(parsed.orders);
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Kuota storage penuh (bukti transfer base64 bisa besar) — abaikan, state tetap di memori.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

/** Kembalikan kuota tier saat pesanan batal/kedaluwarsa. */
function restoreTierStock(event, order) {
  return {
    ...event,
    tiers: event.tiers.map((t) =>
      t.id === order.tierId ? { ...t, sold: Math.max(0, t.sold - order.qty) } : t
    ),
  };
}

/** Ubah satu pesanan pending menjadi status akhir sambil mengembalikan kuotanya. */
function releaseOrder(state, orderId, nextStatus) {
  const order = state.orders.find((o) => o.id === orderId);
  // Hanya pesanan pending yang boleh dilepas, supaya kuota tidak dikembalikan dua kali.
  if (!order || order.status !== ORDER_STATUS.PENDING) return state;

  return {
    ...state,
    orders: state.orders.map((o) =>
      o.id === orderId ? { ...o, status: nextStatus } : o
    ),
    event: restoreTierStock(state.event, order),
  };
}

export function appReducer(state, action) {
  switch (action.type) {
    case 'CREATE_ORDER': {
      const { buyerName, email, whatsapp, tierId, qty, paymentMethod } = action.payload;
      const tier = state.event.tiers.find((t) => t.id === tierId);
      if (!tier) return state;

      // Jaga-jaga kalau UI dilewati (misal akses /checkout/:tierId langsung dari URL).
      const remaining = tier.quota - tier.sold;
      const safeQty = Math.min(qty, remaining, MAX_QTY_PER_ORDER);
      if (safeQty < 1) return state;

      const uniqueCode = generateUniqueCode();
      const newOrder = {
        id: generateOrderId(),
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

      return {
        ...state,
        event: {
          ...state.event,
          tiers: state.event.tiers.map((t) =>
            t.id === tierId ? { ...t, sold: t.sold + safeQty } : t
          ),
        },
        orders: [...state.orders, newOrder],
        lastCreatedOrderId: newOrder.id,
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

    case 'UPDATE_EVENT':
      return { ...state, event: { ...state.event, ...action.payload } };

    case 'UPDATE_TIER': {
      const { tierId, updates } = action.payload;
      return {
        ...state,
        event: {
          ...state.event,
          tiers: state.event.tiers.map((t) =>
            t.id === tierId ? { ...t, ...updates } : t
          ),
        },
      };
    }

    case 'SET_STATE':
      return {
        ...state,
        ...action.payload,
      };

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
