"use server";

import { headers } from "next/headers";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { fail, parse } from "@/lib/validate";
import { destroyAsset, verifyUpload } from "@/lib/cloudinary";
import { notificationsSchema, profileSchema } from "@/features/profile/schemas";

const users = () => db.collection("user");

export const updateProfile = async (input) => {
  const user = await requireUser();
  const result = parse(profileSchema, input);
  if (!result.ok) return result;
  const { birthDate, name, ...rest } = result.data;
  await users().updateOne({ _id: new Types.ObjectId(user.id) }, { $set: { ...rest, birthDate: birthDate ? new Date(birthDate) : null, updatedAt: new Date() } });
  await auth.api.updateUser({ headers: await headers(), body: { name } });
  return { ok: true };
};

export const updateAvatar = async (input) => {
  const user = await requireUser();
  const publicId = input?.publicId;
  if (publicId) {
    const check = await verifyUpload("avatar", publicId);
    if (!check.ok) return fail(check.error, "avatar");
    await users().updateOne({ _id: new Types.ObjectId(user.id) }, { $set: { avatarPublicId: check.asset.publicId } });
    await auth.api.updateUser({ headers: await headers(), body: { image: check.asset.url } });
  } else {
    await users().updateOne({ _id: new Types.ObjectId(user.id) }, { $set: { avatarPublicId: null } });
    await auth.api.updateUser({ headers: await headers(), body: { image: null } });
  }
  if (user.avatarPublicId && user.avatarPublicId !== publicId) await destroyAsset(user.avatarPublicId, "avatar");
  return { ok: true };
};

export const updateNotifications = async (input) => {
  const user = await requireUser();
  const result = parse(notificationsSchema, input);
  if (!result.ok) return result;
  await users().updateOne({ _id: new Types.ObjectId(user.id) }, { $set: { ...result.data, updatedAt: new Date() } });
  return { ok: true };
};

export const requestAccountDeletion = async () => {
  const user = await requireUser();
  await users().updateOne({ _id: new Types.ObjectId(user.id) }, { $set: { deletionRequestedAt: new Date() } });
  return { ok: true };
};
