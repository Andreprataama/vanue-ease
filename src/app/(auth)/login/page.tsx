import LoginMain from "./_components/Loginmain";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);
  if (session) {
    redirect("/dashboard");
  }
  console.log(session);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginMain />
      </div>
    </div>
  );
}
