/**
 * Complete Authentication Flow Tests
 * End-to-end tests covering the complete user journey
 */

import { test, expect } from '@playwright/test';
import SignUpPage from '../pages/SignUpPage.js';
import SignInPage from '../pages/SignInPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import { setupSignupInterceptors, setupSigninInterceptors, setupLogoutInterceptors } from '../utils/apiHelpers.js';
import FormValidation from '../utils/formValidation.js';
import { valid, existingUser } from '../testData/testData.js';

test.describe('Complete Authentication Flow', () => {
  let signUpPage;
  let signInPage;
  let profilePage;
  
  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    signInPage = new SignInPage(page);
    profilePage = new ProfilePage(page);
  });
  
  test('Complete user journey: Sign up -> Sign in -> Logout', async ({ page }) => {
    // Step 1: Sign up with email
    const signupApiResponses = await setupSignupInterceptors(page);
    const email = FormValidation.generateRandomEmail();
    const password = FormValidation.generateValidPassword();
    
    await signUpPage.navigate();
    await signUpPage.fillEmailSignupForm({
      email,
      password,
      subscribe: true
    });
    
    // Validate form before submission
    const signupValidation = signUpPage.validateFormFields({ email, password }, true);
    expect(signupValidation.isValid).toBe(true);
    
    await signUpPage.submitSignupForm();
    await signUpPage.waitForSubmission();
    await profilePage.waitForLoad();
    
    // Validate successful signup
    const signupAuthValidation = await profilePage.validateSuccessfulAuth(email);
    expect(signupAuthValidation.isValid).toBe(true);
    expect(signupApiResponses.signup.status).toBe(200);
    expect(signupApiResponses.userProfile.status).toBe(200);
    
    // Step 2: Logout
    const logoutApiResponses = await setupLogoutInterceptors(page);
    await profilePage.clickLogout();
    await profilePage.waitForLogout();
    
    // Verify logout
    expect(page.url()).toContain('/signin');
    expect(logoutApiResponses.logout.status).toBe(204);
    
    // Step 3: Sign in with same credentials
    const signinApiResponses = await setupSigninInterceptors(page);
    await signInPage.navigate();
    await signInPage.fillEmailSigninForm({
      email,
      password
    });
    
    // Validate form before submission
    const signinValidation = signInPage.validateFormFields({ email, password }, true);
    expect(signinValidation.isValid).toBe(true);
    
    await signInPage.submitSigninForm();
    await signInPage.waitForSubmission();
    await profilePage.waitForLoad();
    
    // Validate successful signin
    const signinAuthValidation = await profilePage.validateSuccessfulAuth(email);
    expect(signinAuthValidation.isValid).toBe(true);
    expect(signinApiResponses.signin.status).toBe(200);
    expect(signinApiResponses.userProfile.status).toBe(200);
    
    // Step 4: Final logout
    const finalLogoutApiResponses = await setupLogoutInterceptors(page);
    await profilePage.clickLogout();
    await profilePage.waitForLogout();
    
    expect(page.url()).toContain('/signin');
    expect(finalLogoutApiResponses.logout.status).toBe(204);
  });
  
  test('Complete user journey: Sign up with phone -> Sign in -> Logout', async ({ page }) => {
    // Step 1: Sign up with phone
    const signupApiResponses = await setupSignupInterceptors(page);
    const phone = FormValidation.generateRandomPhone();
    const password = FormValidation.generateValidPassword();
    
    await signUpPage.navigate();
    await signUpPage.fillPhoneSignupForm({
      phone,
      password,
      subscribe: false
    });
    
    const signupValidation = signUpPage.validateFormFields({ phone, password }, false);
    expect(signupValidation.isValid).toBe(true);
    
    await signUpPage.submitSignupForm();
    await signUpPage.waitForSubmission();
    await profilePage.waitForLoad();
    
    const signupAuthValidation = await profilePage.validateSuccessfulAuth(phone);
    expect(signupAuthValidation.isValid).toBe(true);
    expect(signupApiResponses.signup.status).toBe(200);
    
    // Step 2: Logout
    const logoutApiResponses = await setupLogoutInterceptors(page);
    await profilePage.clickLogout();
    await profilePage.waitForLogout();
    
    expect(page.url()).toContain('/signin');
    expect(logoutApiResponses.logout.status).toBe(204);
    
    // Step 3: Sign in with phone
    const signinApiResponses = await setupSigninInterceptors(page);
    await signInPage.navigate();
    await signInPage.fillPhoneSigninForm({
      phone,
      password
    });
    
    const signinValidation = signInPage.validateFormFields({ phone, password }, false);
    expect(signinValidation.isValid).toBe(true);
    
    await signInPage.submitSigninForm();
    await signInPage.waitForSubmission();
    await profilePage.waitForLoad();
    
    const signinAuthValidation = await profilePage.validateSuccessfulAuth(phone);
    expect(signinAuthValidation.isValid).toBe(true);
    expect(signinApiResponses.signin.status).toBe(200);
  });
  
  test('Error handling: Sign up with existing email -> Sign in with wrong password -> Correct sign in', async ({ page }) => {
    // Step 1: Try to sign up with existing email
    const signupApiResponses = await setupSignupInterceptors(page);
    const existingEmail = existingUser.email;
    const password = FormValidation.generateValidPassword();
    
    await signUpPage.navigate();
    await signUpPage.fillEmailSignupForm({
      email: existingEmail,
      password
    });
    
    await signUpPage.submitSignupForm();
    await signUpPage.waitForSubmission();
    
    // Should get 400 for existing user
    expect(signupApiResponses.signup.status).toBe(400);
    
    // Step 2: Try to sign in with wrong password
    const signinApiResponses = await setupSigninInterceptors(page);
    await signInPage.navigate();
    await signInPage.fillEmailSigninForm({
      email: existingEmail,
      password: 'WrongPassword123!'
    });
    
    await signInPage.submitSigninForm();
    await signInPage.waitForSubmission();
    
    // Should get 400 for wrong password
    expect(signinApiResponses.signin.status).toBe(400);
    
    // Step 3: Sign in with correct password
    const correctSigninApiResponses = await setupSigninInterceptors(page);
    await signInPage.fillEmailSigninForm({
      email: existingEmail,
      password: existingUser.password
    });
    
    await signInPage.submitSigninForm();
    await signInPage.waitForSubmission();
    await profilePage.waitForLoad();
    
    // Should succeed
    const signinAuthValidation = await profilePage.validateSuccessfulAuth(existingEmail);
    expect(signinAuthValidation.isValid).toBe(true);
    expect(correctSigninApiResponses.signin.status).toBe(200);
  });
  
  test('Session persistence: Multiple page refreshes after sign in', async ({ page }) => {
    // Sign in
    const signinApiResponses = await setupSigninInterceptors(page);
    const email = valid.email;
    const password = valid.password;
    
    await signInPage.navigate();
    await signInPage.fillEmailSigninForm({ email, password });
    await signInPage.submitSigninForm();
    await signInPage.waitForSubmission();
    await profilePage.waitForLoad();
    
    // Verify initial sign in
    const initialAuthValidation = await profilePage.validateSuccessfulAuth(email);
    expect(initialAuthValidation.isValid).toBe(true);
    
    // Refresh page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should still be signed in
      expect(await profilePage.isProfilePageLoaded()).toBe(true);
      expect(await profilePage.isLogoutButtonVisible()).toBe(true);
    }
    
    // Final logout
    const logoutApiResponses = await setupLogoutInterceptors(page);
    await profilePage.clickLogout();
    await profilePage.waitForLogout();
    
    expect(page.url()).toContain('/signin');
    expect(logoutApiResponses.logout.status).toBe(204);
  });
  
  test('Form validation across all pages', async ({ page }) => {
    // Test signup form validation
    await signUpPage.navigate();
    
    const invalidSignupData = {
      email: 'invalid-email',
      password: 'short'
    };
    
    const signupValidation = signUpPage.validateFormFields(invalidSignupData, true);
    expect(signupValidation.isValid).toBe(false);
    expect(signupValidation.errors.length).toBeGreaterThan(0);
    
    // Test signin form validation
    await signInPage.navigate();
    
    const invalidSigninData = {
      email: '',
      password: ''
    };
    
    const signinValidation = signInPage.validateFormFields(invalidSigninData, true);
    expect(signinValidation.isValid).toBe(false);
    expect(signinValidation.errors.length).toBeGreaterThan(0);
  });
  
  test('Password visibility toggle across all forms', async ({ page }) => {
    const password = FormValidation.generateValidPassword();
    
    // Test signup form
    await signUpPage.navigate();
    await signUpPage.fillPassword(password);
    expect(await signUpPage.isPasswordVisible()).toBe(false);
    
    await signUpPage.togglePasswordVisibility();
    expect(await signUpPage.isPasswordVisible()).toBe(true);
    
    // Test signin form
    await signInPage.navigate();
    await signInPage.fillPassword(password);
    expect(await signInPage.isPasswordVisible()).toBe(false);
    
    await signInPage.togglePasswordVisibility();
    expect(await signInPage.isPasswordVisible()).toBe(true);
  });
  
  test('API response validation across all flows', async ({ page }) => {
    // Test signup API
    const signupApiResponses = await setupSignupInterceptors(page);
    const email = FormValidation.generateRandomEmail();
    const password = FormValidation.generateValidPassword();
    
    await signUpPage.navigate();
    await signUpPage.fillEmailSignupForm({ email, password });
    await signUpPage.submitSignupForm();
    await signUpPage.waitForSubmission();
    
    const signupValidation = ApiHelpers.validateSignupResponse(signupApiResponses.signup, true);
    expect(signupValidation.isValid).toBe(true);
    
    // Test signin API
    const signinApiResponses = await setupSigninInterceptors(page);
    await signInPage.navigate();
    await signInPage.fillEmailSigninForm({ email, password });
    await signInPage.submitSigninForm();
    await signInPage.waitForSubmission();
    
    const signinValidation = ApiHelpers.validateSigninResponse(signinApiResponses.signin, true);
    expect(signinValidation.isValid).toBe(true);
    
    // Test logout API
    await profilePage.waitForLoad();
    const logoutApiResponses = await setupLogoutInterceptors(page);
    await profilePage.clickLogout();
    await profilePage.waitForLogout();
    
    const logoutValidation = ApiHelpers.validateLogoutResponse(logoutApiResponses.logout);
    expect(logoutValidation.isValid).toBe(true);
  });
});
