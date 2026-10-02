import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  // No length rules here: they belong to sign-up, and the answer to a
  // wrong password must not depend on its shape.
  password: z.string().min(1).max(4096),
});

export type SignInDto = z.infer<typeof signInSchema>;
