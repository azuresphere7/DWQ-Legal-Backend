import { z } from "zod";

export const JurisdictionSchema = z
  .object({
    jCode: z.string().min(1, "Required").length(2, "Not 2 chars"),
    isActive: z.boolean().default(true),
    nopPeriod: z.number().default(0),
    opPeriod: z.number().default(0),
  });

export type JurisdictionInput = z.infer<typeof JurisdictionSchema>;