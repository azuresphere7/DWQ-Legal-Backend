import { z } from "zod";

export const NotificationSchema = z
  .object({
    email: z.string().min(1, "Email is required."),
    title: z.string().min(1, "Title is required."),
    content: z.string().min(1, "Content is required."),
    isRead: z.boolean().default(false)
  });

export type NotificationInput = z.infer<typeof NotificationSchema>;