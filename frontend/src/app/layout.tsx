import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { cookies } from "next/headers";
import { AuthInitializer } from "@/components/AuthInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopHub Tenant",
  description: "ShopHub Tenant Store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || null;
  let role = null;

  if (token) {
    try {
      const payloadBase64Url = token.split('.')[1];
      let base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const decodedPayload = atob(base64);
      const parsedPayload = JSON.parse(decodedPayload);

      const ownerEmail = process.env.SHOP_OWNER_EMAIL?.toLowerCase() || '';
      const ownerWallet = process.env.WALLET_ADDRESS?.toLowerCase() || '';

      const userEmail = parsedPayload.email?.toLowerCase() || '';
      const userWallet = parsedPayload.walletAddress?.toLowerCase() || '';

      const isEmailOwner = ownerEmail && userEmail === ownerEmail;
      const isWalletOwner = ownerWallet && userWallet === ownerWallet;

      if (isEmailOwner || isWalletOwner) {
        role = 'admin';
      } else {
        role = 'customer';
      }
    } catch (e) {
      // Invalid token
    }
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthInitializer token={token} role={role} />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
