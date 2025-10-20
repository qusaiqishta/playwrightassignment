/**
 * Sign In Tests
 * Comprehensive test cases for user authentication functionality
 */

import { test, expect } from '@playwright/test';
import SignInPage from '../pages/SignInPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import { setupSigninInterceptors } from '../utils/apiHelpers.js';
import { valid, invalid } from '../testData/testData.js';
import { signIn } from '../testData/selectors.js';

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
      const apiResponses = await setupSigninInterceptors(page);
      
      // Use valid credentials (assuming user was created in signup tests)
      const email = valid.email;
      const password = valid.password;
      
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
      
      // Validate successful signin
      const authValidation = await profilePage.validateSuccessfulAuth(email);
      expect(authValidation.isValid).toBe(true);
      
      // Validate API responses
      expect(apiResponses.signin.status).toBe(200);
      expect(apiResponses.userProfile.status).toBe(200);
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
      const apiResponses = await setupSigninInterceptors(page);
      
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
      
      const authValidation = await profilePage.validateSuccessfulAuth(phone);
      expect(authValidation.isValid).toBe(true);
    });
  });
  
  test.describe('Email Sign In - Negative Test Cases', () => {
    test('should show error for invalid email format', async ({ page }) => {
      const invalidEmails = invalid.emails;
      
      for (const email of invalidEmails) {
        await signInPage.clearForm();
        await signInPage.fillEmailSigninForm({
          email,
          password: 'TestPassword123!'
        });
        
        const validation = signInPage.validateFormFields({ email, password: 'TestPassword123!' }, true);
        if (email.trim() === '') {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Email is required');
        } else {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Please enter a valid email address');
        }
      }
    });
    
    test('should show error for non-existing email', async ({ page }) => {
      const apiResponses = await setupSigninInterceptors(page);
      
      const nonExistingEmail = 'nonexisting@example.com';
      const password = 'TestPassword123!';
      
      await signInPage.fillEmailSigninForm({
        email: nonExistingEmail,
        password
      });
      
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      
      // Should get 400 status for non-existing user
      expect(apiResponses.signin.status).toBe(400);
    });
    
    test('should show error for wrong password', async ({ page }) => {
      const apiResponses = await setupSigninInterceptors(page);
      
      const email = valid.email;
      const wrongPassword = 'WrongPassword123!';
      
      await signInPage.fillEmailSigninForm({
        email,
        password: wrongPassword
      });
      
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      
      // Should get 400 status for wrong password
      expect(apiResponses.signin.status).toBe(400);
    });
    
    test('should show error for empty required fields', async ({ page }) => {
      // Test empty email
      await signInPage.fillEmailSigninForm({
        email: '',
        password: 'TestPassword123!'
      });
      
      const validation = signInPage.validateFormFields({ 
        email: '', 
        password: 'TestPassword123!' 
      }, true);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email is required');
      
      // Test empty password
      await signInPage.clearForm();
      await signInPage.fillEmailSigninForm({
        email: valid.email,
        password: ''
      });
      
      const validation2 = signInPage.validateFormFields({ 
        email: valid.email, 
        password: '' 
      }, true);
      expect(validation2.isValid).toBe(false);
      expect(validation2.errors).toContain('Password is required');
    });
    
    test('should show error for case-sensitive email', async ({ page }) => {
      const apiResponses = await setupSigninInterceptors(page);
      
      const email = valid.email.toUpperCase(); // Wrong case
      const password = valid.password;
      
      await signInPage.fillEmailSigninForm({
        email,
        password
      });
      
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      
      // Should get 400 status for case-sensitive email
      expect(apiResponses.signin.status).toBe(400);
    });
  });
  
  test.describe('Phone Sign In - Negative Test Cases', () => {
    test('should show error for invalid phone format', async ({ page }) => {
      const invalidPhones = invalid.phones;
      
      for (const phone of invalidPhones) {
        await signInPage.clearForm();
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
          expect(validation.errors).toContain('Please enter a valid phone number (+966XXXXXXXXX)');
        }
      }
    });
    
    test('should show error for non-existing phone number', async ({ page }) => {
      const apiResponses = await setupSigninInterceptors(page);
      
      const nonExistingPhone = '+966501234999';
      const password = 'TestPassword123!';
      
      await signInPage.fillPhoneSigninForm({
        phone: nonExistingPhone,
        password
      });
      
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      
      expect(apiResponses.signin.status).toBe(400);
    });
    
    test('should show error for wrong password with phone', async ({ page }) => {
      const apiResponses = await setupSigninInterceptors(page);
      
      const phone = valid.phone;
      const wrongPassword = 'WrongPassword123!';
      
      await signInPage.fillPhoneSigninForm({
        phone,
        password: wrongPassword
      });
      
      await signInPage.submitSigninForm();
      await signInPage.waitForSubmission();
      
      expect(apiResponses.signin.status).toBe(400);
    });
  });
  
  test.describe('Edge Cases', () => {
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
  
  test.describe('Form Validation', () => {
    test('should validate form fields before submission', async ({ page }) => {
      const testCases = [
        { email: '', password: '', expectedValid: false },
        { email: 'invalid-email', password: 'Test123!', expectedValid: false },
        { email: 'valid@example.com', password: '', expectedValid: false },
        { email: 'valid@example.com', password: 'Test123!', expectedValid: true }
      ];
      
      for (const testCase of testCases) {
        const validation = signInPage.validateFormFields(testCase, true);
        expect(validation.isValid).toBe(testCase.expectedValid);
      }
    });
    
    test('should validate phone form fields before submission', async ({ page }) => {
      const testCases = [
        { phone: '', password: '', expectedValid: false },
        { phone: '123456789', password: 'Test123!', expectedValid: false },
        { phone: '+966501234567', password: '', expectedValid: false },
        { phone: '+966501234567', password: 'Test123!', expectedValid: true }
      ];
      
      for (const testCase of testCases) {
        const validation = signInPage.validateFormFields(testCase, false);
        expect(validation.isValid).toBe(testCase.expectedValid);
      }
    });
  });
  
  test.describe('UI Elements', () => {
    test('should have all required form elements', async ({ page }) => {
      // Check if all form elements are present
      await expect(page.locator(signIn.emailInput)).toBeVisible();
      await expect(page.locator(signIn.phoneInput)).toBeVisible();
      await expect(page.locator(signIn.passwordInput)).toBeVisible();
      await expect(page.locator(signIn.signInButton)).toBeVisible();
      await expect(page.locator(signIn.showHidePasswordIcon)).toBeVisible();
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
    
    test('should check for remember me functionality if available', async ({ page }) => {
      const hasRememberMe = await signInPage.hasRememberMeCheckbox();
      if (hasRememberMe) {
        await signInPage.setRememberMe(true);
        // Verify checkbox is checked
        // This would need additional implementation in the page object
      }
    });
    
    test('should check for forgot password link if available', async ({ page }) => {
      const hasForgotPassword = await signInPage.hasForgotPasswordLink();
      if (hasForgotPassword) {
        await signInPage.clickForgotPassword();
        // Verify navigation to forgot password page
        // This would need additional implementation
      }
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
      await signInPage.waitForSubmission();
      
      // Password should not be visible in form values
      const formValues = await signInPage.getFormValues();
      expect(formValues.password).toBe('');
    });
    
    test('should handle multiple failed login attempts', async ({ page }) => {
      const apiResponses = await setupSigninInterceptors(page);
      
      const wrongPassword = 'WrongPassword123!';
      
      // Attempt multiple failed logins
      for (let i = 0; i < 3; i++) {
        await signInPage.clearForm();
        await signInPage.fillEmailSigninForm({
          email: valid.email,
          password: wrongPassword
        });
        
        await signInPage.submitSigninForm();
        await signInPage.waitForSubmission();
        
        // Each attempt should return 400
        expect(apiResponses.signin.status).toBe(400);
      }
    });
  });
});
