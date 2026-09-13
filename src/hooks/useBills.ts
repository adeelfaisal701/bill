"use client";

import { useCallback, useEffect, useState } from "react";
import type { Bill } from "@/types/bill";
import * as billService from "@/services/billService";

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billService.listBills();
      setBills(data);
    } catch {
      setError("Unable to load your bills. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { bills, loading, error, reload };
}
