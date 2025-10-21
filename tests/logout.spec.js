/**
 * Logout Tests
 * Comprehensive test cases for user logout functionality
 */

import { test, expect } from '@playwright/test';
import SignInPage from '../pages/SignInPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import ApiHelpers, { setupLogoutInterceptors } from '../utils/apiHelpers.js';
import { valid } from '../testData/testData.js';
import { urls } from '../testData/selectors.js';

test.describe('Logout Tests', () => {
  let signInPage;
  let profilePage;
  
  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    profilePage = new ProfilePage(page);
  });
  
  test.describe('Successful Logout', () => {
    test('should successfully logout from profile page', async ({ page }) => {
      // Setup API interceptors
      const apiResponses = await setupLogoutInterceptors(page);
      
      // First sign in to get to profile page
      await signInPage.navigate();
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password: valid.password
      });
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      
      // Wait for profile page to load
      await profilePage.waitForLoad();
      
      // Verify we're on profile page
      expect(await profilePage.isProfilePageLoaded()).toBe(true);
      expect(await profilePage.isLogoutButtonVisible()).toBe(true);
      
      // Click logout button
      await profilePage.clickLogout();
      
      // Wait for logout to complete and redirect
      await profilePage.waitForLogout();
      
      // Verify redirect to sign in page
      expect(page.url()).toContain('/signin');
      
      // Verify API response
      expect(apiResponses.logout.status).toBe(204);
    });
    
    test('should logout and redirect to sign in page after successful logout', async ({ page }) => {
      const apiResponses = await setupLogoutInterceptors(page);
      
      // Sign in first
      await signInPage.navigate();
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password: valid.password
      });
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      await profilePage.waitForLoad();
      
      // Verify profile page is loaded
      expect(await profilePage.isProfilePageLoaded()).toBe(true);
      
      // Perform logout
      await profilePage.clickLogout();
      await profilePage.waitForLogout();
      
      // Verify redirect to sign in page
      const currentUrl = page.url();
      expect(currentUrl).toBe(urls.signInPage);
      
      // Verify API response
      expect(apiResponses.logout.status).toBe(204);
    });
    
    test('should logout with phone number signin', async ({ page }) => {
      const apiResponses = await setupLogoutInterceptors(page);
      
      // Sign in with phone
      await signInPage.navigate();
      await signInPage.fillPhoneSigninForm({
        phone: valid.phone,
        password: valid.password
      });
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      await profilePage.waitForLoad();
      
      // Verify profile page is loaded
      expect(await profilePage.isProfilePageLoaded()).toBe(true);
      
      // Perform logout
      expect(await profilePage.isLogoutButtonVisible()).toBe(true);
      await profilePage.clickLogout();
      await profilePage.waitForLogout();
      
      // Verify redirect to sign in page
      expect(page.url()).toContain('/signin');
      expect(apiResponses.logout.status).toBe(204);
      expect(await profilePage.isLogoutButtonVisible()).toBe(false);
    });
  });
  
  test.describe('Logout API Validation', () => {
    test('should validate logout API response status code', async ({ page }) => {
      const apiResponses = await setupLogoutInterceptors(page);
      
      // Sign in
      await signInPage.navigate();
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password: valid.password
      });
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      await profilePage.waitForLoad();
      
      // Logout
      await profilePage.clickLogout();
      await profilePage.waitForLogout();
      
      // Validate API response
      const validation = ApiHelpers.validateLogoutResponse(apiResponses.logout);
      expect(validation.isValid).toBe(true);
      expect(apiResponses.logout.status).toBe(204);
    });
  });
  
  test.describe('Session Management', () => {
    test('should clear user session after logout', async ({ page }) => {
      const apiResponses = await setupLogoutInterceptors(page);
      
      // Sign in
      await signInPage.navigate();
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password: valid.password
      });
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      await profilePage.waitForLoad();
      
      // Verify user is signed in
      expect(await profilePage.isProfilePageLoaded()).toBe(true);
      expect(await profilePage.isLogoutButtonVisible()).toBe(true);
      
      // Logout
      await profilePage.clickLogout();
      await profilePage.waitForLogout();
      
      // Try to access profile page directly after logout
      await page.goto(urls.profilePage);
      await page.waitForLoadState('networkidle');
      
      // Should be redirected to sign in page
      expect(page.url()).toContain('/signin');
    });
  });
  
  test.describe('UI State After Logout', () => {
    test('should show sign in button after logout', async ({ page }) => {
      const apiResponses = await setupLogoutInterceptors(page);
      
      // Sign in
      await signInPage.navigate();
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password: valid.password
      });
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      await profilePage.waitForLoad();
      
      // Logout
      await profilePage.clickLogout();
      await profilePage.waitForLogout();
      
      // Should see sign in button on the sign in page
      await expect(page.locator(selectors.signInButton)).toBeVisible();
    });
    
    test('should clear form data after logout', async ({ page }) => {
      const apiResponses = await setupLogoutInterceptors(page);
      
      // Sign in
      await signInPage.navigate();
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password: valid.password
      });
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      await profilePage.waitForLoad();
      
      // Logout
      await profilePage.clickLogout();
      await profilePage.waitForLogout();
      
      // Navigate back to sign in page
      await signInPage.navigate();
      
      // Form should be empty
      const formValues = await signInPage.getFormValues();
      expect(formValues.email).toBe('');
      expect(formValues.password).toBe('');
    });
  });
});
