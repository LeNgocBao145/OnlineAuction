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

const transportSchema = z.object({
  transportImage: z
    .custom<File>()
    .refine((file) => file instanceof File && file.size > 0, "Transport image is required."),
});

type TransportForm = z.infer<typeof transportSchema>;

export default function Step2Box({ productId, transaction, onSuccess }: StepBoxProps) {
  const [confirming, setConfirming] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransportForm>({
    resolver: zodResolver(transportSchema),
    defaultValues: { transportImage: undefined as any },
  });

  const transportFile = watch("transportImage");

  const invoiceUrl = useMemo(() => {
    const p = `assets/transactions/${transaction?.invoice_image}`;
    return buildAssetUrl(p);
  }, [transaction?.invoice_image]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setValue("transportImage", undefined as any, { shouldValidate: true });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
      return;
    }

    // chỉ 1 ảnh: lấy đúng file[0]
    setValue("transportImage", file, { shouldValidate: true });

    // preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    // reset input để chọn lại cùng 1 file vẫn trigger onChange
    e.target.value = "";
  };

  const clearTransportImage = () => {
    setValue("transportImage", undefined as any, { shouldValidate: true });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
  };

  const handleConfirm = async (data: any) => {
    if (confirming) return;

    try {
      setConfirming(true);
      await transactionService.sellerConfirm(productId, data);

      toast.success("Transport image uploaded & confirmed!");
      await onSuccess?.();
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
        Step 2: Seller uploads transport image and confirms
      </h2>

      <div className="grid lg:grid-cols-[1fr_2fr] grid-cols-1 gap-4">
        {/* Invoice preview */}
        {invoiceUrl ? (
          <div className="mt-4 w-full max-h-[520px] rounded-md border border-white/10 bg-black/20 flex items-center justify-center overflow-auto">
            <img src={invoiceUrl} alt="Invoice" className="w-full h-auto object-contain" />
          </div>
        ) : (
          <div className="mt-4 w-full h-[300px] rounded-md border border-white/10 flex items-center justify-center text-white/50">
            {transaction?.invoice_image ? "Cannot load invoice image" : "No invoice image"}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-white/60">
            Bidder: <span className="text-white">{transaction?.bidder_name || "-"}</span>
          </p>
          <p className="text-white/60">
            Shipping Address: <span className="text-white">{transaction?.delivery_address || "-"}</span>
          </p>

          {/* Upload box */}
          <div className="mt-4 rounded-md border border-white/10 bg-black/20 p-3">
            <p className="text-white font-semibold mb-2">Transport image</p>

            {!previewUrl ? (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="h-[180px] rounded-md border border-dashed border-white/20 flex items-center justify-center text-white/60 hover:border-white/40">
                  Click to upload transport image
                </div>
              </label>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="w-full max-h-[260px] rounded-md border border-white/10 bg-black/20 flex items-center justify-center overflow-auto">
                  <img src={previewUrl} alt="Transport preview" className="w-full h-auto object-contain" />
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <span className="inline-block px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/15">
                      Change image
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={clearTransportImage}
                    className="px-3 py-2 rounded-md bg-red-500/20 text-red-200 hover:bg-red-500/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {errors.transportImage?.message && (
              <p className="text-red-400 text-sm mt-2">{errors.transportImage.message}</p>
            )}
          </div>
        </div>

        <p className="text-red-400 col-span-full">
          Warning: Please verify the payment details before confirming. This action cannot be undone.
        </p>

        <button
          type="button"
          onClick={handleSubmit(handleConfirm)}
          disabled={confirming || !(transportFile instanceof File)}
          className="bg-(--primary) text-black px-4 py-2 rounded-md col-span-full hover:bg-(--primary)/80 disabled:opacity-60"
        >
          {confirming ? "Confirming..." : "Confirm Payment Received"}
        </button>
      </div>
    </div>
  );
}
