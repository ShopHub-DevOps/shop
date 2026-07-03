import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protect admin routes or any other routes you want to secure
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname === '/') {
    if (!token) {
      if (pathname === '/') return NextResponse.next(); // Let unauthenticated users see the homepage

      // 1. If running locally with different ports, use the ENV variable
      if (process.env.NEXT_PUBLIC_SHOPHUB_URL) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SHOPHUB_URL}/login`);
      }

      // 2. Fallback for cluster (e.g. vin.shophub.local -> shophub.local)
      const host = request.headers.get('host') || '';
      const parts = host.split('.');
      const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : host;
      
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      return NextResponse.redirect(`${protocol}://${rootDomain}/login`);
    }

    try {
      const payloadBase64Url = token.split('.')[1];
      let base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const decodedPayload = atob(base64);
      const parsedPayload = JSON.parse(decodedPayload);

      // Ensure only the shop owner can access the admin panel
      const ownerEmail = process.env.SHOP_OWNER_EMAIL?.toLowerCase() || '';
      const ownerWallet = process.env.WALLET_ADDRESS?.toLowerCase() || '';

      const userEmail = parsedPayload.email?.toLowerCase() || '';
      const userWallet = parsedPayload.walletAddress?.toLowerCase() || '';

      const isEmailOwner = ownerEmail && userEmail === ownerEmail;
      const isWalletOwner = ownerWallet && userWallet === ownerWallet;

      if (!isEmailOwner && !isWalletOwner) {
        // Logged in, but NOT the owner -> redirect to shop homepage if trying to access admin
        if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } else {
        // Logged in AND owner
        if (pathname === '/') {
          return NextResponse.redirect(new URL('/admin/articles', request.url));
        }
      }
    } catch (error) {
      if (pathname === '/') return NextResponse.next(); // Don't crash homepage for invalid token

      // If token is invalid, redirect to central login
      if (process.env.NEXT_PUBLIC_SHOPHUB_URL) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SHOPHUB_URL}/login`);
      }
      const host = request.headers.get('host') || '';
      const parts = host.split('.');
      const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : host;
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      return NextResponse.redirect(`${protocol}://${rootDomain}/login`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/dashboard/:path*'],
};