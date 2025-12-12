import CheckoutMain from "./_components/CheckoutMain";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface CheckoutPageProps {
  params: { id: string };
}
const page = async ({ params }: CheckoutPageProps) => {
  const { id } = await params;

  return (
    <>
      <Suspense fallback={<div className="min-h-screen">Loading...</div>}>
        <CheckoutMain venueId={id} />
      </Suspense>
    </>
  );
};

export default page;
