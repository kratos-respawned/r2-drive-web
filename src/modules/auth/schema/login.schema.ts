import { z } from "zod"

export const resetPasswordSchema = z.object({
    email: z.email(),
})
export const loginSchema = resetPasswordSchema.extend({

    password: z.string().min(8, "Atleast 8 characters are required"),
})

export const signupSchema = loginSchema.extend({
    confirmPassword: z.string(),
    name: z.string().min(1, "Name is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})


