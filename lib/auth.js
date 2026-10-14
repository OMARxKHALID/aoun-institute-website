import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { client, db } from "@/lib/db";
import { ac, roles } from "@/lib/permissions";
import { linkEmail, sendEmail } from "@/lib/email";

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, prompt: "select_account" } }
    : {};

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: ({ user, url }) =>
      sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: linkEmail({ title: "Reset your password", text: "Click below to choose a new password. The link expires soon.", url, cta: "Reset password" }),
      }),
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: ({ user, url }) =>
      sendEmail({
        to: user.email,
        subject: "Verify your email",
        html: linkEmail({ title: "Confirm your email", text: "Verify your email address to start learning.", url, cta: "Verify email" }),
      }),
  },
  socialProviders: google,
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: ({ newEmail, url }) =>
        sendEmail({
          to: newEmail,
          subject: "Confirm your new email",
          html: linkEmail({ title: "Confirm email change", text: "Confirm this address to finish changing your email.", url, cta: "Confirm email" }),
        }),
    },
    additionalFields: {
      phone: { type: "string", required: false },
      bio: { type: "string", required: false },
      country: { type: "string", required: false },
      city: { type: "string", required: false },
      birthDate: { type: "date", required: false },
      avatarPublicId: { type: "string", required: false, input: false },
      notifyNewLesson: { type: "boolean", required: false, defaultValue: true, input: false },
      notifyNewQuiz: { type: "boolean", required: false, defaultValue: true, input: false },
      notifyAnnouncement: { type: "boolean", required: false, defaultValue: true, input: false },
      notifyCertificate: { type: "boolean", required: false, defaultValue: true, input: false },
      lastActiveAt: { type: "date", required: false, input: false },
      deletionRequestedAt: { type: "date", required: false, input: false },
    },
  },
  session: { cookieCache: { enabled: true, maxAge: 60 } },
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
  plugins: [
    admin({ ac, roles, defaultRole: "STUDENT", adminRoles: ["ADMIN"], bannedUserMessage: "Your account is blocked. Contact support." }),
    nextCookies(),
  ],
});
