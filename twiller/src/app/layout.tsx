import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";



/* 🔔 Toastify */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ✅ ADD THIS */
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X Clone - Social Media Platform",
  description: "A modern Twitter clone built with Next.js",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        

        {/* ✅ AUTH PROVIDER MUST WRAP EVERYTHING */}
        <AuthProvider>
          {children}

          {/* Toasts should be inside provider tree */}
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="dark"
          />
        </AuthProvider>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
