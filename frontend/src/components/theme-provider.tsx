"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { SWRConfig } from "swr";
import { apiRequest } from "@/helpers/request";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <SWRConfig
        value={{
          // Default fetcher supports string or tuple keys
          fetcher: (key: any) => {
            if (typeof key === "string") return apiRequest.get<any>(key);
            if (Array.isArray(key) && key.length > 0) return apiRequest.get<any>(key[0]);
            return Promise.reject(new Error("Invalid SWR key"));
          },
          revalidateOnFocus: true,
          dedupingInterval: 2000,
          shouldRetryOnError: true,
          errorRetryCount: 2,
        }}
      >
        {children}
      </SWRConfig>
    </NextThemesProvider>
  );
}
