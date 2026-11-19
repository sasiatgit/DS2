export type Enquiry = {
  name: string;
  email: string;
  subject: string;
  message: string;
  business: string;
  phone: string;
};
export type FieldErrors = Partial<Record<keyof Enquiry, string>>;
export const isEmail = (value: string) =>
  value.length <= 254 && /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(value);

export function validateEnquiry(
  value: unknown,
): { ok: true; data: Enquiry } | { ok: false; errors: FieldErrors } {
  const input =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const errors: FieldErrors = {};
  const read = (
    key: keyof Enquiry,
    min: number,
    max: number,
    multiline = false,
  ) => {
    const raw = input[key];
    if (raw !== undefined && typeof raw !== "string") {
      errors[key] = "Please enter text.";
      return "";
    }
    const text = (typeof raw === "string" ? raw : "").trim();
    if (text.length < min || text.length > max)
      errors[key] = `Use ${min}–${max} characters.`;
    if (
      (multiline ? /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/ : /[\x00-\x1f\x7f]/).test(
        text,
      )
    )
      errors[key] = "Please remove unsupported control characters.";
    return text;
  };
  const data: Enquiry = {
    name: read("name", 2, 100),
    email: read("email", 3, 254).toLowerCase(),
    subject: read("subject", 3, 150),
    message: read("message", 10, 5000, true),
    business: read("business", 0, 150),
    phone: read("phone", 0, 40),
  };
  if (!isEmail(data.email)) errors.email = "Enter a valid email address.";
  if (data.phone && !/^[+\d\s().-]{6,40}$/.test(data.phone))
    errors.phone = "Enter a valid phone number, including country code.";
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, data };
}
