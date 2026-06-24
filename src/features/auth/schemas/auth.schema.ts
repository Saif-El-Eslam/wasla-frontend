import { z } from 'zod';
import { fieldValidations } from '@/components/ui/form-validation';

export const loginSchema = z.object({
  phone: fieldValidations.egyptPhone(),
  password: fieldValidations.password(),
});

export const registerSchema = loginSchema.extend({
  name: fieldValidations.name(),
});

export const verifyOtpSchema = z.object({
  phone: fieldValidations.egyptPhone(),
  code: fieldValidations.otp(),
});

export const authPanelSchema = z.discriminatedUnion('mode', [
  loginSchema.extend({ mode: z.literal('login') }),
  registerSchema.extend({ mode: z.literal('register') }),
  verifyOtpSchema.extend({ mode: z.literal('verify') }),
]);

export type LoginFormInput = z.input<typeof loginSchema>;
export type LoginFormValues = z.output<typeof loginSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterFormValues = z.output<typeof registerSchema>;
export type VerifyOtpFormInput = z.input<typeof verifyOtpSchema>;
export type VerifyOtpFormValues = z.output<typeof verifyOtpSchema>;
export type AuthPanelFormInput = z.input<typeof authPanelSchema>;
export type AuthPanelFormValues = z.output<typeof authPanelSchema>;
