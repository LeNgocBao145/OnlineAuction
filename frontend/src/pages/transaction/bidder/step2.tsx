import { useState } from "react";

export default function Step2Box() {
    const [uploadedData, setUploadedData] = useState<{
        file: File; 
        fileType: string;
        fileSrc: string;
        shippingAddress: string;
        contactNumber: string;
    }>(
        {
            file: null as any,
            fileType: "image/png",
            fileSrc: "",
            shippingAddress: "1234 Elm Street, Springfield, IL 62704",
            contactNumber: "+1-555-123-4567"
        }
    );

    return (
        <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
            <h2 className="text-(--primary) text-xl font-bold mb-4">Step 2: Seller confirms payment and submits shipping invoice.</h2>
            <p className="text-white/80">Your payment is being processed. Please wait for the seller to confirm the payment and submit the shipping invoice.</p>
            
            <h2 className="text-white text-xl font-bold mt-4">Uploaded Payment Content</h2>
            <div className="grid lg:grid-cols-[1fr_2fr] grid-cols-1 gap-4">
                {uploadedData.fileType.startsWith("image/") ? (
                    <img 
                        src={uploadedData.fileSrc}
                        alt="Your uploaded payment receipt." 
                        className="mt-4 w-full aspect-square rounded-md border border-white/10 flex justify-center items-center text-white"
                    />
                ) : (
                    <embed 
                        type={uploadedData.fileType} 
                        className="mt-4 w-full aspect-square rounded-md border border-white/10 flex justify-center items-center text-white" 
                        src={uploadedData.fileSrc} 
                    />
                )}
                <div className="mt-4 flex flex-col gap-2">
                    <p className="text-white/60">Shipping Address: <span className="text-white">{uploadedData.shippingAddress}</span></p>
                    <p className="text-white/60">Contact Number: <span className="text-white">{uploadedData.contactNumber}</span></p>
                </div>
            </div>
        </div>
    );
}