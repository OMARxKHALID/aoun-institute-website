import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const getSession = cache(async () => {
  await connection();
  return auth.api.getSession({ headers: await headers() });
});

export const getUser = async () => (await getSession())?.user ?? null;

export const requireUser = async () => {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
};

export const requireAdmin = async () => {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect(user.role === "TEACHER" ? "/admin/courses" : "/dashboard");
  return user;
};

export const isAdmin = (user) => user?.role === "ADMIN";

export const isTeacher = (user) => user?.role === "TEACHER";

export const isStaff = (user) => isAdmin(user) || isTeacher(user);

export const requireStaff = async () => {
  const user = await requireUser();
  if (!isStaff(user)) redirect("/dashboard");
  return user;
};
