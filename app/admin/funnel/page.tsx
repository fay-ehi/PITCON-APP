import type { Metadata } from "next";

import { getActivationFunnel } from "@/lib/queries/admin";
import { ActivationFunnel } from "@/components/admin/activation-funnel";

export const metadata: Metadata = {
  title: "Activation Funnel",
};

/**
 * Sprint 17 (Product Analytics) - the last item the README's Roadmap
 * had listed as missing entirely. See lib/queries/admin.ts's
 * `getActivationFunnel` for what each step actually measures and the
 * honest substitutions made along the way (there's no tracked "search"
 * event, no existing "investor profile complete" threshold before
 * this) - worth reading before trusting a number here at a glance.
 */
export default async function AdminFunnelPage() {
  const funnel = await getActivationFunnel();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h3 font-semibold text-gray-900">Activation Funnel</h1>
        <p className="text-small text-gray-500">
          All-time counts, not cohorted by signup date - a recent signup hasn&apos;t had
          the same time to progress as an older one.
        </p>
      </div>

      <ActivationFunnel founder={funnel.founder} investor={funnel.investor} />
    </div>
  );
}
