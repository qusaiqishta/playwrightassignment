/**
 * Selectors for almosafer.com web application
 * Following POM pattern - all selectors centralized in one place
 */

const selectors = {
  // Common elements
  signUpButton: 'text=Sign up',
  signInButton: '[type="submit"]',
  logoutButton: 'text=Sign out',
  
  // Sign up form selectors
  signUp: {
    emailInput: '#InputField_email',
    passwordInput: '#InputField_password',
    phoneInput: '#InputField_number',
    createAccountButton: '[type="submit"]',
    subscribeCheckbox: '[data-testid="checkbox_subscribe"] > span input',
    showHidePasswordIcon: '[data-testid="InputField_password"] svg',
    emailTab:'[data-testid="tab-tab-1"]'
  },
  
  // Sign in form selectors (same as sign up)
  signIn: {
    emailInput: '#InputField_email',
    passwordInput: '#InputField_password',
    phoneInput: '#InputField_number',
    signInButton: '[type="submit"]', // Same button selector as create account
    showHidePasswordIcon: '[data-testid="InputField_password"] svg',
    emailTab:'[data-testid="tab-tab-1"]',
  },
  
  // Profile page selectors
  profile: {
    emailDisplay: '#__next > div:nth-child(2) > div > div > div.__ds__comp.undefined.MuiBox-root.muiltr-1nebyim > div.MuiBox-root.muiltr-1vpcf4d > p',
    emailInput: '#InputField_email',
    profileButton: 'text=Profile',
  },
  
  // Error message selectors
  errorMessages: {
    emailError: '[data-testid="InputField_email"] ~p',
    passwordError: '[data-testid="InputField_password"] ~p',
    phoneError: '[data-testid="InputField_number"] ~p',
    generalLoginError: "Please check and try again.",
    generalSignUpError: "An account already exists for this email address",
    generalSignUpPhoneError: "An account already exists for this mobile number.",
    emptyEmailError:"Please enter your email address",
    emptyPasswordError:"Please enter your password",
    notValidEmailError:"Please enter a valid email address",
    notValidPhoneNumer:"Please enter a valid mobile number",
    emptyPhoneError:'Please enter a mobile number',
    notValidPassword:'Your password must:'

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
