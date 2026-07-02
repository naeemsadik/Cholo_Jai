"use client";

import { createContext, useContext } from "react";

type DataSource = "live" | "fallback" | "unknown";

interface DataSourceContextValue {
  source: DataSource;
}

const DataSourceContext = createContext<DataSourceContextValue>({ source: "unknown" });

export function DataSourceProvider({
  source,
  children,
}: {
  source: DataSource;
  children: React.ReactNode;
}) {
  return (
    <DataSourceContext.Provider value={{ source }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  return useContext(DataSourceContext);
}