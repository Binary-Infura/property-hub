import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { UnifiedAppProvider } from "./contexts/UnifiedAppContext";
import { ConsultingBucketProvider } from "./contexts/ConsultingBucketContext";
import UserProfileDrawer from "./components/UserProfileDrawer";
import GlobalTransition from "./components/GlobalTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "PropertyHub - Expert-Guided Home Buying",
  description: "Find your perfect home with expert consultants. Curated properties, personalized guidance, and complete support from search to possession.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PropertyHub",
  },
  icons: {
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress THREE.Clock deprecation warning
              const originalWarn = console.warn;
              console.warn = function(...args) {
                if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) return;
                originalWarn.apply(console, args);
              };

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <UnifiedAppProvider>
            <ConsultingBucketProvider>
              {children}
              <UserProfileDrawer />
              <GlobalTransition />
            </ConsultingBucketProvider>
          </UnifiedAppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
