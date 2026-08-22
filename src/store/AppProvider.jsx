import { useEffect, useMemo, useReducer } from 'react';
import {
  AppContext,
  AppDispatchContext,
  appReducer,
  loadState,
  saveState,
} from './appStore';

export default function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // `lastCreatedOrder` diturunkan dari daftar order, bukan disimpan sebagai salinan,
  // supaya halaman pembayaran/konfirmasi ikut berubah begitu admin menyetujui pesanan.
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
