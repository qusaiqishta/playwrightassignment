/**
 * Form validation utilities for almosafer.com testing
 * Contains functions to validate form inputs and requirements
 */

import testData from '../testData/testData.js';

class FormValidation {
  
  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validates phone number format (Saudi format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  static isValidPhone(phone) {
    const phoneRegex =  /^[0-9]{9}$/;
    return phoneRegex.test(phone);
  }
  
  /**
   * Validates password according to requirements
   * @param {string} password - Password to validate
   * @returns {object} - Validation result with details
   */
  static validatePassword(password) {
    const requirements = testData.passwordRequirements;
    const result = {
      isValid: true,
      errors: []
    };
    
    // Check minimum length
    if (password.length < requirements.minLength) {
      result.isValid = false;
      result.errors.push(`Password must be at least ${requirements.minLength} characters long`);
    }
    
    // Check for letters
    if (!/[a-zA-Z]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must include letters');
    }
    
    // Check for numbers
    if (!/[0-9]/.test(password)) {
      result.isValid = false;
      result.errors.push('Password must include numbers');
    }
    
    // Check for special characters
    const specialCharsRegex = new RegExp(`[${requirements.mustContain.specialChars.join('\\')}]`);
    if (!specialCharsRegex.test(password)) {
      result.isValid = false;
      result.errors.push('Password must include at least one special character (# ? ! @ $ % ^ & * -)');
    }
    
    return result;
  }
  
  /**
   * Validates signup form fields before submission
   * @param {object} formData - Form data object
   * @param {string} formData.email - Email address
   * @param {string} formData.password - Password
   * @param {string} formData.phone - Phone number (optional for email signup)
   * @param {boolean} isEmailSignup - Whether this is email signup or phone signup
   * @returns {object} - Validation result
   */
  static validateSignupForm(formData, isEmailSignup = true) {
    const result = {
      isValid: true,
      errors: []
    };
    
    if (isEmailSignup) {
      // Validate email
      if (!formData.email || formData.email.trim() === '') {
        result.isValid = false;
        result.errors.push('Email is required');
      } else if (!this.isValidEmail(formData.email)) {
        result.isValid = false;
        result.errors.push('Please enter a valid email address');
      }
    } else {
      // Validate phone
      if (!formData.phone || formData.phone.trim() === '') {
        result.isValid = false;
        result.errors.push('Phone number is required');
      } else if (!this.isValidPhone(formData.phone)) {
        result.isValid = false;
        result.errors.push('Please enter a valid phone number (+966XXXXXXXXX)');
      }
    }
    
    // Validate password
    if (!formData.password || formData.password.trim() === '') {
      result.isValid = false;
      result.errors.push('Password is required');
    } else {
      const passwordValidation = this.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        result.isValid = false;
        result.errors.push(...passwordValidation.errors);
      }
    }
    
    return result;
  }
  
  /**
   * Validates signin form fields
   * @param {object} formData - Form data object
   * @param {string} formData.email - Email or phone
   * @param {string} formData.password - Password
   * @param {boolean} isEmailSignin - Whether this is email signin or phone signin
   * @returns {object} - Validation result
   */
  static validateSigninForm(formData, isEmailSignin = true) {
    const result = {
      isValid: true,
      errors: []
    };
    
    if (isEmailSignin) {
      // Validate email
      if (!formData.email || formData.email.trim() === '') {
        result.isValid = false;
        result.errors.push('Please enter your email address');
      } else if (!this.isValidEmail(formData.email)) {
        result.isValid = false;
        result.errors.push('Please enter a valid email address');
      }
    } else {
      // Validate phone
      if (!formData.phone || formData.phone.trim() === '') {
        result.isValid = false;
        result.errors.push('Phone number is required');
      } else if (!this.isValidPhone(formData.phone)) {
        result.isValid = false;
        result.errors.push('Please enter a valid mobile number');
      }
    }
    
    // Validate password
    if (!formData.password || formData.password.trim() === '') {
      result.isValid = false;
      result.errors.push('Please enter your password');
    }
    
    return result;
  }
  
  /**
   * Generates a random valid email for testing
   * @returns {string} - Random valid email
   */
  static generateRandomEmail() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `testuser${timestamp}${random}@example.com`;
  }
  
  /**
   * Generates a random valid phone number for testing
   * @returns {string} - Random valid phone number
   */
  static generateRandomPhone() {
    const random = Math.floor(Math.random() * 1000000000);
    return `+966${random.toString().padStart(9, '0')}`;
  }
  
  /**
   * Generates a valid password for testing
   * @returns {string} - Valid password
   */
  static generateValidPassword() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '#?!@$%^&*-';
    
    let password = '';
    
    // Add at least one letter
    password += letters[Math.floor(Math.random() * letters.length)];
    
    // Add at least one number
    password += numbers[Math.floor(Math.random() * numbers.length)];
    
    // Add at least one special character
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill the rest to meet minimum length requirement
    const remainingLength = 9 - password.length;
    for (let i = 0; i < remainingLength; i++) {
      const allChars = letters + numbers;
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

export default FormValidation;
