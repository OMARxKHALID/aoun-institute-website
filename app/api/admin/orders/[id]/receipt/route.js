import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { getUser, isAdmin } from "@/lib/dal";
import { privateDownloadUrl } from "@/lib/cloudinary";
import Order from "@/features/payments/models/order";

export const GET = async (_request, { params }) => {
  if (!isAdmin(await getUser())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  if (!isValidObjectId(id)) return Response.json({ error: "Not found" }, { status: 404 });
  await connectDB();
  const order = await Order.findById(id, "receipt").lean();
  if (!order?.receipt?.publicId) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.redirect(privateDownloadUrl(order.receipt.publicId, order.receipt.format, "receipt"), 302);
};
