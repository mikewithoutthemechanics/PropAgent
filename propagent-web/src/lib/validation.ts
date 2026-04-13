export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Invalid email format';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return 'Phone is required';
  const re = /^(\+27|0)[6-8][0-9]{8}$/;
  if (!re.test(phone.replace(/\s/g, ''))) return 'Invalid SA phone format (e.g., +27827686661)';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export function validateRequired(value: string, field: string): string | null {
  if (!value.trim()) return `${field} is required`;
  return null;
}

export function validateForm(fields: Record<string, string>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const [field, value] of Object.entries(fields)) {
    let error: string | null = null;
    
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      default:
        error = validateRequired(value, field.charAt(0).toUpperCase() + field.slice(1));
    }
    
    if (error) errors.push({ field, message: error });
  }
  
  return errors;
}