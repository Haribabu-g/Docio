import { currentUser } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { db } from "@/lib/prisma";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    let loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
      include: {
        transactions: {
          where: {
            type: "CREDIT_PURCHASE",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!loggedInUser) {
      const name = `${user.firstName} ${user.lastName}`;
      loggedInUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0].emailAddress,
          transactions: {
            create: {
              type: "CREDIT_PURCHASE",
              packageId: "free_user",
              amount: 2,
            },
          },
        },
      });
    }

    // ✅ Sync to Clerk
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        role: loggedInUser.role,
        credits: loggedInUser.credits,
      },
    });




    return loggedInUser;
  } catch (error) {
    console.log("Error in checkUser:", error.message);
    return null;
  }
};
