"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { signInAction } from "@/server/auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export function LoginForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { success, message } = await signInAction(
      values.email,
      values.password
    );
    if (success) {
      toast.success(message as string);
      router.push("/dashboard");
    } else {
      toast.error(message as string);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center font-semibold text-2xl">
          Vanue Ease
        </CardTitle>
        <CardDescription className="text-center">
          Akses Dashboard Partner Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <Link
                    className="text-sm w-full text-end"
                    href="/forget-password"
                  >
                    Lupa Password?
                  </Link>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Login
            </Button>
            <FormDescription className="text-center">
              Belum Punya Akun?{" "}
              <Link className="font-semibold text-black " href="/register">
                Daftar sekarang
              </Link>
            </FormDescription>
            <FormDescription className="text-center text-[10px]">
              © 2025 Venue Ease. Hak Cipta Dilindungi.
            </FormDescription>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
