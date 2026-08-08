"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { resendConfirmationAction } from "@/app/(auth)/verify-email/actions";

const COOLDOWN_SECONDS = 30;

function ResendConfirmationButton({ email }: { email: string }) {
  const [isPending, setIsPending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    setIsPending(true);
    try {
      const result = await resendConfirmationAction(email);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Confirmation email sent.");
        setCooldown(COOLDOWN_SECONDS);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      onClick={handleResend}
      disabled={isPending || cooldown > 0}
    >
      {isPending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          Sending...
        </>
      ) : cooldown > 0 ? (
        `Resend email (${cooldown}s)`
      ) : (
        "Resend email"
      )}
    </Button>
  );
}

export { ResendConfirmationButton };
