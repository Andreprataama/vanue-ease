import PembayaranMain from "./_components/PembayaranMain";
import { Suspense } from "react";

interface PaymentPageProps {
  params: { status: "success" | "pending" | "failure" | "onclose" };
}

const Page = async ({ params }: PaymentPageProps) => {
  const { status } = params;

  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-screen container mx-auto py-20">
            Memuat Status...
          </div>
        }
      >
        <PembayaranMain status={status} />
      </Suspense>
    </>
  );
};

export default Page;
