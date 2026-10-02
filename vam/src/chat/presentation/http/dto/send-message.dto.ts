import { z } from 'zod';

export const sendMessageSchema = z.object({
  // Same limit as the web app's message box.
  message: z.string().trim().min(1).max(4000),
  // Checked against CHAT_MODELS by the use case; the default when missing.
  model: z.string().trim().min(1).max(100).optional(),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
