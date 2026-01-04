import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import transactionService, { type StepBoxProps } from "@/services/transactionService";
import { toast } from "sonner";

export default function Step1Box({ productId, transaction, onSuccess }: StepBoxProps) {
  const [uploadedData, setUploadedData] = useState<File | undefined>();

  const paymentInfoSchema = z.object({
    paymentProof: z
      .custom<File>()
      .refine((file) => file instanceof File && file.size > 0, "Payment proof is required."),
    shippingAddress: z.string().min(10, "Shipping address must be at least 10 characters long."),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset, // ✅ thêm reset
  } = useForm({
    resolver: zodResolver(paymentInfoSchema),
    defaultValues: {
      // ✅ default ngay lần mount đầu
      shippingAddress: transaction?.delivery_address ?? "",
    },
  });

  // ✅ Khi transaction load/đổi, cập nhật default vào form
  useEffect(() => {
    reset({
      shippingAddress: transaction?.delivery_address ?? "",
      // không reset paymentProof để tránh mất file đang chọn
    });
  }, [transaction?.delivery_address, reset]);

  const previewUrl = useMemo(() => {
    if (!uploadedData) return "";
    return URL.createObjectURL(uploadedData);
  }, [uploadedData]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageUpload = (files: FileList | null) => {
    const file = files?.[0];
    if (file) {
      setValue("paymentProof", file, { shouldValidate: true });
      setUploadedData(file);
    } else {
      setUploadedData(undefined);
    }
  };

  const submitPaymentInfo = async (data: any) => {
    try {
      const { paymentProof: invoiceImage, shippingAddress: deliveryAddress } = data;
      const res = await transactionService.bidderSubmit(productId, {
        deliveryAddress,
        invoiceImage,
      });

      if (res) {
        toast.success("Send payment information to seller successfully");
        await onSuccess();
      }
    } catch (error) {
      console.error("SubmitPaymentInfo error:", error);
      toast.error("Send payment information failed");
    }
  };

  return (
    <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
      <h2 className="text-(--primary) text-xl font-bold mb-4">Step 1: Payment Information.</h2>

      <form onSubmit={handleSubmit(submitPaymentInfo)}>
        <label className="text-white/80">
          Payment Invoice Upload <span className="text-red-500">*</span>
        </label>

        <label
          htmlFor="paymentProof"
          className="mt-1 border border-white/10 rounded-md aspect-square w-full flex flex-col justify-center items-center overflow-hidden cursor-pointer"
          onDrop={(e) => {
            e.preventDefault();
            handleImageUpload(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          {!uploadedData ? (
            <>
              <span className="text-white/80">Drag and Drop your proof of payment</span>
              <span className="text-white/60 text-sm mt-1">
                Accepted formats: <span className="text-(--primary)">.jpg, .jpeg, .png, .pdf</span>
              </span>
              <span className="text-white/50 text-xs mt-2">(Click to choose file)</span>
            </>
          ) : uploadedData.type === "application/pdf" ? (
            <embed type="application/pdf" className="w-full h-full" src={previewUrl} />
          ) : (
            <img className="w-full h-full object-contain" src={previewUrl} alt="Your uploaded proof of payment." />
          )}
        </label>

        <input
          type="file"
          id="paymentProof"
          className="hidden"
          accept="image/jpg,image/jpeg,image/png,application/pdf"
          onChange={(e) => handleImageUpload(e.target.files)}
        />

        {errors.paymentProof && <p className="text-red-500 text-sm mt-2">{String(errors.paymentProof.message)}</p>}

        <div className="flex flex-col">
          <label className="text-white/80 mt-4">
            Your shipping address <span className="text-red-500">*</span>
          </label>

          {/* ✅ bidder vẫn sửa thoải mái */}
          <textarea
            className="w-full mt-1 p-2 bg-(--fourth) border border-white/10 rounded-md text-white h-24 resize-none"
            placeholder="Enter your shipping address here..."
            {...register("shippingAddress")}
          />

          {errors.shippingAddress && <p className="text-red-500 text-sm">{String(errors.shippingAddress.message)}</p>}
        </div>

        <button
          type="submit"
          className="mt-6 bg-(--primary) w-full text-black font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity duration-200"
        >
          Submit Payment Information
        </button>
      </form>
    </div>
  );
}
