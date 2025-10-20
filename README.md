
A comprehensive Playwright-based testing framework for the almosafer.com web application, following the Page Object Model (POM) pattern.

## 🚀 Features

- **Complete Authentication Flow Testing**: Sign up, sign in, and logout functionality
- **Page Object Model**: Clean separation of test logic, page objects, and utilities
- **Comprehensive Test Coverage**: Positive, negative, and edge case scenarios
- **API Interception**: Validates API responses and status codes
- **Form Validation**: Client-side and server-side validation testing
- **Real User Simulation**: Mimics actual user behavior patterns

## 📁 Project Structure

```
playWrightAssignment/
├── tests/                    # Test files
│   ├── signup.spec.js       # Sign up test cases
│   ├── signin.spec.js       # Sign in test cases
│   ├── logout.spec.js       # Logout test cases
│   └── auth-flow.spec.js    # Complete authentication flow tests
├── pages/                   # Page Object Models
│   ├── SignUpPage.js        # Sign up page object
│   ├── SignInPage.js        # Sign in page object
│   └── ProfilePage.js       # Profile page object
├── utils/                   # Utility functions
│   ├── formValidation.js    # Form validation utilities
│   └── apiHelpers.js        # API interception helpers
├── testData/                # Test data and selectors
│   ├── selectors.js         # CSS selectors and locators
│   └── testData.js          # Test data for various scenarios
├── package.json             # Project dependencies
├── playwright.config.js     # Playwright configuration
└── README.md               # This file
```

## 🛠️ Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Playwright Browsers**
   ```bash
   npx playwright install
   ```

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Headed Mode (with browser UI)
```bash
npm run test:headed
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Specific Test Files
```bash
# Run only signup tests
npx playwright test tests/signup.spec.js

# Run only signin tests
npx playwright test tests/signin.spec.js

# Run only logout tests
npx playwright test tests/logout.spec.js

# Run complete authentication flow
npx playwright test tests/auth-flow.spec.js
```

### Generate Test Report
```bash
npm run test:report
```

## 📋 Test Coverage

### Sign Up Tests (`signup.spec.js`)
- ✅ **Email Sign Up - Positive Cases**
  - Successful registration with valid email and password
  - Registration with newsletter subscription toggle
  - Password visibility toggle functionality

- ✅ **Phone Sign Up - Positive Cases**
  - Successful registration with valid phone number and password

- ✅ **Email Sign Up - Negative Cases**
  - Invalid email format validation
  - Invalid password validation
  - Existing email registration attempt
  - Empty required fields validation

- ✅ **Phone Sign Up - Negative Cases**
  - Invalid phone format validation
  - Existing phone number registration attempt

- ✅ **Edge Cases**
  - Minimum valid password length (9 characters)
  - Special characters in password
  - Email with special characters

- ✅ **Form Validation**
  - Client-side validation before submission
  - Password requirements validation

### Sign In Tests (`signin.spec.js`)
- ✅ **Email Sign In - Positive Cases**
  - Successful sign in with valid credentials
  - Password visibility toggle functionality

- ✅ **Phone Sign In - Positive Cases**
  - Successful sign in with phone number

- ✅ **Email Sign In - Negative Cases**
  - Invalid email format
  - Non-existing email
  - Wrong password
  - Empty required fields
  - Case-sensitive email validation

- ✅ **Phone Sign In - Negative Cases**
  - Invalid phone format
  - Non-existing phone number
  - Wrong password with phone

- ✅ **Security Tests**
  - Password not exposed after submission
  - Multiple failed login attempts handling

### Logout Tests (`logout.spec.js`)
- ✅ **Successful Logout**
  - Logout from profile page
  - Redirect to sign in page after logout
  - Logout with different sign in methods

- ✅ **Logout Button Visibility**
  - Button visibility based on authentication state
  - Button hidden after logout

- ✅ **API Validation**
  - Logout API response status code validation (204)
  - API timeout handling

- ✅ **Session Management**
  - Session clearing after logout
  - Protected page access prevention

### Complete Authentication Flow (`auth-flow.spec.js`)
- ✅ **End-to-End User Journey**
  - Complete sign up → sign in → logout flow
  - Phone number registration flow
  - Error handling and recovery

- ✅ **Session Persistence**
  - Multiple page refreshes after sign in
  - Session maintenance across page loads

- ✅ **Cross-Page Validation**
  - Form validation consistency
  - Password visibility toggle across forms
  - API response validation

## 🔧 Configuration

### Playwright Configuration (`playwright.config.js`)
- **Browser**: Chrome (configurable)
- **Base URL**: https://www.almosafer.com
- **Viewport**: 1280x720
- **Screenshots**: On failure
- **Video**: Retain on failure
- **Trace**: On first retry

### Test Data (`testData/testData.js`)
- Valid and invalid test data for all scenarios
- Password requirements validation
- Edge case data sets
- Existing user data for negative testing

## 🎯 Key Features

### Form Validation
- **Email Validation**: RFC-compliant email format checking
- **Phone Validation**: Saudi phone number format (+966XXXXXXXXX)
- **Password Validation**: 
  - Minimum 9 characters
  - Must include letters and numbers
  - Must include special characters (# ? ! @ $ % ^ & * -)

### API Interception
- **Sign Up API**: `POST /api/myaccount/v4/user/local/signup`
- **Sign In API**: `POST /api/myaccount/v3/auth/token`
- **User Profile API**: `GET /api/myaccount/v4/user/me`
- **Logout API**: `POST /api/myaccount/v3/auth/revoke`

### Page Object Model
- **SignUpPage**: Handles all sign up form interactions
- **SignInPage**: Manages sign in form functionality
- **ProfilePage**: Controls profile page and logout operations

## 🐛 Error Handling

The framework includes comprehensive error handling for:
- Network timeouts
- API failures
- Form validation errors
- Page load failures
- Element not found scenarios

## 📊 Test Reports

After running tests, you can view detailed reports:
- HTML report with screenshots and videos
- Test execution timeline
- Failed test details with error messages
- API response validation results

## 🔍 Debugging

### Debug Mode
```bash
npm run test:debug
```

### Specific Test Debugging
```bash
npx playwright test tests/signup.spec.js --debug
```

### Browser Console Logs
All tests include console logging for debugging API responses and form validation.

## 📝 Notes

- Tests are designed to run against the live almosafer.com website
- Some tests may require existing user accounts for negative testing
- API responses are intercepted and validated for proper status codes
- All form validations are tested both client-side and server-side
- Password visibility toggle is tested across all forms
- Newsletter subscription checkbox is included in sign up tests

## 🤝 Contributing

When adding new tests:
1. Follow the existing POM pattern
2. Add appropriate test data to `testData/testData.js`
3. Update selectors in `testData/selectors.js` if needed
4. Include both positive and negative test cases
5. Add API validation where applicable
