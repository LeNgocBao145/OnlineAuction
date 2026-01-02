import { type StepBoxProps } from "@/services/transactionService";

export default function Step2Box({ productId, transaction, onSuccess }: StepBoxProps) {
    return (
        <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
            <h2 className="text-(--primary) text-xl font-bold mb-4">Step 2: Seller confirms payment and submits shipping invoice.</h2>
            <p className="text-white/80">Your payment is being processed. Please wait for the seller to confirm the payment and submit the shipping invoice.</p>
            
            <h2 className="text-white text-xl font-bold mt-4">Uploaded Payment Content</h2>
            <div className="grid lg:grid-cols-[1fr_2fr] grid-cols-1 gap-4">
                <img 
                        src={transaction?.delivery_invoice_image}
                        alt="Your uploaded payment receipt." 
                        className="mt-4 w-full aspect-square rounded-md border border-white/10 flex justify-center items-center text-white"
                />
                <div className="mt-4 flex flex-col gap-2">
                    <p className="text-white/60">Shipping Address: <span className="text-white">{transaction?.delivery_address}</span></p>
                </div>
            </div>
        </div>
    );
}