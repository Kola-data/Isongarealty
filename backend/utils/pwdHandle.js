import bcrypt from "bcrypt";

// Hash a password
export async function hashPassword(password) {
  const saltRounds = 10; // Higher number = more secure but slower
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// Check if password matches hashed password
export async function checkPassword(password, hashedPassword) {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch; // true or false
}
