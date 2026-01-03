import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import transactionService, { type StepBoxProps } from "@/services/transactionService";

function buildAssetUrl(p?: string | null) {
  if (!p) return "";

  if (/^https?:\/\//i.test(p)) return p;

  const apiBase = import.meta.env.VITE_API_URL as string;
  const base = apiBase.replace(/\/api\/?$/i, "");
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${base}${path}`;
}

export default function Step2Box({ productId, transaction, onSuccess }: StepBoxProps) {
  const [confirming, setConfirming] = useState(false);
  const paymentInfoSchema = z.object({
      paymentProof: z
          .custom<File>()
          .refine(
          (file) => file instanceof File && file.size > 0,
          "Payment proof is required."
          ),
  });
  const invoiceUrl = useMemo(() => {
    const p = `assets/transactions/${transaction?.invoice_image}`;
    return buildAssetUrl(p);
  }, [transaction?.invoice_image]);  

  const handleConfirm = async () => {
    if (confirming) return;

    try {
      setConfirming(true);
      await transactionService.sellerConfirm(productId);
      toast.success("Delivery successfully");
      await onSuccess();
    } catch (e) {
      console.error("Confirm error:", e);
      toast.error("Confirm failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
      <h2 className="text-(--primary) text-xl font-bold mb-4">
        Step 1 & 2: Bidder sends payment and seller confirms
      </h2>

      <div className="grid lg:grid-cols-[1fr_2fr] grid-cols-1 gap-4">
          {invoiceUrl ? (
              <div className="mt-4 w-full max-h-[520px] rounded-md border border-white/10 bg-black/20 flex items-center justify-center overflow-auto">
                <img
                  src={invoiceUrl}
                  alt="Uploaded payment receipt"
                  className="w-full h-auto object-contain"
                />
              </div>
            ) : (
              <div className="mt-4 w-full h-[300px] rounded-md border border-white/10 flex items-center justify-center text-white/50">
                {transaction?.invoice_image ? "Cannot load invoice image" : "No invoice image"}
              </div>
          )}


        <div className="mt-4 flex flex-col gap-2">
          <p className="text-white/60">
            Bidder: <span className="text-white">{transaction?.bidder_name || "-"}</span>
          </p>
          <p className="text-white/60">
            Shipping Address: <span className="text-white">{transaction?.delivery_address || "-"}</span>
          </p>
        </div>

        <p className="text-red-400 col-span-full">
          Warning: Please verify the payment details before confirming. This action cannot be undone.
        </p>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirming}
          className="bg-(--primary) text-black px-4 py-2 rounded-md col-span-full hover:bg-(--primary)/80 disabled:opacity-60"
        >
          {confirming ? "Confirming..." : "Confirm Payment Received"}
        </button>
      </div>
    </div>
  );
}