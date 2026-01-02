import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import transactionService, { type StepBoxProps } from "@/services/transactionService";
import { toast } from "sonner";

export default function Step1Box({ productId, transaction, onSuccess }: StepBoxProps) {
    const [uploadedData, setUploadedData] = useState<File>();
    const paymentInfoSchema = z.object({
        paymentProof: z
            .custom<File>()
            .refine(
            (file) => file instanceof File && file.size > 0,
            "Payment proof is required."
            ),
        shippingAddress: z
            .string()
            .min(10, "Shipping address must be at least 10 characters long.")
    });

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: zodResolver(paymentInfoSchema)
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setValue("paymentProof", files[0]);
            setUploadedData(files[0]);
        } else {
            setUploadedData(undefined);
        }
    };

    const submitPaymentInfo = async (data: any) => {
        try {
          const { paymentProof: invoiceImage, shippingAddress: deliveryAddress } = data;
          const res = await transactionService.bidderSubmit(productId, {
            deliveryAddress,
            invoiceImage: invoiceImage.name,
          });
          if(res) {
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
                <label className="text-white/80">Payment Invoice Upload <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-1">
                    <label htmlFor="productImages" className="text-white/80 border border-white/10 aspect-square flex flex-col justify-center items-center rounded-md"
                    onDrop={(e) => {
                        e.preventDefault();
                        handleImageUpload({ target: { files: e.dataTransfer.files } } as any);
                    }}
                    onDragOver={(e) => e.preventDefault()}>
                        <span>Drag and Drop your proof of payment</span>
                        <span className="text-white/60 text-sm mt-1">Accepted formats: <span className="text-(--primary)">.jpg, .jpeg, .png, .pdf</span></span>
                    </label>
                    <input type="file" id="productImages" className="hidden" multiple accept="image/jpg,image/jpeg,image/png,application/pdf"
                    onChange={(e) => {handleImageUpload(e);}}
                    />
                    <div className="aspect-square border border-white/10 flex justify-center items-center rounded-md">
                        {uploadedData && uploadedData.type === "application/pdf" ? (
                            <embed type="application/pdf" className="text-white w-full h-full" src={URL.createObjectURL(uploadedData)} />
                        ) : (
                            <img className="text-white" src={uploadedData ? URL.createObjectURL(uploadedData) : undefined} alt="Your uploaded proof of payment." />
                        )}
                    </div>
                    {}{errors.paymentProof && <p className="text-red-500 text-sm">{errors.paymentProof.message}</p>}
                </div>
                <div className="flex flex-col">
                    <label className="text-white/80 mt-4">Your shipping address <span className="text-red-500">*</span></label>
                    <textarea className="w-full mt-1 p-2 bg-(--fourth) border border-white/10 rounded-md text-white h-24 resize-none" placeholder="Enter your shipping address here..." {...register("shippingAddress")} />
                    {errors.shippingAddress && <p className="text-red-500 text-sm">{errors.shippingAddress.message}</p>}
                </div>
                <button type="submit" className="mt-6 bg-(--primary) w-full text-black font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity duration-200">Submit Payment Information</button>
            </form>
        </div>
    );
}