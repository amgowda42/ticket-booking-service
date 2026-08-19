import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/provider";
import { AppToaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Ticket Booking",
  description: "Book and manage event tickets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
        <AppToaster />
      </body>
    </html>
  );
}
