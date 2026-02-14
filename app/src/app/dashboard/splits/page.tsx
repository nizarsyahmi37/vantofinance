"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { SplitCard } from "@/components/splits/SplitCard";
import { Users } from "lucide-react";

export default function SplitsPage() {
  const { user } = usePrivy();
  const wallet = user?.wallet?.address;
  const [splits, setSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) return;
    setLoading(true);
    fetch(`/api/splits?wallet=${wallet}`)
      .then((r) => r.json())
      .then((d) => setSplits(d.splits || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [wallet]);

  const activeSplits = splits.filter((s) => s.status === "active");
  const settledSplits = splits.filter((s) => s.status === "settled");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bill Splits</h1>
        <p className="text-sm text-gray-500 mt-1">
          Split bills with friends. Atomic batch transactions ensure fairness.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-pulse-200 border-t-pulse-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : splits.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-white">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-medium text-gray-600 mt-4">No splits yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Use the AI chat: &ldquo;Split $120 dinner between 3 people&rdquo;
          </p>
        </div>
      ) : (
        <>
          {activeSplits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Active</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSplits.map((split) => (
                  <SplitCard key={split.id} split={split} />
                ))}
              </div>
            </div>
          )}

          {settledSplits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Settled</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settledSplits.map((split) => (
                  <SplitCard key={split.id} split={split} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
