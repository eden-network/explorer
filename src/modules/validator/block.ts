export const validate = (str) => {
  if (typeof str !== 'string') return false; // we only process strings!
  return /^\d{1,9}$/.test(str);
};
