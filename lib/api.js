/**
 * Central API export file
 * - Re-exports each modular API client
 * - Provides default Axios instance with cookies + interceptors
 *
 * NOTE:
 *   Since auth uses httpOnly cookies, JWT tokens are NOT exposed to frontend.
 *   All authentication flows remain backend-controlled.
 */

// Modular APIs
export * from './api/auth.api';
export * from './api/user.api';
export * from './api/bonus.api';
export * from './api/payment.api';
export * from './api/admin.api';
export * from './api/support.api';
export * from './api/transaction.api';
export * from './api/kyc.api';
export * from './api/notification.api';
export * from './api/promotion.api';
export * from './api/tournament.api';
export * from './api/stats.api';
export * from './api/dashboard.api';
export * from './api/bet.api';
export * from './api/betRound.api';
export * from './api/iban.api';
export * from './api/content.api';
export * from './api/match.api';
export * from './api/rapidapi.api';
export * from './api/public.api';
export * from './api/diceRollGame.api';
export * from './api/diceRollBet.api';

// Default Axios Instance
export { default } from './api/index';
