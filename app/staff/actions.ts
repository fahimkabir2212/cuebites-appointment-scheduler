"use server";
import { postPublic } from "@/utils/api/client/post";
import { staffEndpoints } from "@/utils/api/endpoints";
import { revalidatePath } from "next/cache";

export async function createStaff(payload: any) {
  const response = postPublic(staffEndpoints.createStaff, payload);
  revalidatePath("/staff");
  return response;
}
