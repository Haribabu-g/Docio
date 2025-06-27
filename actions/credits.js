"use server";

import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { _success } from "zod/v4/core";

const PLAN_CREDITS = {
    free_user: 0, // Basic plan: 2 credits
    standard: 10, // Standard plan: 10 credits per month
    premium: 24, // Premium plan: 24 credits per month
};

// Each appointment costs 2 credits
const APPOINTMENT_CREDIT_COST = 2;

export async function checkAndAllocateCredits(user) {

    try {
        if (!user) {
            return null;
        }

        if (user.role !== "PATIENT") {
            return user;
        }

        const { has } = await auth();

        const hasBasic = has({ plan: "free_user" })
        const hasStandard = has({ plan: "standard" });
        const hasPremium = has({ plan: "premium" });

        let currentPlan = null;
        let creditsToAllocate = 0;

        if (hasPremium) {
            currentPlan = "premium";
            creditsToAllocate = PLAN_CREDITS.premium;
        } else if (hasStandard) {
            currentPlan = "standard";
            creditsToAllocate = PLAN_CREDITS.standard;
        } else if (hasBasic) {
            currentPlan = "free_user";
            creditsToAllocate = PLAN_CREDITS.free_user;
        }

        // If user doesn't have any plan, just return the user
        if (!currentPlan) {
            return user;
        }

        const currentMonth = format(new Date(), "yyyy-MM");

        // If there's a transaction this month, check if it's for the same plan
        if (user.transactions.length > 0) {
            const latestTransaction = user.transactions[0];
            const transactionMonth = format(
                new Date(latestTransaction.createdAt),
                "yyyy-MM"
            );
            const transactionPlan = latestTransaction.packageId;

            // If we already allocated credits for this month and the plan is the same, just return
            if (
                transactionMonth === currentMonth &&
                transactionPlan === currentPlan
            ) {
                return user;
            }
        }

        // Allocate credits and create transaction record
        const updatedUser = await db.$transaction(async (tx) => {
            // Create transaction record
            await tx.creditTransaction.create({
                data: {
                    userId: user.id,
                    amount: creditsToAllocate,
                    type: "CREDIT_PURCHASE",
                    packageId: currentPlan,
                },
            });

            // Update user's credit balance
            const updatedUser = await tx.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    credits: {
                        increment: creditsToAllocate,
                    },
                },
            });

            return updatedUser;
        });

        // Revalidate relevant paths to reflect updated credit balance
       

        return updatedUser;
    } catch (error) {
        console.error(
            "Failed to check subscription and allocate credits:",
            error.message
        );
        return null;
    }
}


export async function deductCreditsForAppointment(userId, doctorId) {
    try {
        const user = await db.user.findUnique({
            
                where: {
                    id: userId
                },
            });

            const doctor = await db.user.findUnique({
                where: {
                    id: doctorId
                },
            });

            if(user.credits < APPOINTMENT_CREDIT_COST){
                    throw new Error("Insufficient credits to book an appointment");
                    return;
            }

            if(!doctor){
                throw new Error("Doctor not found");
            }
// create tranc record for patient(deduction)
           const result = await db.$transaction(async (tx)=>{
                await tx.creditTransaction.create({
                    data:{
                        userId: user.id,
                        amount: -APPOINTMENT_CREDIT_COST,
                        type: "APPOINTMENT_DEDUCTION",
                    },
            });


        
        // create tranc record for doctor(addition)
        await tx.creditTransaction.create({
            data:{
                userId: doctor.id,
                amount: APPOINTMENT_CREDIT_COST,
                type: "APPOINTMENT_DEDUCTION",
            },
        });

//update patient credit bal (decrement)

        const updatedUser = await tx.user.update({
            where:{
                id: user.id,
            },
            data:{
                credits:{
                    decrement: APPOINTMENT_CREDIT_COST,
                },
            },
        });

        //update doc`s credit  bal(increment)

        await tx.user.update({
            where: {
                id: doctor.id,
            },
            data:{
                credits:{
                    increment: APPOINTMENT_CREDIT_COST,
                },
            },
        });



        return updatedUser;

        });



return { success: true , user: result};
    }
    catch (error) {
            return {success: false , error: error.message};
        }
    }


