/**
 * Sign In Tests
 * Comprehensive test cases for user authentication functionality
 */

import { test, expect } from '@playwright/test';
import SignInPage from '../pages/SignInPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import { setupSigninInterceptors, setupProfileInterceptors } from '../utils/apiHelpers.js';
import { valid, invalid } from '../testData/testData.js';
import { signIn, errorMessages } from '../testData/selectors.js';

test.describe('Sign In Tests', () => {
  let signInPage;
  let profilePage;
  
  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    profilePage = new ProfilePage(page);
    await signInPage.navigate();
  });
  
  test.describe('Email Sign In - Positive Test Cases', () => {
    test('should successfully sign in with valid email and password', async ({ page }) => {
      // Setup API interceptors
      
      // Use valid credentials (assuming user was created in signup tests)
      const email = valid.validEmails[0];
      const password = valid.validPasswords[0];
      
      // Fill and submit form
      await signInPage.fillEmailSigninForm({
        email,
        password
      });
      
      // Validate form fields before submission
      const validation = signInPage.validateFormFields({ email, password }, true);
      expect(validation.isValid).toBe(true);
      
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      
      // Wait for profile page to load
      await profilePage.waitForLoad();
      const authApiResponse = await setupSigninInterceptors(page);
      const profileApiResponse = await setupProfileInterceptors(page);
      // Validate successful signin
      const authValidation = await profilePage.validateSuccessfulAuth(email);
      expect(authValidation.isValid).toBe(true);
      
      // Validate API responses
      expect(authApiResponse.status).toBe(200);
      expect(profileApiResponse.status).toBe(200);
    });
    
    test('should validate password visibility toggle functionality', async ({ page }) => {
      const password = 'TestPassword123!';
      
      await signInPage.fillPassword(password);
      
      // Initially password should be hidden
      expect(await signInPage.isPasswordVisible()).toBe(false);
      
      // Toggle to show password
      await signInPage.togglePasswordVisibility();
      expect(await signInPage.isPasswordVisible()).toBe(true);
      
      // Toggle back to hide password
      await signInPage.togglePasswordVisibility();
      expect(await signInPage.isPasswordVisible()).toBe(false);
    });
  });
  
  test.describe('Phone Sign In - Positive Test Cases', () => {
    test('should successfully sign in with valid phone number and password', async ({ page }) => {
      
      const phone = valid.phone;
      const password = valid.password;
      
      
      await signInPage.fillPhoneSigninForm({
        phone,
        password
      });
      
      const validation = signInPage.validateFormFields({ phone, password }, false);
      expect(validation.isValid).toBe(true);
      
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      await profilePage.waitForLoad();
      const apiResponses = await setupSigninInterceptors(page);
      
      const authValidation = await profilePage.validateSuccessfulAuth(phone);
      expect(authValidation.isValid).toBe(true);

      expect(apiResponses.signin.status).toBe(200);
      expect(apiResponses.userProfile.status).toBe(200);
    });
  });
  
  test.describe('Email Sign In - Negative Test Cases', () => {
    test('should show error for invalid email format', async ({ page }) => {
      const invalidEmails = invalid.emails;
      
      for (const email of invalidEmails) {
        await page.click(signIn.emailTab);
        await signInPage.clearEmailForm();
        await signInPage.fillEmailSigninForm({
          email,
          password: 'TestPassword123!'
        });
        await signInPage.submitSigninForm();
        const validation = signInPage.validateFormFields({ email, password: 'TestPassword123!' }, true);
        if (email.trim() === '') {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Email is required');
        } else {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain(errorMessages.notValidEmailError);
        }
        const emailError = await signInPage.getErrorMessage('email');
        expect(emailError).toContain(errorMessages.notValidEmailError);
      }
    });
    
    test('should show error for non-existing email', async ({ page }) => {
      const nonExistingEmail = 'nonexisting@example.com';
      const password = 'TestPassword123!';
      
      await signInPage.fillEmailSigninForm({
        email: nonExistingEmail,
        password
      });
      
      await signInPage.submitSigninForm();
      const apiResponses = await setupSigninInterceptors(page);
      
      // Should get 403 status for non-existing user
      expect(apiResponses.status).toBe(403);
      await expect(page.getByText(errorMessages.generalLoginError)).toBeVisible();
      
    });
    
    test('should show error for wrong password', async ({ page }) => {
      
      const email = valid.email;
      const wrongPassword = 'WrongPassword123!';
      
      await signInPage.fillEmailSigninForm({
        email,
        password: wrongPassword
      });
      
      await signInPage.submitSigninForm();
      
      const apiResponses = await setupSigninInterceptors(page);
      // Should get 403 status for wrong password
      expect(apiResponses.status).toBe(403);
      await expect(page.getByText(errorMessages.generalLoginError)).toBeVisible();
      
    });
    
    test('should show error for empty required fields', async ({ page }) => {
      // Test empty email
      await signInPage.fillEmailSigninForm({
        email: '',
        password: 'TestPassword123!'
      });
      await signInPage.submitSigninForm();
      const emailError = await signInPage.getErrorMessage('email');
      expect(emailError).toContain(errorMessages.emptyEmailError);
      const validation = signInPage.validateFormFields({ 
        email: '', 
        password: 'TestPassword123!' 
      }, true);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email is required');
      
      // Test empty password
      await signInPage.clearEmailForm();
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password: ''
      });
      
      const validation2 = signInPage.validateFormFields({ 
        email: valid.email, 
        password: '' 
      }, true);
      expect(validation2.isValid).toBe(false);
      expect(validation2.errors).toContain(errorMessages.emptyPasswordError);

      await signInPage.submitSigninForm();
      const passwordError = await signInPage.getErrorMessage('password');
      expect(passwordError).toContain(errorMessages.emptyPasswordError);
    });
    
    test('should show error for case-sensitive email', async ({ page }) => {
      
      const email = valid.validEmails[0].toUpperCase(); // Wrong case
      const password = valid.validPasswords[0];
      
      await signInPage.fillEmailSigninForm({
        email,
        password
      });
      
      await signInPage.submitSigninForm();
      const apiResponses = await setupSigninInterceptors(page);
      
      // Should get 403 status for case-sensitive email
      expect(apiResponses.status).toBe(403);
      await expect(page.getByText(errorMessages.generalLoginError)).toBeVisible();
    });
  });
  
  test.describe('Phone Sign In - Negative Test Cases', () => {
    test('should show error for invalid phone format', async ({ page }) => {
      const invalidPhones = invalid.phones;
      
      for (const phone of invalidPhones) {
        await signInPage.clearPhoneForm();
        await signInPage.fillPhoneSigninForm({
          phone,
          password: 'TestPassword123!'
        });
        
        const validation = signInPage.validateFormFields({ phone, password: 'TestPassword123!' }, false);
        if (phone.trim() === '') {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Phone number is required');
        } else {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain(errorMessages.notValidPhoneNumer);
        }
        const emailError = await signInPage.getErrorMessage('phone');
        expect(emailError).toContain(errorMessages.notValidPhoneNumer);
      }
    });
    
    test('should show error for non-existing phone number', async ({ page }) => {
      
      const nonExistingPhone = '501234999';
      const password = 'TestPassword123!';
      
      await signInPage.fillPhoneSigninForm({
        phone: nonExistingPhone,
        password
      });
      
      await signInPage.submitSigninForm();
      const apiResponses = await setupSigninInterceptors(page);
      expect(apiResponses.status).toBe(403);
      await expect(page.getByText(errorMessages.generalLoginError)).toBeVisible();

    });
    
    test('should show error for wrong password with phone', async ({ page }) => {
      
      const phone = valid.phone;
      const wrongPassword = 'WrongPassword123!';
      
      await signInPage.fillPhoneSigninForm({
        phone,
        password: wrongPassword
      });
      
      await signInPage.submitSigninForm();
      const apiResponses = await setupSigninInterceptors(page);
      expect(apiResponses.status).toBe(403);
      await expect(page.getByText(errorMessages.generalLoginError)).toBeVisible();
    });
  });
  
  test.describe('UI checks', () => {
    test('should handle email with special characters', async ({ page }) => {
      const specialEmails = [
        'user+tag@example.com',
        'user.name@example.com',
        'user123@subdomain.example.com'
      ];
      
      for (const email of specialEmails) {
        const validation = signInPage.validateFormFields({ 
          email, 
          password: 'TestPassword123!' 
        }, true);
        expect(validation.isValid).toBe(true);
      }
    });
    
    test('should handle very long email addresses', async ({ page }) => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      const validation = signInPage.validateFormFields({ 
        email: longEmail, 
        password: 'TestPassword123!' 
      }, true);
      expect(validation.isValid).toBe(true);
    });
    
    test('should handle very long passwords', async ({ page }) => {
      const longPassword = 'Test123!' + 'a'.repeat(100);
      const validation = signInPage.validateFormFields({ 
        email: 'test@example.com', 
        password: longPassword 
      }, true);
      expect(validation.isValid).toBe(true);
    });
  });
  
  test.describe('UI Elements', () => {
    test('should have all required form elements', async ({ page }) => {
      // Check if all form elements are present
      await expect(page.locator(signIn.phoneInput)).toBeVisible();
      await expect(page.locator(signIn.passwordInput)).toBeVisible();
      await expect(page.locator(signIn.signInButton)).toBeVisible();
      await expect(page.locator(signIn.showHidePasswordIcon)).toBeVisible();
      await page.click(signIn.emailTab);
      await expect(page.locator(signIn.emailInput)).toBeVisible();
    });
    
    test('should enable/disable sign in button based on form state', async ({ page }) => {
      // Fill valid form
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password: valid.password
      });
      
      const filledState = await signInPage.isSignInButtonEnabled();
      expect(filledState).toBe(true);
    });
    
    test('should check for forgot password link if available', async ({ page }) => {
        await signInPage.clickForgotPassword();
        await expect(page).toHaveURL(/\/forgot/);
      });
  });
  
  test.describe('Security Tests', () => {
    test('should not expose password in form values after submission', async ({ page }) => {
      const password = 'TestPassword123!';
      
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password
      });
      
      await signInPage.submitSigninForm();      
      // Password should not be visible in form values
      const formValues = await signInPage.getEmailFormValues();
      expect(formValues.password).toBe('');
    });
    
    test('should handle multiple failed login attempts', async ({ page }) => {
      await page.click(signIn.emailTab);
      const wrongPassword = 'WrongPassword123!';
      
      // Attempt multiple failed logins
      for (let i = 0; i < 15; i++) {
        await signInPage.clearEmailForm();
        await signInPage.fillEmailSigninForm({
          email: valid.email,
          password: wrongPassword
        });
        
        await signInPage.submitSigninForm();
        // await setupSigninInterceptors(page)
      }
      const apiResponses = await setupSigninInterceptors(page);
      
      // Each attempt should return 429
      expect(apiResponses.status).toBe(429);
    });
  });
});
