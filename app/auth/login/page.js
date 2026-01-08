// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { useTranslation } from '@/hooks/useTranslation'
// import { authAPI } from '@/lib/api'

// export default function LoginPage() {
//   const { t } = useTranslation()
//   const router = useRouter()
//   const [showPassword, setShowPassword] = useState(false)
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     try {
//       const response = await authAPI.login(email, password)
//       const { redirectPath, ...userData } = response.data

//       // Tokens are stored in httpOnly cookies automatically by backend
//       // Only store user data and a non-sensitive auth flag in localStorage
//       localStorage.setItem('user', JSON.stringify(userData))
//       localStorage.setItem('token', 'cookie-auth')

//       // Redirect based on role
//       if (userData.role === 'admin' || userData.role === 'super_admin' || userData.role === 'operator') {
//         localStorage.setItem('isAdmin', 'true')
//         router.push('/admin')
//       } else {
//         router.push(redirectPath || '/dashboard')
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
//     } finally {
//       setLoading(false)
//     }
//   }
// // const handleSubmit = async (e) => {
// //   e.preventDefault();
// //   setError('');
// //   setLoading(true);

// //   try {
// //     // 1. Use your existing Axios wrapper
// //     const response = await authAPI.login(email, password);

// //     // Axios puts the body in .data
// //     const { user, redirectPath } = response.data;

// //     if (typeof window !== 'undefined') {
// //       // 2. Store user data
// //       localStorage.setItem('user', JSON.stringify(user));

// //       // 3. Set admin flag if applicable
// //       const adminRoles = ['admin', 'super_admin', 'operator'];
// //       if (adminRoles.includes(user.role)) {
// //         localStorage.setItem('isAdmin', 'true');
// //         router.push(redirectPath || '/admin');
// //       } else {
// //         localStorage.setItem('isAdmin', 'false'); // Good to clear it if a non-admin logs in
// //         router.push(redirectPath || '/dashboard');
// //       }
// //     }
// //   } catch (err) {
// //     // Axios errors are handled differently than fetch errors
// //     const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
// //     setError(message);
// //     console.error('Login Error:', err);
// //   } finally {
// //     setLoading(false);
// //   }
// // };

//   return (
//     <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#121212] bg-[url('https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat p-4 md:p-6 lg:p-8">
//       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

//       <div className="relative z-10 flex w-full max-w-md flex-col items-center">
//         <header className="mb-8 text-center">
//           <svg className="mx-auto h-12 w-auto text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
//           </svg>
//         </header>

//         <main className="w-full rounded-xl border border-white/10 bg-[#1E1E1E]/85 p-6 shadow-2xl shadow-black/30 md:p-8">
//           <div className="flex flex-col gap-6">
//             <div className="text-center">
//               <h1 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">{t('login.title')}</h1>
//               <p className="mt-1 text-sm text-[#E0E0E0]/60">{t('login.subtitle')}</p>
//             </div>

//             {error && (
//               <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3">
//                 <p className="text-sm text-red-400">{error}</p>
//               </div>
//             )}

//             <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
//               <div className="flex flex-col">
//                 <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="email">
//                   {t('login.email')}
//                 </label>
//                 <input
//                   className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-sm font-normal leading-normal text-white placeholder:text-gray-500 transition-all focus:border-primary focus:bg-[#2f2f2f] focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
//                   id="email"
//                   placeholder={t('login.emailPlaceholder')}
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   disabled={loading}
//                   aria-required="true"
//                 />
//               </div>

//               <div className="flex flex-col">
//                 <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="password">
//                   {t('login.password')}
//                 </label>
//                 <div className="relative flex w-full items-center">
//                   <input
//                     className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 pr-12 text-sm font-normal leading-normal text-white placeholder:text-gray-500 transition-all focus:border-primary focus:bg-[#2f2f2f] focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
//                     id="password"
//                     placeholder={t('login.passwordPlaceholder')}
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     disabled={loading}
//                     aria-required="true"
//                   />
//                   <button
//                     aria-label={showPassword ? 'Hide password' : 'Show password'}
//                     className="absolute right-3 flex items-center justify-center text-gray-400 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     tabIndex={0}
//                   >
//                     <span className="material-symbols-outlined text-xl">
//                       {showPassword ? 'visibility_off' : 'visibility'}
//                     </span>
//                   </button>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <Link
//                   className="text-sm font-medium text-[#4D96FF] hover:text-primary hover:underline transition-colors"
//                   href="/auth/forgot-password"
//                 >
//                   {t('login.forgotPassword')}
//                 </Link>
//               </div>

//               <button
//                 className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-center text-sm font-bold text-black transition-all hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1E1E1E] disabled:opacity-50 disabled:cursor-not-allowed"
//                 type="submit"
//                 disabled={loading}
//               >
//                 {loading ? 'Logging in...' : t('common.login')}
//               </button>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-400">
//                 {t('login.dontHaveAccount')}{' '}
//                 <Link className="font-medium text-[#4D96FF] hover:text-primary hover:underline transition-colors" href="/auth/register">
//                   {t('login.createAccount')}
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </main>
//       </div>

//       <footer className="absolute bottom-4 left-4 right-4 z-10 text-center">
//         <p className="text-xs text-white/50">© 2024 Your Casino. All rights reserved. Please play responsibly.</p>
//       </footer>
//     </div>
//   )
// }
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI } from '@/lib/api'
import { handleApiError, setTranslationFunction } from '@/utils/errorHandler'

