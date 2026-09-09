import { SampleUserStory } from '../types';

export const SAMPLE_USER_STORIES: SampleUserStory[] = [
  {
    id: 'story-login',
    title: 'User Authentication & Login',
    category: 'Authentication',
    story: 'As a registered customer, I want to log into my account using my registered email address and password so that I can access my personalized dashboard, orders, and account settings securely.',
    tags: ['Auth', 'Security', 'Session', 'Form']
  },
  {
    id: 'story-checkout',
    title: 'E-Commerce Cart Checkout & Payment',
    category: 'E-Commerce',
    story: 'As a shopper with items in my cart, I want to complete checkout by entering shipping details, selecting a delivery speed, and paying via credit card with 3D Secure verification so that my order is processed and confirmed with an invoice.',
    tags: ['Checkout', 'Payment', 'Validation', '3DS']
  },
  {
    id: 'story-atm',
    title: 'ATM Cash Withdrawal & PIN Verification',
    category: 'Banking',
    story: 'As a bank account holder inserting a debit card at an ATM, I want to withdraw cash by entering my 4-digit PIN and specifying an amount in multiples of $20 so that I receive my cash dispensed, my updated balance slip, and my card returned.',
    tags: ['Hardware', 'PIN', 'Limits', 'Transactions']
  },
  {
    id: 'story-registration',
    title: 'New Account Registration & Password Rules',
    category: 'Onboarding',
    story: 'As a new visitor, I want to create an account by providing my full name, valid corporate email, and a strong password (minimum 12 characters, uppercase, lowercase, number, symbol) and agreeing to Terms of Service so that a verification activation email is dispatched.',
    tags: ['Onboarding', 'Validation', 'Email', 'Security']
  },
  {
    id: 'story-password-reset',
    title: 'Self-Service Password Reset via OTP',
    category: 'Security',
    story: 'As a user who forgot my password, I want to request a 6-digit one-time passcode (OTP) sent to my registered phone number or email, valid for 10 minutes, so that I can reset my credentials without contacting customer support.',
    tags: ['OTP', 'Rate-Limiting', 'Recovery', 'Expiry']
  },
  {
    id: 'story-fund-transfer',
    title: 'Peer-to-Peer Wallet Transfer',
    category: 'Fintech',
    story: 'As a digital wallet user, I want to transfer money instantly to another user by entering their mobile phone number or username and an amount up to $2,500 daily limit, with biometric authorization required for transactions over $100.',
    tags: ['Fintech', 'Biometrics', 'Limits', 'Concurrency']
  }
];
