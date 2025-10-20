/**
 * Selectors for almosafer.com web application
 * Following POM pattern - all selectors centralized in one place
 */

const selectors = {
  // Common elements
  signUpButton: 'text=Sign up',
  signInButton: 'text=Sign in',
  logoutButton: '#mui-3',
  
  // Sign up form selectors
  signUp: {
    emailInput: '#InputField_email',
    passwordInput: '#InputField_password',
    phoneInput: '#InputField_number',
    createAccountButton: '#mui-9',
    subscribeCheckbox: '[data-testid="checkbox_subscribe"]',
    showHidePasswordIcon: '[data-testid="InputField_password"] svg',
  },
  
  // Sign in form selectors (same as sign up)
  signIn: {
    emailInput: '#InputField_email',
    passwordInput: '#InputField_password',
    phoneInput: '#InputField_number',
    signInButton: '#mui-9', // Same button selector as create account
    showHidePasswordIcon: '[data-testid="InputField_password"] svg',
  },
  
  // Profile page selectors
  profile: {
    emailDisplay: '#__next > div:nth-child(2) > div > div > div.__ds__comp.undefined.MuiBox-root.muiltr-1nebyim > div.MuiBox-root.muiltr-1vpcf4d > p',
    emailInput: '#InputField_email',
    verifyAccountButton: 'text=Verify account',
  },
  
  // Error message selectors
  errorMessages: {
    emailError: '[data-testid="email-error"]',
    passwordError: '[data-testid="password-error"]',
    phoneError: '[data-testid="phone-error"]',
    generalError: '[data-testid="general-error"]',
  },
  
  // URLs
  urls: {
    baseUrl: 'https://next-staging.almosafer.com',
    signUpPage: 'https://next-staging.almosafer.com/en/register?ncr=1',
    signInPage: 'https://next-staging.almosafer.com/en/signin?ncr=1',
    profilePage: 'https://next-staging.almosafer.com/en/myaccount/profile',
  },
  
  // API endpoints
  api: {
    signUp: 'https://next-staging.almosafer.com/api/myaccount/v4/user/local/signup',
    signIn: 'https://next-staging.almosafer.com/api/myaccount/v3/auth/token',
    userProfile: 'https://next-staging.almosafer.com/api/myaccount/v4/user/me',
    logout: 'https://next-staging.almosafer.com/api/myaccount/v3/auth/revoke',
  }
};

export default selectors;

// Named exports for specific selectors
export const { signUp, signIn, profile, errorMessages, urls, api } = selectors;
