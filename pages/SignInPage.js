/**
 * Sign In Page Object Model
 * Contains all methods and selectors for the sign in page
 */

import selectors from '../testData/selectors.js';
import FormValidation from '../utils/formValidation.js';

class SignInPage {
  constructor(page) {
    this.page = page;
  }
  
  /**
   * Navigate to sign in page
   */
  async navigate() {
    await this.page.goto(selectors.urls.signInPage);
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Fill email input field
   * @param {string} email - Email address
   */
  async fillEmail(email) {
    await this.page.fill(selectors.signIn.emailInput, email);
  }
  
  /**
   * Fill phone input field
   * @param {string} phone - Phone number
   */
  async fillPhone(phone) {
    await this.page.fill(selectors.signIn.phoneInput, phone);
  }
  
  /**
   * Fill password input field
   * @param {string} password - Password
   */
  async fillPassword(password) {
    await this.page.fill(selectors.signIn.passwordInput, password);
  }
  
  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility() {
    await this.page.click(selectors.signIn.showHidePasswordIcon);
  }
  
  /**
   * Click sign in button
   */
  async clickSignIn() {
    await this.page.click(selectors.signIn.signInButton);
  }
  
  /**
   * Fill signin form with email
   * @param {object} formData - Form data object
   * @param {string} formData.email - Email address
   * @param {string} formData.password - Password
   */
  async fillEmailSigninForm(formData) {
    await this.fillEmail(formData.email);
    await this.fillPassword(formData.password);
  }
  
  /**
   * Fill signin form with phone
   * @param {object} formData - Form data object
   * @param {string} formData.phone - Phone number
   * @param {string} formData.password - Password
   */
  async fillPhoneSigninForm(formData) {
    await this.fillPhone(formData.phone);
    await this.fillPassword(formData.password);
  }
  
  /**
   * Submit signin form
   */
  async submitSigninForm() {
    await this.clickSignIn();
  }
  
  /**
   * Validate form fields before submission
   * @param {object} formData - Form data object
   * @param {boolean} isEmailSignin - Whether this is email signin
   * @returns {object} - Validation result
   */
  validateFormFields(formData, isEmailSignin = true) {
    return FormValidation.validateSigninForm(formData, isEmailSignin);
  }
  
  /**
   * Get password field type (password or text)
   * @returns {Promise<string>} - Input type
   */
  async getPasswordFieldType() {
    return await this.page.getAttribute(selectors.signIn.passwordInput, 'type');
  }
  
  /**
   * Check if password is visible
   * @returns {Promise<boolean>} - True if password is visible
   */
  async isPasswordVisible() {
    const type = await this.getPasswordFieldType();
    return type === 'text';
  }
  
  /**
   * Get error message text
   * @param {string} field - Field name (email, password, phone)
   * @returns {Promise<string>} - Error message text
   */
  async getErrorMessage(field) {
    const errorSelectors = {
      email: selectors.errorMessages.emailError,
      password: selectors.errorMessages.passwordError,
      phone: selectors.errorMessages.phoneError
    };
    
    const errorElement = this.page.locator(errorSelectors[field]);
    if (await errorElement.isVisible()) {
      return await errorElement.textContent();
    }
    return '';
  }
  
  /**
   * Check if error message is visible
   * @param {string} field - Field name
   * @returns {Promise<boolean>} - True if error is visible
   */
  async hasErrorMessage(field) {
    const errorMessage = await this.getErrorMessage(field);
    return errorMessage.length > 0;
  }
  
  /**
   * Wait for page to load after form submission
   */
  async waitForSubmission() {
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Check if sign in button is enabled
   * @returns {Promise<boolean>} - True if button is enabled
   */
  async isSignInButtonEnabled() {
    const button = this.page.locator(selectors.signIn.signInButton);
    return await button.isEnabled();
  }
  
  /**
   * Get form field values
   * @returns {Promise<object>} - Form field values
   */
  async getFormValues() {
    return {
      email: await this.page.inputValue(selectors.signIn.emailInput),
      phone: await this.page.inputValue(selectors.signIn.phoneInput),
      password: await this.page.inputValue(selectors.signIn.passwordInput)
    };
  }
  
  /**
   * Clear all form fields
   */
  async clearForm() {
    await this.page.fill(selectors.signIn.emailInput, '');
    await this.page.fill(selectors.signIn.phoneInput, '');
    await this.page.fill(selectors.signIn.passwordInput, '');
  }
  
  /**
   * Check if "Remember me" checkbox exists and is clickable
   * @returns {Promise<boolean>} - True if checkbox exists
   */
  async hasRememberMeCheckbox() {
    const checkbox = this.page.locator('input[type="checkbox"][name*="remember"]');
    return await checkbox.isVisible();
  }
  
  /**
   * Check or uncheck "Remember me" checkbox
   * @param {boolean} checked - Whether to check or uncheck
   */
  async setRememberMe(checked = true) {
    const checkbox = this.page.locator('input[type="checkbox"][name*="remember"]');
    if (await checkbox.isVisible()) {
      const isChecked = await checkbox.isChecked();
      if (checked !== isChecked) {
        await checkbox.click();
      }
    }
  }
  
  /**
   * Check if "Forgot password" link exists
   * @returns {Promise<boolean>} - True if link exists
   */
  async hasForgotPasswordLink() {
    const link = this.page.locator('text=Forgot password');
    return await link.isVisible();
  }
  
  /**
   * Click "Forgot password" link
   */
  async clickForgotPassword() {
    const link = this.page.locator('text=Forgot password');
    if (await link.isVisible()) {
      await link.click();
    }
  }
}

export default SignInPage;