const adminRoles = ['admin', 'super_admin', 'operator']

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Initialize translation function in error handler
  useEffect(() => {
    setTranslationFunction(t)
  }, [t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(email, password)

      // Backend returns: { token, user, redirectPath }
      const { token, user, redirectPath } = response.data || {}

      if (!user || !token) {
        throw new Error('Login succeeded but no user or token payload was returned')
      }

      // Store the actual token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      const isAdminUser = adminRoles.includes(user.role)
      localStorage.setItem('isAdmin', isAdminUser ? 'true' : 'false')
      if (isAdminUser && user.email) localStorage.setItem('adminEmail', user.email)

      // Support redirect back to the originally requested page.
      // Prevent open-redirect by only allowing same-site relative paths.
      const next = searchParams?.get('next')
      const nextPath = next && next.startsWith('/') ? next : null

      // Determine redirect path
      let finalRedirectPath
      if (nextPath) {
        if (nextPath.startsWith('/admin') && !isAdminUser) {
          finalRedirectPath = '/dashboard'
        } else {
          finalRedirectPath = nextPath
        }
      } else {
        finalRedirectPath = redirectPath || (isAdminUser ? '/admin' : '/dashboard')
      }

      // Use window.location for reliable redirect
      window.location.href = finalRedirectPath
    } catch (err) {
      // Use centralized error handling with translation
      const errorDetails = handleApiError(err, t('errors.loginFailed'))
      setError(errorDetails.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMockAdminLogin = () => {
    const mockAdmin = {
      _id: 'mock-admin-id',
      username: 'QuickAdmin',
      email: 'admin@test.com',
      role: 'admin',
      balance: 1000000.00
    };
    localStorage.setItem('token', 'mock-jwt-token-admin');
    localStorage.setItem('user', JSON.stringify(mockAdmin));
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('adminEmail', mockAdmin.email);
    window.location.href = '/admin';
  };

  const handleMockUserLogin = () => {
    const mockUser = {
      _id: 'mock-user-id',
      username: 'TestPlayer',
      email: 'player@test.com',
      role: 'user',
      balance: 5000.00
    };
    localStorage.setItem('token', 'mock-jwt-token-user');
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('isAdmin', 'false');
    window.location.href = '/dashboard';
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#121212] bg-[url('https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat p-4 md:p-6 lg:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <header className="mb-8 text-center">
          <svg className="mx-auto h-12 w-auto text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
          </svg>
        </header>

        <main className="w-full rounded-xl border border-white/10 bg-[#1E1E1E]/85 p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-3xl">{t('login.title')}</h1>
              <p className="mt-1 text-sm text-[#E0E0E0]/60">{t('login.subtitle')}</p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3">
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="email">
                  {t('login.email')}
                </label>
                <input
                  className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-sm font-normal leading-normal text-white placeholder:text-gray-500 transition-all focus:border-primary focus:bg-[#2f2f2f] focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  id="email"
                  placeholder={t('login.emailPlaceholder')}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="password">
                  {t('login.password')}
                </label>
                <div className="relative flex w-full items-center">
                  <input
                    className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 pr-12 text-sm font-normal leading-normal text-white placeholder:text-gray-500 transition-all focus:border-primary focus:bg-[#2f2f2f] focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    id="password"
                    placeholder={t('login.passwordPlaceholder')}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <button
                    className="absolute right-3 flex items-center justify-center text-gray-400 transition-colors hover:text-white"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  className="text-sm font-medium text-[#4D96FF] hover:text-primary transition-colors"
                  href="/auth/forgot-password"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>

              <button
                className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-center text-sm font-bold text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : t('common.login')}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="flex h-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-center text-xs font-bold text-primary transition-all hover:bg-primary/20 active:scale-[0.98]"
                  type="button"
                  onClick={handleMockAdminLogin}
                >
                  <span className="material-symbols-outlined mr-2 text-lg">admin_panel_settings</span>
                  Quick Admin
                </button>
                <button
                  className="flex h-12 items-center justify-center rounded-lg border border-teal-500/30 bg-teal-500/10 text-center text-xs font-bold text-teal-400 transition-all hover:bg-teal-500/20 active:scale-[0.98]"
                  type="button"
                  onClick={handleMockUserLogin}
                >
                  <span className="material-symbols-outlined mr-2 text-lg">person</span>
                  Quick User
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {t('login.dontHaveAccount')}{' '}
                <Link className="font-medium text-[#4D96FF] hover:text-primary hover:underline transition-colors" href="/auth/register">
                  {t('login.createAccount')}
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div >

      <footer className="absolute bottom-4 left-4 right-4 z-10 text-center">
        <p className="text-xs text-white/50">© 2024 Your Casino. All rights reserved. Please play responsibly.</p>
      </footer>
    </div >
  )
}
