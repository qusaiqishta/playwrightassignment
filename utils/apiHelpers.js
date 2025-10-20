/**
 * API helper utilities for intercepting and validating API calls
 * Contains functions to set up API interceptors and validate responses
 */

import selectors from '../testData/selectors.js';

class ApiHelpers {
  
  /**
   * Sets up API interceptors for signup flow
   * @param {Page} page - Playwright page object
   * @returns {Promise<object>} - Object containing intercepted responses
   */
  static async setupSignupInterceptors(page) {
    const responses = {
      signup: null,
      userProfile: null
    };
    
    // Intercept signup API call
    page.route('**/api/myaccount/v4/user/local/signup', async route => {
      const response = await route.fetch();
      responses.signup = {
        status: response.status(),
        body: await response.json().catch(() => null)
      };
      await route.fulfill({ response });
    });
    
    // Intercept user profile API call
    page.route('**/api/myaccount/v4/user/me', async route => {
      const response = await route.fetch();
      responses.userProfile = {
        status: response.status(),
        body: await response.json().catch(() => null)
      };
      await route.fulfill({ response });
    });
    
    return responses;
  }
  
  /**
   * Sets up API interceptors for signin flow
   * @param {Page} page - Playwright page object
   * @returns {Promise<object>} - Object containing intercepted responses
   */
  static async setupSigninInterceptors(page) {
    const responses = {
      signin: null,
      userProfile: null
    };
    
    // Intercept signin API call
    page.route('**/api/myaccount/v3/auth/token', async route => {
      const response = await route.fetch();
      responses.signin = {
        status: response.status(),
        body: await response.json().catch(() => null)
      };
      await route.fulfill({ response });
    });
    
    // Intercept user profile API call
    page.route('**/api/myaccount/v4/user/me', async route => {
      const response = await route.fetch();
      responses.userProfile = {
        status: response.status(),
        body: await response.json().catch(() => null)
      };
      await route.fulfill({ response });
    });
    
    return responses;
  }
  
  /**
   * Sets up API interceptors for logout flow
   * @param {Page} page - Playwright page object
   * @returns {Promise<object>} - Object containing intercepted responses
   */
  static async setupLogoutInterceptors(page) {
    const responses = {
      logout: null
    };
    
    // Intercept logout API call
    page.route('**/api/myaccount/v3/auth/revoke', async route => {
      const response = await route.fetch();
      responses.logout = {
        status: response.status(),
        body: await response.json().catch(() => null)
      };
      await route.fulfill({ response });
    });
    
    return responses;
  }
  
  /**
   * Validates signup API response
   * @param {object} response - API response object
   * @param {boolean} expectSuccess - Whether to expect success or failure
   * @returns {object} - Validation result
   */
  static validateSignupResponse(response, expectSuccess = true) {
    const result = {
      isValid: true,
      errors: []
    };
    
    if (expectSuccess) {
      if (response.status !== 200 && response.status !== 201) {
        result.isValid = false;
        result.errors.push(`Expected success status (200/201), got ${response.status}`);
      }
    } else {
      if (response.status !== 400) {
        result.isValid = false;
        result.errors.push(`Expected error status (400), got ${response.status}`);
      }
    }
    
    return result;
  }
  
  /**
   * Validates signin API response
   * @param {object} response - API response object
   * @param {boolean} expectSuccess - Whether to expect success or failure
   * @returns {object} - Validation result
   */
  static validateSigninResponse(response, expectSuccess = true) {
    const result = {
      isValid: true,
      errors: []
    };
    
    if (expectSuccess) {
      if (response.status !== 200) {
        result.isValid = false;
        result.errors.push(`Expected success status (200), got ${response.status}`);
      }
    } else {
      if (response.status !== 400) {
        result.isValid = false;
        result.errors.push(`Expected error status (400), got ${response.status}`);
      }
    }
    
    return result;
  }
  
  /**
   * Validates logout API response
   * @param {object} response - API response object
   * @returns {object} - Validation result
   */
  static validateLogoutResponse(response) {
    const result = {
      isValid: true,
      errors: []
    };
    
    if (response.status !== 204) {
      result.isValid = false;
      result.errors.push(`Expected logout status (204), got ${response.status}`);
    }
    
    return result;
  }
  
  /**
   * Validates user profile API response
   * @param {object} response - API response object
   * @param {string} expectedEmail - Expected email in response
   * @returns {object} - Validation result
   */
  static validateUserProfileResponse(response, expectedEmail) {
    const result = {
      isValid: true,
      errors: []
    };
    
    if (response.status !== 200) {
      result.isValid = false;
      result.errors.push(`Expected profile status (200), got ${response.status}`);
    }
    
    if (response.body && response.body.email !== expectedEmail) {
      result.isValid = false;
      result.errors.push(`Expected email ${expectedEmail}, got ${response.body.email}`);
    }
    
    return result;
  }
  
  /**
   * Waits for API response with timeout
   * @param {Page} page - Playwright page object
   * @param {string} urlPattern - URL pattern to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<object>} - API response
   */
  static async waitForApiResponse(page, urlPattern, timeout = 10000) {
    try {
      const response = await page.waitForResponse(
        response => response.url().includes(urlPattern),
        { timeout }
      );
      return {
        status: response.status(),
        body: await response.json().catch(() => null)
      };
    } catch (error) {
      throw new Error(`API response timeout for pattern: ${urlPattern}`);
    }
  }
}

export default ApiHelpers;

// Named exports for specific functions
export const setupSignupInterceptors = ApiHelpers.setupSignupInterceptors;
export const setupSigninInterceptors = ApiHelpers.setupSigninInterceptors;
export const setupLogoutInterceptors = ApiHelpers.setupLogoutInterceptors;
