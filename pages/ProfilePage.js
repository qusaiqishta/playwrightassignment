/**
 * Profile Page Object Model
 * Contains all methods and selectors for the profile page
 */

import selectors from '../testData/selectors.js';

class ProfilePage {
  constructor(page) {
    this.page = page;
  }
  
  /**
   * Navigate to profile page
   */
  async navigate() {
    await this.page.goto(selectors.urls.profilePage);
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Wait for profile page to load
   */
  async waitForLoad() {
    await this.page.waitForURL(selectors.urls.profilePage);
    await this.page.waitForLoadState('networkidle');
  }
  
  /**
   * Get displayed email from profile page
   * @returns {Promise<string>} - Displayed email
   */
  async getDisplayedEmail() {
    const emailElement = this.page.locator(selectors.profile.emailDisplay);
    if (await emailElement.isVisible()) {
      return await emailElement.textContent();
    }
    return '';
  }
  
  /**
   * Get email from input field
   * @returns {Promise<string>} - Email from input field
   */
  async getEmailFromInput() {
    const emailInput = this.page.locator(selectors.profile.emailInput);
    if (await emailInput.isVisible()) {
      return await emailInput.inputValue();
    }
    return '';
  }
  
  /**
   * Check if verify account button is visible
   * @returns {Promise<boolean>} - True if button is visible
   */
  async isProfileButtonVisible() {
    const button = this.page.locator(selectors.profile.profileButton).first();;
    return await button.isVisible();
  }
  
  /**
   * Click verify account button
   */
  async clickVerifyAccount() {
    const button = this.page.locator(selectors.profile.verifyAccountButton);
    if (await button.isVisible()) {
      await button.click();
    }
  }
  
  /**
   * Check if logout button is visible
   * @returns {Promise<boolean>} - True if button is visible
   */
  async isLogoutButtonVisible() {
    const button = this.page.locator(selectors.logoutButton);
    return await button.isVisible();
  }
  
  /**
   * Click logout button
   */
  async clickLogout() {
    const button = this.page.locator(selectors.logoutButton);
    if (await button.isVisible()) {
      await this.page.waitForTimeout(2000);
      await button.click();
    }
  }
  
  /**
   * Wait for logout to complete and redirect to sign in page
   */
  async waitForLogout() {
    await this.page.waitForSelector(selectors.signIn.emailTab, { timeout: 15000 });
  }
  
  /**
   * Validate successful signup/signin
   * @param {string} expectedEmail - Expected email address
   * @returns {Promise<object>} - Validation result
   */
  async validateSuccessfulAuth(expectedEmail) {
    const result = {
      isValid: true,
      errors: []
    };
    await this.page.waitForSelector(selectors.profile.profileButton, { timeout: 15000 });
    // Check if redirected to profile page
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/myaccount/profile')) {
      result.isValid = false;
      result.errors.push(`Expected to be on profile page, current URL: ${currentUrl}`);
    }
    
    // Check if email is displayed correctly
    const displayedEmail = await this.getDisplayedEmail();
    if (displayedEmail && displayedEmail.trim() !== expectedEmail.trim()) {
      result.isValid = false;
      result.errors.push(`Expected email ${expectedEmail}, got ${displayedEmail}`);
    }
    
    // Check if email is in input field
    const inputEmail = await this.getEmailFromInput();
    if (inputEmail && inputEmail.trim() !== expectedEmail.trim()) {
      result.isValid = false;
      result.errors.push(`Expected email in input ${expectedEmail}, got ${inputEmail}`);
    }
    
    // Check if verify account button is visible
    const profileSection = await this.isProfileButtonVisible();
    if (!profileSection) {
      result.isValid = false;
      result.errors.push('Verify account button is not visible');
    }
    
    // Check if logout button is visible
    const logoutButtonVisible = await this.isLogoutButtonVisible();
    if (!logoutButtonVisible) {
      result.isValid = false;
      result.errors.push('Logout button is not visible');
    }
    
    return result;
  }
  
  /**
   * Get user profile information
   * @returns {Promise<object>} - User profile data
   */
  async getProfileInfo() {
    return {
      displayedEmail: await this.getDisplayedEmail(),
      inputEmail: await this.getEmailFromInput(),
      verifyButtonVisible: await this.isVerifyAccountButtonVisible(),
      logoutButtonVisible: await this.isLogoutButtonVisible()
    };
  }
  
  /**
   * Check if profile page is loaded
   * @returns {Promise<boolean>} - True if profile page is loaded
   */
  async isProfilePageLoaded() {
    const currentUrl = this.page.url();
    return currentUrl.includes('/myaccount/profile');
  }
  
  /**
   * Get page title
   * @returns {Promise<string>} - Page title
   */
  async getPageTitle() {
    return await this.page.title();
  }
  
  /**
   * Check if any error messages are displayed
   * @returns {Promise<boolean>} - True if error messages are visible
   */
  async hasErrorMessages() {
    const errorSelectors = [
      '[data-testid*="error"]',
      '.error',
      '.alert-danger',
      '[class*="error"]'
    ];
    
    for (const selector of errorSelectors) {
      const errorElement = this.page.locator(selector);
      if (await errorElement.isVisible()) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get all visible error messages
   * @returns {Promise<array>} - Array of error messages
   */
  async getErrorMessages() {
    const errorMessages = [];
    const errorSelectors = [
      '[data-testid*="error"]',
      '.error',
      '.alert-danger',
      '[class*="error"]'
    ];
    
    for (const selector of errorSelectors) {
      const errorElements = this.page.locator(selector);
      const count = await errorElements.count();
      
      for (let i = 0; i < count; i++) {
        const element = errorElements.nth(i);
        if (await element.isVisible()) {
          const text = await element.textContent();
          if (text && text.trim()) {
            errorMessages.push(text.trim());
          }
        }
      }
    }
    
    return errorMessages;
  }
}

export default ProfilePage;
