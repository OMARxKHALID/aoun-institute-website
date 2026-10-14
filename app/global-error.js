"use client";

import "./globals.css";
import ErrorState from "@/components/ui/error-state";

const GlobalError = ({ retry }) => (
  <html lang="en" className="scheme-dark [scrollbar-color:#3d3633_#000] [scrollbar-width:thin]">
    <body className="min-h-screen bg-black text-white">
      <title>Something went wrong</title>
      <ErrorState retry={retry} className="min-h-screen" />
    </body>
  </html>
);

export default GlobalError;
