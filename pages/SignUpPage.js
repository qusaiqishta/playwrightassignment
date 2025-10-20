/**
 * Sign Up Page Object Model
 * Contains all methods and selectors for the sign up page
 */

import selectors from '../testData/selectors.js';
import FormValidation from '../utils/formValidation.js';

class SignUpPage {
  constructor(page) {
    this.page = page;
  }
  
  /**
   * Navigate to sign up page
   */
  async navigate() {
    await this.page.goto(selectors.urls.signUpPage);
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Fill email input field
   * @param {string} email - Email address
   */
  async fillEmail(email) {
    await this.page.fill(selectors.signUp.emailInput, email);
  }
  
  /**
   * Fill phone input field
   * @param {string} phone - Phone number
   */
  async fillPhone(phone) {
    await this.page.fill(selectors.signUp.phoneInput, phone);
  }
  
  /**
   * Fill password input field
   * @param {string} password - Password
   */
  async fillPassword(password) {
    await this.page.fill(selectors.signUp.passwordInput, password);
  }
  
  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility() {
    await this.page.click(selectors.signUp.showHidePasswordIcon);
  }
  
  /**
   * Check or uncheck subscribe checkbox
   * @param {boolean} checked - Whether to check or uncheck
   */
  async setSubscribeCheckbox(checked = true) {
    const checkbox = this.page.locator(selectors.signUp.subscribeCheckbox);
    const isChecked = await checkbox.isChecked();
    
    if (checked !== isChecked) {
      await checkbox.click();
    }
  }
  
  /**
   * Click create account button
   */
  async clickCreateAccount() {
    await this.page.click(selectors.signUp.createAccountButton);
  }
  
  /**
   * Fill signup form with email
   * @param {object} formData - Form data object
   * @param {string} formData.email - Email address
   * @param {string} formData.password - Password
   * @param {boolean} formData.subscribe - Whether to subscribe to newsletter
   */
  async fillEmailSignupForm(formData) {
    await this.fillEmail(formData.email);
    await this.fillPassword(formData.password);
    
    if (formData.subscribe !== undefined) {
      await this.setSubscribeCheckbox(formData.subscribe);
    }
  }
  
  /**
   * Fill signup form with phone
   * @param {object} formData - Form data object
   * @param {string} formData.phone - Phone number
   * @param {string} formData.password - Password
   * @param {boolean} formData.subscribe - Whether to subscribe to newsletter
   */
  async fillPhoneSignupForm(formData) {
    await this.fillPhone(formData.phone);
    await this.fillPassword(formData.password);
    
    if (formData.subscribe !== undefined) {
      await this.setSubscribeCheckbox(formData.subscribe);
    }
  }
  
  /**
   * Submit signup form
   */
  async submitSignupForm() {
    await this.clickCreateAccount();
  }
  
  /**
   * Validate form fields before submission
   * @param {object} formData - Form data object
   * @param {boolean} isEmailSignup - Whether this is email signup
   * @returns {object} - Validation result
   */
  validateFormFields(formData, isEmailSignup = true) {
    return FormValidation.validateSignupForm(formData, isEmailSignup);
  }
  
  /**
   * Get password field type (password or text)
   * @returns {Promise<string>} - Input type
   */
  async getPasswordFieldType() {
    return await this.page.getAttribute(selectors.signUp.passwordInput, 'type');
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
   * Check if create account button is enabled
   * @returns {Promise<boolean>} - True if button is enabled
   */
  async isCreateAccountButtonEnabled() {
    const button = this.page.locator(selectors.signUp.createAccountButton);
    return await button.isEnabled();
  }
  
  /**
   * Get form field values
   * @returns {Promise<object>} - Form field values
   */
  async getFormValues() {
    return {
      email: await this.page.inputValue(selectors.signUp.emailInput),
      phone: await this.page.inputValue(selectors.signUp.phoneInput),
      password: await this.page.inputValue(selectors.signUp.passwordInput),
      subscribe: await this.page.isChecked(selectors.signUp.subscribeCheckbox)
    };
  }
  
  /**
   * Clear all form fields
   */
  async clearForm() {
    await this.page.fill(selectors.signUp.emailInput, '');
    await this.page.fill(selectors.signUp.phoneInput, '');
    await this.page.fill(selectors.signUp.passwordInput, '');
    await this.setSubscribeCheckbox(false);
  }
}

export default SignUpPage;
