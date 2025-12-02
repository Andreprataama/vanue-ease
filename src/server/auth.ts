"use server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const signInAction = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,

      message: "Login successful",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,

      message: e.message || "Login failed",
    };
  }
};

const signUpAction = async (
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    return {
      success: true,

      message: "Registration successful",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,

      message: e.message || "Registration failed",
    };
  }
};

const signOutAction = async () => {
  await auth.api.signOut();

  redirect("/login");
};

export { signInAction, signUpAction, signOutAction };
