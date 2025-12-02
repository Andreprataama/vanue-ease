import { columns, Payment } from "./colums";
import { DataTable } from "./data-table";

async function getData(): Promise<Payment[]> {
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 50000,
      status: "pending",
      email: "ander@me.com",
    },
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10 p-2">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
