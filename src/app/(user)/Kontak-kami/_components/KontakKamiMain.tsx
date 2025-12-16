"use client";

import { useState } from "react";
import { User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import Image from "next/image";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  message: string;
  agreedToPrivacy: boolean;
}

const KontakKami = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    agreedToPrivacy: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreedToPrivacy) {
      setStatusMessage("Harap setujui kebijakan privasi sebelum mengirim.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/kontak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // SUKSES
        setStatusMessage(
          "✅ Pesan Anda telah berhasil terkirim. Kami akan menghubungi Anda segera!"
        );

        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          message: "",
          agreedToPrivacy: false,
        });
      } else {
        const errorData = await response.json();
        setStatusMessage(
          `❌ Gagal mengirim pesan: ${
            errorData.message || "Terjadi kesalahan server."
          }`
        );
      }
    } catch (error) {
      // Gagal (Kesalahan Jaringan)
      console.error("Error saat mengirim formulir:", error);
      setStatusMessage("❌ Terjadi kesalahan jaringan. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false); // Selesai loading
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-foreground text-3xl leading-tight font-bold lg:text-4xl">
                Hubungi Kami
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Ada pertanyaan, saran, atau ingin bekerja sama? Tim kami siap
                membantu Anda kapan pun.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <User className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="border-border bg-card h-12 pl-10"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="border-border bg-card h-12 pl-10"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="relative">
                <Phone className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                <Input
                  placeholder="Phone No"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="border-border bg-card h-12 pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="relative">
                <Mail className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="border-border bg-card h-12 pl-10"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Textarea
                  placeholder="Your message"
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="border-border bg-card min-h-32 resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="privacy"
                  checked={formData.agreedToPrivacy}
                  onCheckedChange={(checked) =>
                    // Checkbox mengembalikan boolean atau string, kita asumsikan boolean di sini
                    handleChange("agreedToPrivacy", !!checked)
                  }
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="privacy"
                  className="text-muted-foreground text-sm leading-relaxed"
                >
                  I have read and agree to the{" "}
                  <Link href="#" className="underline">
                    privacy policy
                  </Link>
                </label>
              </div>

              {/* Bagian untuk menampilkan pesan status (sukses/gagal/error validasi) */}
              {statusMessage && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    statusMessage.startsWith("✅")
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                  role="alert"
                >
                  {statusMessage}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !formData.agreedToPrivacy}
              >
                {isSubmitting ? "Mengirim Pesan..." : "Kirim Pesan Anda"}
              </Button>
            </form>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="overflow-hidden hidden md:block rounded-2xl shadow-lg">
              <Image
                src="https://plus.unsplash.com/premium_photo-1667339610013-020844b87990?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Vanue Ease"
                width={600}
                height={600}
                className="h-[600px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KontakKami;
