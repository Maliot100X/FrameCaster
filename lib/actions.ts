"use server";

import neynarClient from "@/lib/neynar";

export async function getUserInfo(fid: number) {
  try {
    const user = await neynarClient.fetchBulkUsers([fid]);
    if (user.users && user.users.length > 0) {
      return user.users[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}
