import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "./axios";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
