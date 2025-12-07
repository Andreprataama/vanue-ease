import TempatDetail from "./_components/TempatDetail";

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <TempatDetail id={id} />
    </div>
  );
};

export default Page;
