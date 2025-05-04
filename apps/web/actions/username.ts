"use server";

import { revalidatePath } from "next/cache";

export async function checkUsernameAction(username: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_API_URL}/api/username/${username}`,
    );

    if (!response.ok) {
      throw new Error("Failed to check username");
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error checking username:", error);
    throw error;
  }
}

export async function createUsernameAction(username: string) {
  try {
    const response = await fetch(`${process.env.NEXT_API_URL}/api/username`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (data.success) {
      revalidatePath(`/`);
    }

    return data;
  } catch (error) {
    console.error("Error creating username:", error);
    throw error;
  }
}
