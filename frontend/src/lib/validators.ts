const USERNAME_REGEX = /^[A-Za-z0-9_]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUsername(username: string): string | null {
  if (username.length < 3 || username.length > 255) return "Username must be 3-255 characters";
  if (!USERNAME_REGEX.test(username)) return "Username can only use letters, numbers, underscore";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 128) return "Password must be 8-128 characters";
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email) return null;
  if (!EMAIL_REGEX.test(email)) return "Email is invalid";
  return null;
}

export function validateTodoTitle(title: string): string | null {
  if (!title.trim()) return "Title is required";
  if (title.length > 200) return "Title must be at most 200 characters";
  return null;
}
