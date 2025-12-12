import CheckoutMain from "./_components/CheckoutMain";

interface CheckoutPageProps {
  params: { id: string };
}
const page = async ({ params }: CheckoutPageProps) => {
  const { id } = await params;

  return (
    <>
      <CheckoutMain venueId={id} />
    </>
  );
};

export default page;
