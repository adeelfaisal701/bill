"use client";

import { useEffect, useState } from "react";
import { Building2, FileText, Cloud, Info, HelpCircle, Shield, LogOut, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getBusinessProfile, saveBusinessProfile } from "@/services/businessService";
import { getBillTypes } from "@/services/billService";
import { repositories } from "@/repositories";
import type { BusinessProfile } from "@/types/business";
import type { BillType } from "@/types/bill";
import { billTemplateName } from "@/components/bills/BillTemplate";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { show } = useToast();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ businessName: "", address: "", phone: "" });

  useEffect(() => {
    getBusinessProfile().then((p) => {
      setProfile(p);
      if (p) setForm({ businessName: p.businessName, address: p.address ?? "", phone: p.phone ?? "" });
    });
    getBillTypes().then(setBillTypes);
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      const saved = await saveBusinessProfile({
        businessName: form.businessName.trim(),
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        createdAt: profile?.createdAt ?? new Date().toISOString(),
      });
      setProfile(saved);
      setEditOpen(false);
      show("Business information saved.", "success");
    } catch {
      show("Unable to save business information. Please try again.", "error");
    }
  }

  return (
    <div className="pb-6">
      <PageHeader title="Settings" />

      <div className="space-y-6 px-4 sm:px-6">
        <Section title="Business">
          <SettingsRow
            icon={<Building2 size={18} />}
            label="Business Information"
            value={profile?.businessName || "Not set up yet"}
            onClick={() => setEditOpen(true)}
          />
        </Section>

        <Section title="Bill Settings">
          {billTypes.map((bt) => (
            <SettingsRow
              key={bt.id}
              icon={<FileText size={18} />}
              label={billTemplateName(bt.id)}
              value={`Next serial: #${bt.lastSerialNumber}`}
            />
          ))}
        </Section>

        <Section title="Data">
          <SettingsRow
            icon={<Cloud size={18} />}
            label="Cloud Sync"
            value={repositories.mode === "cloud" ? "Connected" : "Not configured"}
            badge={
              <Badge tone={repositories.mode === "cloud" ? "success" : "neutral"}>
                {repositories.mode === "cloud" ? "Cloud" : "Local device only"}
              </Badge>
            }
          />
          <SettingsRow
            icon={<Cloud size={18} />}
            label="Backup"
            value="Available once cloud sync is configured"
          />
        </Section>

        <Section title="App">
          <SettingsRow icon={<Info size={18} />} label="About" value="BillBook v0.1 (Phase 1)" />
          <SettingsRow icon={<HelpCircle size={18} />} label="Help" value="Contact support" />
          <SettingsRow icon={<Shield size={18} />} label="Privacy" value="View privacy policy" />
        </Section>

        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white py-3.5 text-sm font-semibold text-danger shadow-card focus-ring"
        >
          <LogOut size={17} />
          Sign Out {user?.name ? `(${user.name})` : ""}
        </button>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Business Information">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <Input
            label="Business Name"
            required
            value={form.businessName}
            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <p className="text-xs text-ink-400">
            Logo upload will be available once cloud storage is configured.
          </p>
          <Button type="submit" size="lg">
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
        {title}
      </h2>
      <Card className="divide-y divide-ink-100 overflow-hidden">{children}</Card>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-800">{label}</p>
        {value && <p className="truncate text-xs text-ink-400">{value}</p>}
      </div>
      {badge}
      {onClick && <ChevronRight size={18} className="shrink-0 text-ink-300" />}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left hover:bg-ink-50 focus-ring">
        {content}
      </button>
    );
  }
  return content;
}
