"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_MADE_TO_ORDER,
  leadTimeLabel,
  type MadeToOrderConfig,
} from "@/lib/made-to-order";

type StoreConfig = MadeToOrderConfig & {
  phone: string;
  leadTimeText: string;
};

const StoreConfigContext = createContext<StoreConfig>({
  ...DEFAULT_MADE_TO_ORDER,
  phone: "+1 (809) 704-7519",
  leadTimeText: leadTimeLabel(DEFAULT_MADE_TO_ORDER),
});

/** Plazo de fabricación, % de abono y teléfono de la tienda para componentes cliente */
export function StoreConfigProvider({
  config,
  phone,
  children,
}: {
  config: MadeToOrderConfig;
  phone: string;
  children: React.ReactNode;
}) {
  return (
    <StoreConfigContext.Provider
      value={{ ...config, phone, leadTimeText: leadTimeLabel(config) }}
    >
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig() {
  return useContext(StoreConfigContext);
}
