import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export const getUser = async () => (await getSession())?.user ?? null;

export const requireUser = async () => {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
};

export const requireAdmin = async () => {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
};

export const isAdmin = (user) => user?.role === "ADMIN";
