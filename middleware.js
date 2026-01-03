// import { NextResponse } from 'next/server'

// export function middleware(request) {
//   const { pathname } = request.nextUrl

//   // Protect admin routes (except login page)
//   if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
//     // Check for admin authentication in cookies or headers
//     // For client-side auth, we'll handle it in the component
//     // This middleware can be extended to check server-side tokens
//     return NextResponse.next()
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// }

import { NextResponse } from 'next/server'

export function middleware(request) {
  // Note: We're using localStorage for tokens now, not cookies
  // Server-side middleware can't access localStorage, so we rely on
  // client-side route protection (ProtectedRoute, AdminProtectedRoute)
  // This middleware is kept minimal to avoid blocking valid requests
  
  const url = request.nextUrl.clone()
  
  // Allow all requests - client-side components will handle auth checks
  // This prevents server-side middleware from blocking users with localStorage tokens
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}



// ------------------------------------------------------------------------------

// import { NextResponse } from 'next/server'

// export function middleware(request) {
//   const token = request.cookies.get('accessToken')?.value
//   const isAdmin = request.cookies.get('isAdmin')?.value === 'true'
//   const url = request.nextUrl.clone()

//   const nextParam = encodeURIComponent(`${url.pathname}${url.search}`)

//   // Protect admin routes
//   if (url.pathname.startsWith('/admin')) {
//     // Not logged in
//     if (!token) {
//       return NextResponse.redirect(new URL(`/auth/login?next=${nextParam}`, request.url))
//     }

//     // Logged in but not admin
//     if (!isAdmin) {
//       return NextResponse.redirect(new URL('/dashboard', request.url))
//     }
//   }

//   // Protect dashboard routes
//   if (url.pathname.startsWith('/dashboard') && !token) {
//     return NextResponse.redirect(new URL(`/auth/login?next=${nextParam}`, request.url))
//   }

//   return NextResponse.next()
// }

// // Match all pages except API/static
// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// }
// import { NextResponse } from 'next/server'

// export function middleware(request) {
//   // Use optional chaining and default values
//   const token = request.cookies.get('accessToken')?.value || null
//   const isAdmin = request.cookies.get('isAdmin')?.value === 'true'

//   const url = request.nextUrl.clone()
//   const nextParam = encodeURIComponent(`${url.pathname}${url.search}`)

//   // Admin routes
//   if (url.pathname.startsWith('/admin')) {
//     if (!token) {
//       return NextResponse.redirect(new URL(`/auth/login?next=${nextParam}`, request.url))
//     }
//     if (!isAdmin) {
//       return NextResponse.redirect(new URL('/dashboard', request.url))
//     }
//   }

//   // Dashboard routes
//   if (url.pathname.startsWith('/dashboard') && !token) {
//     return NextResponse.redirect(new URL(`/auth/login?next=${nextParam}`, request.url))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// }
