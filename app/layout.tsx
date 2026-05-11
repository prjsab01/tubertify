import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../components/Providers";

export const runtime = 'edge';

export const metadata: Metadata = {
  title: "AI Course Builder",
  description: "Build module-wise courses from YouTube playlists and get AI learning support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
