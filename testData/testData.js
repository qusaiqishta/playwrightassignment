/**
 * Test data for almosafer.com testing
 * Contains valid and invalid test data for various scenarios
 */

const testData = {
  // Valid test data
  valid: {
    email: 'testuser' + Date.now() + '@example.com',
    phone: '+966501234567',
    password: 'TestPass123!',
    validEmails: [
      'user1@example.com',
      'user2@test.com',
      'user3@domain.co.uk'
    ],
    validPhones: [
      '+966501234567',
      '+966501234568',
      '+966501234569'
    ],
    validPasswords: [
      'Password123!',
      'TestPass456@',
      'MyPass789#'
    ]
  },
  
  // Invalid test data for negative test cases
  invalid: {
    emails: [
      'invalid-email',
      '@example.com',
      'user@',
      'user@.com',
      'user@domain',
      '',
      'user space@example.com',
      'user@domain..com'
    ],
    phones: [
      '123456789', // Missing country code
      '+966123', // Too short
      '+966123456789012345', // Too long
      'abc123456789', // Contains letters
      '',
      '+966-123-456-789', // Contains dashes
      '966501234567' // Missing +
    ],
    passwords: [
      '12345678', // Only numbers, no letters or special chars
      'password', // Only letters, no numbers or special chars
      'Pass123', // Too short (less than 9 chars)
      'Password', // No numbers or special chars
      '123456789', // No letters or special chars
      'Password!', // No numbers
      'Password123', // No special chars
      '', // Empty
      'Pass1!', // Too short
      'Password123456789!', // Too long (if there's a max limit)
    ]
  },
  
  // Edge cases
  edgeCases: {
    emails: [
      'a@b.co', // Minimum valid email
      'user+tag@example.com', // Email with plus sign
      'user.name@example.com', // Email with dot
      'user123@subdomain.example.com', // Email with subdomain
    ],
    passwords: [
      'Test123!', // Exactly 9 characters
      'A1!bcdefg', // Mixed case, numbers, special chars
      '123456789!', // Numbers and special char
      'Abcdefgh!', // Letters and special char
    ]
  },
  
  // Existing user data (for testing duplicate registration)
  existingUser: {
    email: 'existing@example.com',
    phone: '+966501234500',
    password: 'ExistingPass123!'
  },
  
  // Password requirements
  passwordRequirements: {
    minLength: 9,
    mustContain: {
      letters: true,
      numbers: true,
      specialChars: ['#', '?', '!', '@', '$', '%', '^', '&', '*', '-']
    }
  }
};

export default testData;

// Named exports for specific data
export const { valid, invalid, edgeCases, existingUser, passwordRequirements } = testData;
