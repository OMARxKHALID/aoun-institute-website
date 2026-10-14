"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import DialogProvider from "@/components/ui/dialog-provider";

const Providers = ({ children }) => (
  <QueryClientProvider client={getQueryClient()}>
    <DialogProvider>{children}</DialogProvider>
  </QueryClientProvider>
);

export default Providers;
