import { z } from "zod";

export const OrderSchema = z
  .object({
    accountCode: z.string().min(1, "Required"),
    type: z.string().min(1, "Required").default("D"),
    state: z.string().min(1, "Required"),
    email: z.string().min(1, "Required"),
    court: z.string().min(1, "Required"),
    causeNumber: z.string().min(1, "Required"),
    plaintiffs: z.array(z.string()).min(1, "Required"),
    defendants: z.array(z.string()).min(1, "Required"),
    phoneNumber: z.string().min(1, "Required"),
    phoneCode: z.string().min(1, "Required"),
    notify: z.boolean().optional()
  });

export type OrderInput = z.infer<typeof OrderSchema>;
