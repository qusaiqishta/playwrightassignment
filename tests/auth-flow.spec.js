/**
 * Complete Authentication Flow Tests
 * End-to-end tests covering the complete user journey
 */

import { test, expect } from '@playwright/test';
import SignUpPage from '../pages/SignUpPage.js';
import SignInPage from '../pages/SignInPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import ApiHelpers  from '../utils/apiHelpers.js';
import FormValidation from '../utils/formValidation.js';
import { valid, existingUser } from '../testData/testData.js';
import selectors from '../testData/selectors.js';
test.describe('Complete Authentication Flow', () => {
  let signUpPage;
  let signInPage;
  let profilePage;
  
  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    signInPage = new SignInPage(page);
    profilePage = new ProfilePage(page);
    ApiHelpers.interceptSignUpWithTestCaptcha(page);
    ApiHelpers.interceptAuthWithTestCaptcha(page);
  });
  
  test('Complete user journey: Sign up -> Sign in -> Logout', async ({ page }) => {
    // Step 1: Sign up with email
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
    const authApiResponse = await ApiHelpers.setupSignupInterceptors(page);
    const profileApiResponse = await ApiHelpers.waitForUserProfile(page);
    
    // Validate successful signup
    expect(authApiResponse.status).toBe(200);
    expect(profileApiResponse.status).toBe(200);
    const signupAuthValidation = await profilePage.validateSuccessfulAuth(email);
    expect(signupAuthValidation.isValid).toBe(true);
    
    // Step 2: Logout
    await profilePage.clickLogout();
    const logoutApiResponses = await ApiHelpers.setupLogoutInterceptors(page);
    await profilePage.waitForLogout();
    
    // Verify logout
    expect(logoutApiResponses.status).toBe(204);
    expect(page.url()).toContain('/signin');
    
    // Step 3: Sign in with same credentials
    await signInPage.fillEmailSigninForm({
      email,
      password
    });
    
    // Validate form before submission
    const signinValidation = signInPage.validateFormFields({ email, password }, true);
    expect(signinValidation.isValid).toBe(true);
    
    await signInPage.submitSigninForm();
    
    // Validate successful signin
    const signinApiResponses = await ApiHelpers.waitForSigninToken(page);
    expect(signinApiResponses.status).toBe(200);
    expect(profileApiResponse.status).toBe(200);
    const signinAuthValidation = await profilePage.validateSuccessfulAuth(email);
    console.log('error',signinAuthValidation.errors)
    expect(signinAuthValidation.isValid).toBe(true);
    
    // Step 4: Final logout
    await profilePage.clickLogout();
    const finalLogoutApiResponses = await ApiHelpers.setupLogoutInterceptors(page);
    await profilePage.waitForLogout();
    
    expect(page.url()).toContain('/signin');
    expect(finalLogoutApiResponses.status).toBe(204);
  });
  
  test('Complete user journey: Sign up with phone -> Sign in -> Logout', async ({ page }) => {
    // Step 1: Sign up with phone
    const phone = FormValidation.generateRandomPhone();
    const password = FormValidation.generateValidPassword();
    
    await signUpPage.navigate();
    await signUpPage.fillPhoneSignupForm({
      phone,
      password,
      subscribe: false
    });
    // Validate form before submission
    const signupValidation = signUpPage.validateFormFields({ phone, password }, false);
    expect(signupValidation.isValid).toBe(true);
    
    await signUpPage.submitSignupForm();
    const authApiResponse = await ApiHelpers.setupSignupInterceptors(page);
    const profileApiResponse = await ApiHelpers.waitForUserProfile(page);
    
    // Validate successful signup
    expect(authApiResponse.status).toBe(200);
    expect(profileApiResponse.status).toBe(200);
    const signupAuthValidation = await profilePage.validateSuccessfulAuth('+966 '+phone);
    expect(signupAuthValidation.isValid).toBe(true);
    
    // Step 2: Logout
    await profilePage.clickLogout();
    const logoutApiResponses = await ApiHelpers.setupLogoutInterceptors(page);
    await profilePage.waitForLogout();
    
    // Verify logout
    expect(logoutApiResponses.status).toBe(204);
    expect(page.url()).toContain('/signin');
    
    // Step 3: Sign in with same credentials
    await signInPage.fillPhoneSigninForm({
      phone,
      password
    });
    
    // Validate form before submission
    const signinValidation = signInPage.validateFormFields({ phone, password }, false);
    expect(signinValidation.isValid).toBe(true);
    
    await signInPage.submitSigninForm();
    
    // Validate successful signin
    const signinApiResponses = await ApiHelpers.waitForSigninToken(page);
    expect(signinApiResponses.status).toBe(200);
    expect(profileApiResponse.status).toBe(200);
    const signinAuthValidation = await profilePage.validateSuccessfulAuth('+966 '+phone);
    console.log('error',signinAuthValidation.errors)
    expect(signinAuthValidation.isValid).toBe(true);
    
    // Step 4: Final logout
    await profilePage.clickLogout();
    const finalLogoutApiResponses = await ApiHelpers.setupLogoutInterceptors(page);
    await profilePage.waitForLogout();
    
    expect(page.url()).toContain('/signin');
    expect(finalLogoutApiResponses.status).toBe(204);
  });
  
  test('Error handling: Sign up with existing email -> Sign in with wrong password -> Correct sign in', async ({ page }) => {
    // Step 1: Try to sign up with existing email
    const existingEmail = existingUser.email;
    const password = FormValidation.generateValidPassword();
    
    await signUpPage.navigate();
    await signUpPage.fillEmailSignupForm({
      email: existingEmail,
      password
    });
    
    await signUpPage.submitSignupForm();
    const signupApiResponses = await ApiHelpers.setupSignupInterceptors(page);
    
    // Should get 400 for existing user
    expect(signupApiResponses.status).toBe(400);
    await expect(page.getByText(selectors.errorMessages.generalSignUpError)).toBeVisible();
    // Step 2: Try to sign in with wrong password
    await signInPage.navigate();
    await signInPage.fillEmailSigninForm({
      email: existingEmail,
      password: 'WrongPassword123!'
    });
    
    await signInPage.submitSigninForm();
    const signinApiResponses = await ApiHelpers.waitForSigninToken(page);
    
    // Should get 400 for wrong password
    expect(signinApiResponses.status).toBe(400);
    await expect(page.getByText(selectors.errorMessages.generalLoginError)).toBeVisible();
    // Step 3: Sign in with correct password
    await signInPage.fillEmailSigninForm({
      email: existingEmail,
      password: valid.validPasswords[0]
    });
    
    await signInPage.submitSigninForm();
    const correctSigninApiResponses = await ApiHelpers.waitForSigninToken(page);
    const profileApiResponse = await ApiHelpers.waitForUserProfile(page);
    // Should succeed
    expect(correctSigninApiResponses.status).toBe(200);
    expect(profileApiResponse.status).toBe(200);
    const signinAuthValidation = await profilePage.validateSuccessfulAuth(existingEmail);
    expect(signinAuthValidation.isValid).toBe(true);
  });
  
  test('Session persistence: Multiple page refreshes after sign in', async ({ page }) => {
    // Sign in
    const existingEmail = existingUser.email;
    await signInPage.navigate();
    await signInPage.fillEmailSigninForm({
      email: existingEmail,
      password: valid.validPasswords[0]
    });
    
    await signInPage.submitSigninForm();
    const correctSigninApiResponses = await ApiHelpers.waitForSigninToken(page);
    const profileApiResponse = await ApiHelpers.waitForUserProfile(page);
    // Should succeed
    expect(correctSigninApiResponses.status).toBe(200);
    expect(profileApiResponse.status).toBe(200);
    const signinAuthValidation = await profilePage.validateSuccessfulAuth(existingEmail);
    expect(signinAuthValidation.isValid).toBe(true);
    
    // Refresh page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();      
      // Should still be signed in
      expect(await profilePage.isProfilePageLoaded()).toBe(true);
      expect(await profilePage.isLogoutButtonVisible()).toBe(true);
    }
    
    // Final logout
    await profilePage.clickLogout();
    const logoutApiResponses = await ApiHelpers.setupLogoutInterceptors(page);
    await profilePage.waitForLogout();
    
    expect(page.url()).toContain('/signin');
    expect(logoutApiResponses.status).toBe(204);
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
    const email = FormValidation.generateRandomEmail();
    const password = FormValidation.generateValidPassword();
    
    await signUpPage.navigate();
    await signUpPage.fillEmailSignupForm({ email, password });
    await signUpPage.submitSignupForm();
    const signupApiResponses = await ApiHelpers.setupSignupInterceptors(page);
    
    const signupValidation = ApiHelpers.validateSignupResponse(signupApiResponses, true);
    expect(signupValidation.isValid).toBe(true);
    const authValidation = await profilePage.validateSuccessfulAuth(email);
    expect(authValidation.isValid).toBe(true);

    // Test logout API
    await profilePage.clickLogout();
    const logoutApiResponses = await ApiHelpers.setupLogoutInterceptors(page);
    await profilePage.waitForLogout();
    
    const logoutValidation = ApiHelpers.validateLogoutResponse(logoutApiResponses);
    expect(logoutValidation.isValid).toBe(true);

    // Test signin API
    await signInPage.fillEmailSigninForm({ email, password });
    await signInPage.submitSigninForm();
    const signinApiResponses = await ApiHelpers.waitForSigninToken(page);
    
    const signinValidation = ApiHelpers.validateSigninResponse(signinApiResponses, true);
    expect(signinValidation.isValid).toBe(true);
  });
});
