/**
 * Converts a snake_case or SCREAMING_SNAKE_CASE key to camelCase
 * Example: AUTH_INCORRECT_PASSWORD -> authIncorrectPassword
 * @param {string} key - The key to format
 * @returns {string} - The formatted key in camelCase
 */
export const formattedKey = (key) => {
  return key.toLowerCase()
    .split('_')
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
};