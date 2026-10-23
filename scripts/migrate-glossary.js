import { MongoClient } from "mongodb";

const FORMER_STUDENT = "Former student";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

const cancelled = await db.collection("orders").updateMany({ status: "FAILED", note: "Paid by card instead" }, { $set: { status: "CANCELLED" } });
const rejected = await db.collection("orders").updateMany({ status: "FAILED" }, { $set: { status: "REJECTED" } });

const freeCourses = await db
  .collection("courses")
  .find({ $expr: { $eq: [{ $ifNull: ["$discountPrice", "$price"] }, 0] } }, { projection: { _id: 1 } })
  .toArray();
const free = await db.collection("enrollments").updateMany({ source: "manual", courseId: { $in: freeCourses.map((c) => c._id) } }, { $set: { source: "free" } });
const gift = await db.collection("enrollments").updateMany({ source: "manual" }, { $set: { source: "gift" } });

const userIds = (await db.collection("user").find({}, { projection: { _id: 1 } }).toArray()).map((u) => String(u._id));
const former = await db.collection("discussions").updateMany({ userId: { $nin: userIds }, authorName: { $ne: FORMER_STUDENT } }, { $set: { authorName: FORMER_STUDENT } });

console.log(`orders: ${cancelled.modifiedCount} cancelled, ${rejected.modifiedCount} rejected`);
console.log(`enrollments: ${free.modifiedCount} free, ${gift.modifiedCount} gift`);
console.log(`questions: ${former.modifiedCount} by former students`);

await client.close();
