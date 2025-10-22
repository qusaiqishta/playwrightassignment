/**
 * Sign Up Tests
 * Comprehensive test cases for user registration functionality
 */

import { test, expect } from '@playwright/test';
import SignUpPage from '../pages/SignUpPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import { setupSignupInterceptors, setupProfileInterceptors, interceptSignUpWithTestCaptcha } from '../utils/apiHelpers.js';
import FormValidation from '../utils/formValidation.js';
import { valid, invalid, existingUser } from '../testData/testData.js';
import selectors, { signUp } from '../testData/selectors.js';
import SignInPage from '../pages/SignInPage.js';
test.describe('Sign Up Tests', () => {
  let signUpPage;
  let profilePage;
  let signInPage
  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    profilePage = new ProfilePage(page);
    signInPage = new SignInPage(page);
    interceptSignUpWithTestCaptcha(page);
    await signUpPage.navigate();
  });
  
  test.describe('Email Sign Up - Positive Test Cases', () => {
    test('should successfully sign up with valid email and password', async ({ page }) => {
      // waiting for form elements for better stability
      await page.waitForSelector(selectors.signUp.createAccountButton, { timeout: 15000 });
      await page.waitForSelector(selectors.signUp.phoneInput, { timeout: 15000 });
      await page.waitForSelector(selectors.signUp.passwordInput, { timeout: 15000 });
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
      
      const authApiResponse = await setupSignupInterceptors(page);
      const profileApiResponse = await setupProfileInterceptors(page);
      // Validate API responses
      expect(authApiResponse.status).toBe(200);
      expect(profileApiResponse.status).toBe(200);
      await page.waitForSelector(selectors.profile.emailInput, { timeout: 15000 });
      // Validate successful signin
      const authValidation = await profilePage.validateSuccessfulAuth(email);
      expect(authValidation.isValid).toBe(true);
    });
    
    test('should successfully sign up with valid email and password without newsletter subscription', async ({ page }) => {
     // waiting for form elements for better stability
     await page.waitForSelector(selectors.signUp.createAccountButton, { timeout: 15000 });
     await page.waitForSelector(selectors.signUp.phoneInput, { timeout: 15000 });
     await page.waitForSelector(selectors.signUp.passwordInput, { timeout: 15000 });
     // Generate test data
     const email = FormValidation.generateRandomEmail();
     const password = FormValidation.generateValidPassword();
     
     // Fill and submit form
     await signUpPage.fillEmailSignupForm({
       email,
       password,
       subscribe: false
     });
     
     // Validate form fields before submission
     const validation = signUpPage.validateFormFields({ email, password }, true);
     expect(validation.isValid).toBe(true);
     
     await signUpPage.submitSignupForm();
     
     const authApiResponse = await setupSignupInterceptors(page);
     const profileApiResponse = await setupProfileInterceptors(page);
     // Validate API responses
     expect(authApiResponse.status).toBe(200);
     expect(profileApiResponse.status).toBe(200);
     await page.waitForSelector(selectors.profile.emailInput, { timeout: 15000 });
     // Validate successful signin
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
      
      const phone = FormValidation.generateRandomPhone();
      const password = FormValidation.generateValidPassword();
      // waiting for form elements for better stability
      await page.waitForSelector(selectors.signUp.createAccountButton, { timeout: 15000 });
      await page.waitForSelector(selectors.signUp.phoneInput, { timeout: 15000 });
      await page.waitForSelector(selectors.signUp.passwordInput, { timeout: 15000 });   
      await signUpPage.fillPhoneSignupForm({
        phone,
        password,
        subscribe: true
      });
      
      // Validate form fields before submission
      const validation = signUpPage.validateFormFields({ phone, password }, false);
      expect(validation.isValid).toBe(true);
      
      await signUpPage.submitSignupForm();
      
      const authApiResponse = await setupSignupInterceptors(page);
      const profileApiResponse = await setupProfileInterceptors(page);
      // Validate API responses
      expect(authApiResponse.status).toBe(200);
      expect(profileApiResponse.status).toBe(200);
      await page.waitForSelector(selectors.profile.emailInput, { timeout: 15000 });
      // Validate successful signin
      const authValidation = await profilePage.validateSuccessfulAuth('+966 '+phone);
      expect(authValidation.isValid).toBe(true);
    });
  });
  
  test.describe('Email Sign Up - Negative Test Cases', () => {
    test('should show error for invalid email format', async ({ page }) => {
      const invalidEmails = invalid.emails;
      await page.click(signUp.emailTab);
      for (const email of invalidEmails) {
        await signUpPage.clearEmailForm();
        await signUpPage.fillEmailSignupForm({
          email,
          password: FormValidation.generateValidPassword()
        });
        await signUpPage.submitSignupForm();
        // Form validation should catch invalid emails
        const validation = signUpPage.validateFormFields({ email, password: 'Test1234!' }, true);
        if (email.trim() === '') {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Email is required');
        } else {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain(selectors.errorMessages.notValidEmailError);
        }
        const emailError = await signInPage.getErrorMessage('email');
        expect(emailError).toContain(selectors.errorMessages.notValidEmailError);
      }
    });
    
    test('should show error for invalid password', async ({ page }) => {
      const invalidPasswords = invalid.passwords;
      await page.click(signUp.emailTab);
      for (const password of invalidPasswords) {
        await signUpPage.clearEmailForm();
        await signUpPage.fillEmailSignupForm({
          email: FormValidation.generateRandomEmail(),
          password
        });
        await signUpPage.submitSignupForm();
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
          const emailError = await signInPage.getErrorMessage('password');
          expect(emailError).toContain(selectors.errorMessages.notValidPassword);
        }
      }
    });
    
    test('should show error for existing email', async ({ page }) => {
      
      // Use existing email
      const existingEmail = existingUser.email;
      const password = FormValidation.generateValidPassword();
      
      await signUpPage.fillEmailSignupForm({
        email: existingEmail,
        password
      });
      
      await signUpPage.submitSignupForm();
      const apiResponses = await setupSignupInterceptors(page);
      
      // Should get 400 status for existing user
      expect(apiResponses.status).toBe(400);
      await expect(page.getByText(selectors.errorMessages.generalSignUpError)).toBeVisible();
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
      await signInPage.submitSigninForm();
      const emailError = await signInPage.getErrorMessage('email');
      expect(emailError).toContain(selectors.errorMessages.emptyEmailError);
      // Test empty password
      await signUpPage.clearEmailForm();
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

      await signInPage.submitSigninForm();
      const passwordError = await signInPage.getErrorMessage('password');
      expect(passwordError).toContain(selectors.errorMessages.emptyPasswordError);
    });
  });
  
  test.describe('Phone Sign Up - Negative Test Cases', () => {
    test('should show error for invalid phone format', async ({ page }) => {
      const invalidPhones = invalid.phones;
      for (const phone of invalidPhones) {
        await signUpPage.clearPhoneForm();
        await signUpPage.fillPhoneSignupForm({
          phone,
          password: FormValidation.generateValidPassword()
        });
        await signInPage.submitSigninForm();
        const validation = signUpPage.validateFormFields({ phone, password: 'Test123!' }, false);
        if (phone.trim() === '') {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Phone number is required');
        } else {
          expect(validation.isValid).toBe(false);
          expect(validation.errors).toContain('Please enter a valid phone number (+966XXXXXXXXX)');
        }
        const emailError = await signInPage.getErrorMessage('phone');
        expect(emailError).toContain(selectors.errorMessages.notValidPhoneNumer);
      }
    });
    
    test('should show error for existing phone number', async ({ page }) => {
      
      const existingPhone = existingUser.phone;
      const password = FormValidation.generateValidPassword();
      
      await signUpPage.fillPhoneSignupForm({
        phone: existingPhone,
        password
      });
      
      await signUpPage.submitSignupForm();
      const apiResponses = await setupSignupInterceptors(page);
      
      expect(apiResponses.status).toBe(400);
      await expect(page.getByText(selectors.errorMessages.generalSignUpPhoneError)).toBeVisible();

    });
  });
  
  test.describe('Edge Cases', () => {
    test('should handle minimum valid password length', async ({ page }) => {
      const email = FormValidation.generateRandomEmail();
      const password = 'qwaszx@1A'; 
      await signUpPage.fillEmailSignupForm({
        email: email,
        password: password
      });
      
      const validation = signUpPage.validateFormFields({ email, password }, true);
      expect(validation.isValid).toBe(true);
      await expect(page.locator(selectors.errorMessages.passwordError)).not.toHaveCSS('color', 'rgb(225, 21, 35)');

    });
    
    test('should handle special characters in password', async ({ page }) => {
      const email = FormValidation.generateRandomEmail();
      const specialCharPasswords = ['Test1234#', 'Test1234?', 'Test1234!', 'Test1234@'];
      
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
        { email: 'valid@example.com', password: 'Test1234!', expectedValid: true }
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
        { phone: '501234567', password: 'Test1234!', expectedValid: true }
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
      await expect(page.locator(selectors.signUp.phoneInput)).toBeVisible();
      await expect(page.locator(selectors.signUp.passwordInput)).toBeVisible();
      await expect(page.locator(selectors.signUp.createAccountButton)).toBeVisible();
      await expect(page.locator(selectors.signUp.subscribeCheckbox)).toBeVisible();
      await expect(page.locator(selectors.signUp.showHidePasswordIcon)).toBeVisible();
      await page.click(signUp.emailTab);
      await expect(page.locator(selectors.signUp.emailInput)).toBeVisible();
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
