"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { BillTypeCard } from "@/components/bills/BillTypeCard";

export default function SelectBillTypePage() {
  const router = useRouter();

  return (
    <div>
      <PageHeader title="Create New Bill" subtitle="Choose a bill format to continue" />
      <div className="flex flex-col gap-3 px-4 sm:px-6">
        <BillTypeCard title="KING ENTERPRISE" subtitle="Purple hardware bill" onClick={() => router.push("/bills/new/type-3")} />
        <BillTypeCard title="SHAREEF TRADERS" subtitle="Green stationery bill" onClick={() => router.push("/bills/new/type-1")} />
        <BillTypeCard title="AL-GHANI TRADERS" subtitle="Classic black and white bill" onClick={() => router.push("/bills/new/type-2")} />
      </div>
    </div>
  );
}
