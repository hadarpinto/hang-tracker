import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HangTrack - Pull Bar Hang Tracker",
  description: "Track your pull bar hang workouts with precision. Group workouts, analytics, and Slack integration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
