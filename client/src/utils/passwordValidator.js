export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('At least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('At least 1 uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('At least 1 lowercase letter (a-z)');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('At least 1 number (0-9)');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('At least 1 special character (!@#$%^&*)');
  }

  return errors;
};

export const getPasswordStrength = (password) => {
  const errors = validatePassword(password);
  const total = 5;
  const met = total - errors.length;
  const percentage = Math.round((met / total) * 100);

  if (percentage === 100) return { level: 'Strong', color: '#22c55e', percentage };
  if (percentage >= 60) return { level: 'Medium', color: '#eab308', percentage };
  return { level: 'Weak', color: '#ef4444', percentage };
};