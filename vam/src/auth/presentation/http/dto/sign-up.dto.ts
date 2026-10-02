import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  name: z.string().trim().min(1).max(100),
  // scrypt caps input at 4 KiB; 128 characters is plenty for a passphrase.
  password: z.string().min(8).max(128),
});

export type SignUpDto = z.infer<typeof signUpSchema>;
