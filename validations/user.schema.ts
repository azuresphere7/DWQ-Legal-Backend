import { isValidPhoneNumber } from "../utils/functions";
import { z } from "zod";

export const RegisterUserSchema = z
  .object({
    firstName: z.string().min(1, "Required"),
    middleName: z.string(),
    lastName: z.string().min(1, "Required"),
    firmName: z.string().min(1, "Required"),
    firmDomain: z.string(),
    email: z.string().min(1, "Required").email({ message: "Email format is invalid" }),
    barState: z.string().min(1, "Required"),
    barNumber: z.string().min(1, "Required").refine(isValidPhoneNumber, { message: "Invalid number" }),
    address1: z.string().min(1, "Required"),
    address2: z.string(),
    city: z.string().min(1, "Required"),
    state: z.string().min(1, "Required"),
    zip: z.string().min(1, "Required"),
    creditNumber: z.string(),
    expireMonth: z.string(),
    expireYear: z.string(),
    creditZip: z.string(),
    creditCode: z.string(),
    creditOwner: z.string(),
    password: z
      .string().min(1, "Required")
      .max(30, "Password must be less than 30 chars")
      .regex(/[A-Z]/, "Must contain at least 1 uppercase")
      .regex(/[a-z]/, "Must contain at least 1 lowercase")
      .regex(/[0-9]/, "Must contain at least 1 number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least 1 special character"),
    confirm: z.string().min(1, "Required")
  })
  .refine(data => data.password === data.confirm, {
    path: ["confirm"],
    message: "Passwords must be match"
  });

export const LoginUserSchema = z
  .object({
    email: z.string().min(1, "Required").email({ message: "Email format is invalid" }),
    password: z.string().min(1, "Required")
  });


export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;