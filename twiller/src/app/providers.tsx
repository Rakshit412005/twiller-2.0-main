"use client";

import { AuthProvider } from "@/context/AuthContext";
import I18nProvider from "@/i18n/I18nProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <I18nProvider>
        {children}

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </I18nProvider>
    </AuthProvider>
  );
}
