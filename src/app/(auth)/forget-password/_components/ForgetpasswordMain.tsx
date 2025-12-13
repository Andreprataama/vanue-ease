"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email({
    message: "Masukkan alamat email yang valid.",
  }),
});

type RequestResetFormValues = z.infer<typeof formSchema>;

export function ForgetpasswordMain() {
  const form = useForm<RequestResetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: RequestResetFormValues) {
    const { data, error } = await authClient.requestPasswordReset({
      email: values.email,
    });

    if (error) {
      console.error("Password reset error:", error);
      toast.error("Gagal mengirim email.", {
        description:
          error.message || "Pastikan email Anda terdaftar dengan benar.",
      });
    } else {
      toast.success(
        "Silakan periksa kotak masuk email Anda untuk tautan reset."
      );

      form.reset({ email: "" });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm shadow-2xl dark:shadow-md dark:border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Lupa Kata Sandi ?
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            Masukkan alamat email Anda. Kami akan mengirimkan instruksi reset
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            {/* Menggunakan form.handleSubmit(onSubmit) untuk menangani submit */}
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
                        placeholder="nama@perusahaan.com"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-10 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim Tautan...
                  </>
                ) : (
                  "Kirim Tautan Reset"
                )}
              </Button>

              {/* Tautan kembali ke Login */}
              <div className="text-center text-sm pt-2">
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  &larr; Kembali ke Halaman Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgetpasswordMain;
