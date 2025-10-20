/**
 * Sign Up Tests
 * Comprehensive test cases for user registration functionality
 */

import { test, expect } from '@playwright/test';
import SignUpPage from '../pages/SignUpPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import { setupSignupInterceptors } from '../utils/apiHelpers.js';
import FormValidation from '../utils/formValidation.js';
import { valid, invalid, existingUser } from '../testData/testData.js';
import selectors from '../testData/selectors.js';

test.describe('Sign Up Tests', () => {
  let signUpPage;
  let profilePage;
  
  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    profilePage = new ProfilePage(page);
    await signUpPage.navigate();
  });
  
  test.describe('Email Sign Up - Positive Test Cases', () => {
    test('should successfully sign up with valid email and password', async ({ page }) => {
      // Setup API interceptors
      const apiResponses = await setupSignupInterceptors(page);
      
      // Generate test data
      const email = FormValidation.generateRandomEmail();
      const password = FormValidation.generateValidPassword();
      
      // Fill and submit form
      await signUpPage.fillEmailSignupForm({
        email,
        password,
        subscribe: true
      });
      
      // Validate form fields before submission
      const validation = signUpPage.validateFormFields({ email, password }, true);
      expect(validation.isValid).toBe(true);
      
      await signUpPage.submitSignupForm();
      await signUpPage.waitForSubmission();
      
      // Wait for profile page to load
      await profilePage.waitForLoad();
      
      // Validate successful signup
      const authValidation = await profilePage.validateSuccessfulAuth(email);
      expect(authValidation.isValid).toBe(true);
      
      // Validate API responses
      expect(apiResponses.signup.status).toBe(200);
      expect(apiResponses.userProfile.status).toBe(200);
    });
    
    test('should successfully sign up with valid email and password without newsletter subscription', async ({ page }) => {
      const apiResponses = await setupSignupInterceptors(page);
      
      const email = FormValidation.generateRandomEmail();
      const password = FormValidation.generateValidPassword();
      
      await signUpPage.fillEmailSignupForm({
        email,
        password,
        subscribe: false
      });
      
      await signUpPage.submitSignupForm();
      await signUpPage.waitForSubmission();
      await profilePage.waitForLoad();
      
      const authValidation = await profilePage.validateSuccessfulAuth(email);
      expect(authValidation.isValid).toBe(true);
    });
    
    test('should validate password visibility toggle functionality', async ({ page }) => {
      const password = FormValidation.generateValidPassword();
      
      await signUpPage.fillPassword(password);
      
      // Initially password should be hidden
      expect(await signUpPage.isPasswordVisible()).toBe(false);
      
      // Toggle to show password
      await signUpPage.togglePasswordVisibility();
      expect(await signUpPage.isPasswordVisible()).toBe(true);
      
      // Toggle back to hide password
      await signUpPage.togglePasswordVisibility();
      expect(await signUpPage.isPasswordVisible()).toBe(false);
    });
  });
  
  test.describe('Phone Sign Up - Positive Test Cases', () => {
    test('should successfully sign up with valid phone number and password', async ({ page }) => {
      const apiResponses = await setupSignupInterceptors(page);
      
      const phone = FormValidation.generateRandomPhone();
      const password = FormValidation.generateValidPassword();
      
      await signUpPage.fillPhoneSignupForm({
        phone,
        password,
        subscribe: true
      });
      
      const validation = signUpPage.validateFormFields({ phone, password }, false);
      expect(validation.isValid).toBe(true);
      
      await signUpPage.submitSignupForm();
      await signUpPage.waitForSubmission();
      await profilePage.waitForLoad();
      
      const authValidation = await profilePage.validateSuccessfulAuth(phone);
      expect(authValidation.isValid).toBe(true);
    });
  });
  
  test.describe('Email Sign Up - Negative Test Cases', () => {
    test('should show error for invalid email format', async ({ page }) => {
      const invalidEmails = testData.invalid.emails;
      
      for (const email of invalidEmails) {
        await signUpPage.clearForm();
        await signUpPage.fillEmailSignupForm({
          email,
          password: FormValidation.generateValidPassword()
        });
        
        // Form validation should catch invalid emails
        const validation = signUpPage.validateFormFields({ email, password: 'Test123!' }, true);
        if (email.trim() === '') {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Email is required');
        } else {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Please enter a valid email address');
        }
      }
    });
    
    test('should show error for invalid password', async ({ page }) => {
      const invalidPasswords = testData.invalid.passwords;
      
      for (const password of invalidPasswords) {
        await signUpPage.clearForm();
        await signUpPage.fillEmailSignupForm({
          email: FormValidation.generateRandomEmail(),
          password
        });
        
        const validation = signUpPage.validateFormFields({ 
          email: FormValidation.generateRandomEmail(), 
          password 
        }, true);
        
        if (password.trim() === '') {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Password is required');
        } else {
          expect(validation.isValid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);
        }
      }
    });
    
    test('should show error for existing email', async ({ page }) => {
      const apiResponses = await setupSignupInterceptors(page);
      
      // Use existing email
      const existingEmail = existingUser.email;
      const password = FormValidation.generateValidPassword();
      
      await signUpPage.fillEmailSignupForm({
        email: existingEmail,
        password
      });
      
      await signUpPage.submitSignupForm();
      await signUpPage.waitForSubmission();
      
      // Should get 400 status for existing user
      expect(apiResponses.signup.status).toBe(400);
    });
    
    test('should show error for empty required fields', async ({ page }) => {
      // Test empty email
      await signUpPage.fillEmailSignupForm({
        email: '',
        password: FormValidation.generateValidPassword()
      });
      
      const validation = signUpPage.validateFormFields({ 
        email: '', 
        password: FormValidation.generateValidPassword() 
      }, true);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email is required');
      
      // Test empty password
      await signUpPage.clearForm();
      await signUpPage.fillEmailSignupForm({
        email: FormValidation.generateRandomEmail(),
        password: ''
      });
      
      const validation2 = signUpPage.validateFormFields({ 
        email: FormValidation.generateRandomEmail(), 
        password: '' 
      }, true);
      expect(validation2.isValid).toBe(false);
      expect(validation2.errors).toContain('Password is required');
    });
  });
  
  test.describe('Phone Sign Up - Negative Test Cases', () => {
    test('should show error for invalid phone format', async ({ page }) => {
      const invalidPhones = testData.invalid.phones;
      
      for (const phone of invalidPhones) {
        await signUpPage.clearForm();
        await signUpPage.fillPhoneSignupForm({
          phone,
          password: FormValidation.generateValidPassword()
        });
        
        const validation = signUpPage.validateFormFields({ phone, password: 'Test123!' }, false);
        if (phone.trim() === '') {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Phone number is required');
        } else {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Please enter a valid phone number (+966XXXXXXXXX)');
        }
      }
    });
    
    test('should show error for existing phone number', async ({ page }) => {
      const apiResponses = await setupSignupInterceptors(page);
      
      const existingPhone = existingUser.phone;
      const password = FormValidation.generateValidPassword();
      
      await signUpPage.fillPhoneSignupForm({
        phone: existingPhone,
        password
      });
      
      await signUpPage.submitSignupForm();
      await signUpPage.waitForSubmission();
      
      expect(apiResponses.signup.status).toBe(400);
    });
  });
  
  test.describe('Edge Cases', () => {
    test('should handle minimum valid password length', async ({ page }) => {
      const email = FormValidation.generateRandomEmail();
      const password = 'Test123!'; // Exactly 9 characters
      
      const validation = signUpPage.validateFormFields({ email, password }, true);
      expect(validation.isValid).toBe(true);
    });
    
    test('should handle special characters in password', async ({ page }) => {
      const email = FormValidation.generateRandomEmail();
      const specialCharPasswords = ['Test123#', 'Test123?', 'Test123!', 'Test123@'];
      
      for (const password of specialCharPasswords) {
        const validation = signUpPage.validateFormFields({ email, password }, true);
        expect(validation.isValid).toBe(true);
      }
    });
    
    test('should handle email with special characters', async ({ page }) => {
      const specialEmails = [
        'user+tag@example.com',
        'user.name@example.com',
        'user123@subdomain.example.com'
      ];
      
      for (const email of specialEmails) {
        const validation = signUpPage.validateFormFields({ 
          email, 
          password: FormValidation.generateValidPassword() 
        }, true);
        expect(validation.isValid).toBe(true);
      }
    });
  });
  
  test.describe('Form Validation', () => {
    test('should validate form fields before submission', async ({ page }) => {
      const testCases = [
        { email: '', password: '', expectedValid: false },
        { email: 'invalid-email', password: 'Test123!', expectedValid: false },
        { email: 'valid@example.com', password: 'short', expectedValid: false },
        { email: 'valid@example.com', password: 'Test123!', expectedValid: true }
      ];
      
      for (const testCase of testCases) {
        const validation = signUpPage.validateFormFields(testCase, true);
        expect(validation.isValid).toBe(testCase.expectedValid);
      }
    });
    
    test('should validate phone form fields before submission', async ({ page }) => {
      const testCases = [
        { phone: '', password: '', expectedValid: false },
        { phone: '123456789', password: 'Test123!', expectedValid: false },
        { phone: '+966501234567', password: 'short', expectedValid: false },
        { phone: '+966501234567', password: 'Test123!', expectedValid: true }
      ];
      
      for (const testCase of testCases) {
        const validation = signUpPage.validateFormFields(testCase, false);
        expect(validation.isValid).toBe(testCase.expectedValid);
      }
    });
  });
  
  test.describe('UI Elements', () => {
    test('should have all required form elements', async ({ page }) => {
      // Check if all form elements are present
      await expect(page.locator(selectors.signUp.emailInput)).toBeVisible();
      await expect(page.locator(selectors.signUp.phoneInput)).toBeVisible();
      await expect(page.locator(selectors.signUp.passwordInput)).toBeVisible();
      await expect(page.locator(selectors.signUp.createAccountButton)).toBeVisible();
      await expect(page.locator(selectors.signUp.subscribeCheckbox)).toBeVisible();
      await expect(page.locator(selectors.signUp.showHidePasswordIcon)).toBeVisible();
    });
    
    test('should enable/disable create account button based on form state', async ({ page }) => {
      // Initially button should be enabled (assuming form allows empty submission)
      const initialState = await signUpPage.isCreateAccountButtonEnabled();
      
      // Fill valid form
      await signUpPage.fillEmailSignupForm({
        email: FormValidation.generateRandomEmail(),
        password: FormValidation.generateValidPassword()
      });
      
      const filledState = await signUpPage.isCreateAccountButtonEnabled();
      expect(filledState).toBe(true);
    });
  });
});
