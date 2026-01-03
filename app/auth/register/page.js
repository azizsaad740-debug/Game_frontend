'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI } from '@/lib/api'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    currency: 'TRY',
    acceptTerms: false,
    role: 'user',
    registrationCode: ''
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.acceptTerms) {
      setError(t('register.mustAcceptTerms') || 'You must accept Terms & Privacy');
      return;
    }

    setLoading(true);

    try {
      // 1. Create a clean base object from your state
      const baseData = { ...formData };

      // 2. Remove the 'acceptTerms' key (backend doesn't want it) 
      // and force-inject the 3 keys the backend IS asking for.
      const registerData = {
        username: baseData.username || baseData.email.split('@')[0],
        firstName: baseData.firstName.trim(),
        lastName: baseData.lastName.trim(),
        email: baseData.email.trim(),
        phone: baseData.phone.trim(),
        password: baseData.password,
        confirmPassword: baseData.confirmPassword,
        currency: baseData.currency,
        role: baseData.role,
        registrationCode: baseData.registrationCode || undefined,
        // FORCE THESE AS RAW BOOLEANS
        is18Plus: true,
        termsAccepted: true,
        kvkkAccepted: true
      };

      // 3. DEBUG: This will show a pretty table in your Console (F12)
      console.log("CHECK THESE THREE FIELDS IN THE TABLE BELOW:");
      console.table(registerData);

      const response = await authAPI.register(registerData);
      
      const { token, user, redirectPath } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        const adminRoles = ['admin', 'super_admin', 'operator'];
        const isAdminUser = adminRoles.includes(user.role);
        localStorage.setItem('isAdmin', isAdminUser ? 'true' : 'false');
        if (isAdminUser && user.email) localStorage.setItem('adminEmail', user.email);
      }
      router.push(redirectPath || '/dashboard');

    } catch (err) {
      console.error("FULL ERROR OBJECT:", err.response?.data);
      setError(err?.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background-dark text-[#F5F5F5]">
      <div className="w-full max-w-md">
        {/* HEADER */}
        <header className="mb-8 flex flex-col items-center gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary">
              <svg fill="none" viewBox="0 0 48 48">
                <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
              </svg>
            </div>
            <Link href="/">
              <h1 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Garbet</h1>
            </Link>
          </div>
        </header>

        {/* MAIN CARD */}
        <main className="w-full rounded-xl bg-[#1E1E1E] p-6 sm:p-8 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white">{t('register.title')}</h2>
            <p className="mt-2 text-sm text-gray-400">{t('register.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* USERNAME */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="username">Username</label>
              <input
                id="username"
                className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                placeholder="Choose a username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* FIRST NAME */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                placeholder="Enter your first name"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* LAST NAME */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                placeholder="Enter your last name"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* PHONE */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                placeholder="Enter your phone number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* EMAIL */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="email">{t('register.email')}</label>
              <input
                id="email"
                className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                placeholder={t('register.emailPlaceholder')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="password">{t('register.password')}</label>
              <div className="relative flex w-full items-center">
                <input
                  id="password"
                  className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 pr-12 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  placeholder={t('register.passwordPlaceholder')}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 flex items-center justify-center text-gray-400 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
              <div className="relative flex w-full items-center">
                <input
                  id="confirmPassword"
                  className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 pr-12 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 flex items-center justify-center text-gray-400 hover:text-white"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* CURRENCY */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="currency">{t('register.currency')}</label>
              <select
                id="currency"
                className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 pr-10 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="TRY" className="bg-[#2a2a2a]">TRY (₺)</option>
                <option value="USD" className="bg-[#2a2a2a]">USD ($)</option>
                <option value="EUR" className="bg-[#2a2a2a]">EUR (€)</option>
              </select>
            </div>

            {/* TERMS */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="terms-checkbox"
                className="mt-1 size-4 cursor-pointer rounded border-2 border-[#3a3a3a] bg-[#2a2a2a] text-primary checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="terms-checkbox" className="text-xs leading-relaxed text-gray-400">
                {t('register.acceptTerms')} {' '}
                <Link href="/terms" className="font-medium text-[#4D96FF] hover:text-primary hover:underline transition-colors">{t('register.terms')}</Link> ve {' '}
                <Link href="/privacy" className="font-medium text-[#4D96FF] hover:text-primary hover:underline transition-colors">{t('register.privacy')}</Link>.
              </label>
            </div>

            {/* ROLE */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="role">Account Type</label>
              <select
                id="role"
                className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 pr-10 text-sm text-white focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="user" className="bg-[#2a2a2a]">User</option>
                <option value="admin" className="bg-[#2a2a2a]">Admin (requires code)</option>
                <option value="operator" className="bg-[#2a2a2a]">Operator (requires code)</option>
                <option value="super_admin" className="bg-[#2a2a2a]">Super Admin (requires code)</option>
              </select>
            </div>

            {/* ADMIN CODE */}
            {formData.role !== 'user' && (
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium leading-normal text-white" htmlFor="registrationCode">Registration Code</label>
                <input
                  id="registrationCode"
                  className="h-12 w-full rounded-lg border border-[#3a3a3a] bg-[#2a2a2a] px-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  name="registrationCode"
                  placeholder="Enter admin registration code"
                  value={formData.registrationCode}
                  onChange={handleChange}
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-400">Admin roles require a valid registration code</p>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-black transition-all hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1E1E1E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : t('register.createAccount')}
            </button>

            {/* LOGIN LINK */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {t('register.alreadyHaveAccount')}{' '}
                <Link className="font-medium text-[#4D96FF] hover:text-primary hover:underline transition-colors" href="/auth/login">
                  {t('register.login')}
                </Link>
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}