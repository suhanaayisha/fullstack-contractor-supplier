const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

const PASSWORD_RULES = [
    { test: (p) => p.length >= 8, message: 'at least 8 characters' },
    { test: (p) => /[a-z]/.test(p), message: 'a lowercase letter' },
    { test: (p) => /[A-Z]/.test(p), message: 'an uppercase letter' },
    { test: (p) => /[0-9]/.test(p), message: 'a number' },
    { test: (p) => /[^A-Za-z0-9]/.test(p), message: 'a special character' },
];

// Returns the list of rules the password fails; empty means it is strong enough.
export const getPasswordErrors = (password) =>
    PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.message);
