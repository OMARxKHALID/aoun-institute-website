"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";

const Providers = ({ children }) => <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;

export default Providers;
