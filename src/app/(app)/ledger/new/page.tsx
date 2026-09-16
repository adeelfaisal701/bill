"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { createLedgerAccount } from "@/services/ledgerService";

function NewLedgerAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCompany = searchParams.get("company") || undefined;
  
  const { show } = useToast();
  const [name, setName] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [type, setType] = useState("Society / Company");
  const [contactDetails, setContactDetails] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxName, setTaxName] = useState("Sales Tax");
  const [taxRate, setTaxRate] = useState("18");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [openingBalanceType, setOpeningBalanceType] = useState<"debit" | "credit">("debit");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      show("Society / Company name is required.", "error");
      return;
    }

    const numericRate = Number(taxRate || 0);
    if (taxEnabled && (!Number.isFinite(numericRate) || numericRate < 0)) {
      show("Tax rate must be a valid non-negative number.", "error");
      return;
    }

    setSaving(true);
    try {
      await createLedgerAccount({
        name,
        accountCode: accountCode || undefined,
        type: type as any,
        companyId: initialCompany,
        contactDetails: contactDetails || undefined,
        projectName: projectName || undefined,
        projectCode: projectCode || undefined,
        taxEnabled,
        taxName: taxEnabled ? (taxName || "Sales Tax") : undefined,
        taxRate: taxEnabled ? numericRate : 0,
        openingBalance: Number(openingBalance || 0),
        openingBalanceType,
      });
      show("Ledger account created.", "success");
      router.push("/ledger");
    } catch {
      show("Unable to save ledger account.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-8">
      <PageHeader title="Add Society / Company" subtitle="Create a manual ledger account" />

      <div className="space-y-4 px-4 sm:px-6">
        <Card className="p-4">
          <div className="grid gap-4">
            <Input label="Society / Company Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Account Code" value={accountCode} onChange={(e) => setAccountCode(e.target.value)} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-700">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-[15px] text-ink-900 focus-ring transition-colors focus:border-brand-400"
              >
                <option>Customer</option>
                <option>Supplier</option>
                <option>Society / Company</option>
                <option>Other</option>
              </select>
            </div>

            <Input label="Contact Details" value={contactDetails} onChange={(e) => setContactDetails(e.target.value)} />
            <Input label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            <Input label="Project Code" value={projectCode} onChange={(e) => setProjectCode(e.target.value)} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-700">Tax</label>
                <button
                  type="button"
                  onClick={() => setTaxEnabled((prev) => !prev)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm font-medium ${
                    taxEnabled ? "border-brand-200 bg-brand-50 text-brand-700" : "border-ink-200 bg-white text-ink-700"
                  }`}
                >
                  {taxEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <Input label="Tax Name" value={taxName} onChange={(e) => setTaxName(e.target.value)} disabled={!taxEnabled} />
            </div>

            <Input
              label="Tax Rate (%)"
              type="number"
              min="0"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              disabled={!taxEnabled}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Opening Balance" type="number" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-700">Opening Balance Type</label>
                <select
                  value={openingBalanceType}
                  onChange={(e) => setOpeningBalanceType(e.target.value as "debit" | "credit")}
                  className="rounded-xl border border-ink-200 bg-white px-4 py-3 text-[15px] text-ink-900 focus-ring transition-colors focus:border-brand-400"
                >
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Button fullWidth onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save Ledger Account"}
        </Button>
      </div>
    </div>
  );
}

export default function NewLedgerAccountPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <NewLedgerAccountForm />
    </Suspense>
  );
}
