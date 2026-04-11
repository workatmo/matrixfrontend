"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchCustomerMe,
  fetchCustomerOrders,
  type CustomerOrder,
  type CustomerUserPayload,
} from "@/lib/customer-api";

type CustomerDataContextValue = {
  user: CustomerUserPayload | null;
  ordersAll: CustomerOrder[];
  ordersPaid: CustomerOrder[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const CustomerDataContext = createContext<CustomerDataContextValue | null>(null);

export function CustomerDataProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUserPayload | null>(null);
  const [ordersAll, setOrdersAll] = useState<CustomerOrder[]>([]);
  const [ordersPaid, setOrdersPaid] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [me, all, paid] = await Promise.all([
        fetchCustomerMe(),
        fetchCustomerOrders("all"),
        fetchCustomerOrders("paid"),
      ]);
      setUser(me);
      setOrdersAll(all);
      setOrdersPaid(paid);
    } catch (e) {
      setUser(null);
      setOrdersAll([]);
      setOrdersPaid([]);
      setError(e instanceof Error ? e.message : "Could not load account");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      user,
      ordersAll,
      ordersPaid,
      loading,
      error,
      reload,
    }),
    [user, ordersAll, ordersPaid, loading, error, reload],
  );

  return <CustomerDataContext.Provider value={value}>{children}</CustomerDataContext.Provider>;
}

export function useCustomerData(): CustomerDataContextValue {
  const ctx = useContext(CustomerDataContext);
  if (!ctx) {
    throw new Error("useCustomerData must be used within CustomerDataProvider");
  }
  return ctx;
}
