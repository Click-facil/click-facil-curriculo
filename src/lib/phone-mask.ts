export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const formatHours = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  return digits ? `${digits}h` : "";
};

export const formatYear = (value: string): string => {
  return value.replace(/\D/g, "").slice(0, 4);
};
