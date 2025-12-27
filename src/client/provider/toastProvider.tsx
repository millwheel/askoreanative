"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: "text-sm",
        style: {
          background: "#ffffff",
          color: "#171717",
          border: "1px solid #E5E7EB",
        },
        success: {
          iconTheme: {
            primary: "#2EC4B6",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#ffffff",
          },
        },
      }}
    />
  );
}
