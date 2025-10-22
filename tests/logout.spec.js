/**
 * Logout Tests
 * Comprehensive test cases for user logout functionality
 */

import { test, expect } from '@playwright/test';
import SignInPage from '../pages/SignInPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import ApiHelpers from '../utils/apiHelpers.js';
import { valid } from '../testData/testData.js';
import selectors , { urls } from '../testData/selectors.js';

test.describe('Logout Tests', () => {
  let signInPage;
  let profilePage;
  
  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    profilePage = new ProfilePage(page);
    ApiHelpers.interceptAuthWithTestCaptcha(page);
  });
  
  test.describe('Successful Logout', () => {
    test('should successfully logout from profile page', async ({ page }) => {
      // First sign in to get to profile page
      await signInPage.navigate();
      await signInPage.fillEmailSigninForm({
        email: valid.validEmails[0],
        password: valid.validPasswords[0]
      });
      await signInPage.submitSigninForm();
      const authApiResponse = await ApiHelpers.waitForSigninToken(page);
      const profileApiResponse = await ApiHelpers.waitForUserProfile(page);
      // Validate API responses
      expect(authApiResponse.status).toBe(200);
      expect(profileApiResponse.status).toBe(200);
      await page.waitForSelector(selectors.profile.emailInput, { timeout: 15000 });
      
      // Verify we're on profile page
      expect(await profilePage.isProfilePageLoaded()).toBe(true);
      expect(await profilePage.isLogoutButtonVisible()).toBe(true);
      
      // Click logout button
      await profilePage.clickLogout();
      
      // Wait for logout to complete and redirect
      // await profilePage.waitForLogout();
      const apiResponses = await ApiHelpers.setupLogoutInterceptors(page);
      
      // Verify redirect to sign in page
      await page.waitForSelector(selectors.signIn.passwordInput, { timeout: 15000 });
      const currentUrl = page.url();
      expect(currentUrl).toContain('/signin');
      
      // Verify API response
      expect(apiResponses.status).toBe(204);
    });
    
    
    test('should logout with phone number signin', async ({ page }) => {
    // Setup API interceptors
    ApiHelpers.interceptAuthWithTestCaptcha(page);
      
    // First sign in to get to profile page
    await signInPage.navigate();
    await signInPage.fillPhoneSigninForm({
      phone: valid.phone,
      password: valid.password
    });
    await signInPage.submitSigninForm();
    const authApiResponse = await ApiHelpers.waitForSigninToken(page);
    const profileApiResponse = await ApiHelpers.waitForUserProfile(page);
    // Validate API responses
    expect(authApiResponse.status).toBe(200);
    expect(profileApiResponse.status).toBe(200);
    await page.waitForSelector(selectors.profile.emailInput, { timeout: 15000 });
    
    // Verify we're on profile page
    expect(await profilePage.isProfilePageLoaded()).toBe(true);
    expect(await profilePage.isLogoutButtonVisible()).toBe(true);
    
    // Click logout button
    await profilePage.clickLogout();
    
    // Wait for logout to complete and redirect
    // await profilePage.waitForLogout();
    const apiResponses = await ApiHelpers.setupLogoutInterceptors(page);
    
    // Verify redirect to sign in page
    await page.waitForSelector(selectors.signIn.passwordInput, { timeout: 15000 });
    await page.waitForSelector(selectors.signInButton, { timeout: 15000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain('/signin');
    
    // Verify API response
    expect(apiResponses.status).toBe(204);
    });
  });
  
  test.describe('Session Management', () => {
    test('should clear user session after logout', async ({ page }) => {
      
      // Sign in
      await signInPage.navigate();
      await signInPage.fillEmailSigninForm({
        email: valid.validEmails[0],
        password: valid.validPasswords[0]
      });
      await signInPage.submitSigninForm();
      // Verify user is signed in
      const authApiResponse = await ApiHelpers.waitForSigninToken(page);
      const profileApiResponse = await ApiHelpers.waitForUserProfile(page);
      expect(authApiResponse.status).toBe(200);
      expect(profileApiResponse.status).toBe(200);
      await page.waitForSelector(selectors.profile.emailInput, { timeout: 15000 });
      expect(await profilePage.isProfilePageLoaded()).toBe(true);
      expect(await profilePage.isLogoutButtonVisible()).toBe(true);
      
      // Logout
      await profilePage.clickLogout();
      await page.waitForSelector(selectors.signIn.passwordInput, { timeout: 15000 });
      // Try to access profile page directly after logout
      await page.goto(urls.profilePage);
      
      // Should be redirected to sign in page
      expect(page.url()).toContain('/signin');
    });
  });
  
  test.describe('UI State After Logout', () => {
    
    test('should clear form data after logout', async ({ page }) => {      
      // Sign in
      await signInPage.navigate();
      await signInPage.fillPhoneSigninForm({
        phone: valid.phone,
        password: valid.password
      });
      await signInPage.submitSigninForm();
      const authApiResponse = await ApiHelpers.waitForSigninToken(page);
      const profileApiResponse = await ApiHelpers.waitForUserProfile(page);
      expect(authApiResponse.status).toBe(200);
      expect(profileApiResponse.status).toBe(200);
      await page.waitForSelector(selectors.profile.emailInput, { timeout: 15000 });
      
      // Logout
      await profilePage.clickLogout();

       // Should see sign in button on the sign in page
       await page.waitForSelector(selectors.signInButton, { timeout: 15000 });
      
      // Form should be empty -- this will fail due to a bug in the application
      const formValues = await signInPage.getFormValues();
      expect(formValues.phone).toBe('');
      expect(formValues.password).toBe('');
    });
  });
});
