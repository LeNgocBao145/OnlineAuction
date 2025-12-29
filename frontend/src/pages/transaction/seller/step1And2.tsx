import { useState } from "react";

export default function Step1And2Box() {
    const [uploadedData, setUploadedData] = useState<{
        file: File; 
        fileType: string;
        fileSrc: string;
        buyerName: string;
        shippingAddress: string;
        contactNumber: string;
    }>(
        {
            file: null as any,
            fileType: "image/png",
            fileSrc: "",
            buyerName: "John Doe",
            shippingAddress: "1234 Elm Street, Springfield, IL 62704",
            contactNumber: "+1-555-123-4567"
        }
    );

    return (
        <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
            <h2 className="text-(--primary) text-xl font-bold mb-4">Step 1 & 2: Bidder sends payment and seller confirms</h2>
            <p className="text-white/80">Wait for your buyer to send the payment and for you to confirm it.</p>
            
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
                    <p className="text-white/60">Buyer Name: <span className="text-white">{uploadedData.buyerName}</span></p>
                    <p className="text-white/60">Shipping Address: <span className="text-white">{uploadedData.shippingAddress}</span></p>
                    <p className="text-white/60">Contact Number: <span className="text-white">{uploadedData.contactNumber}</span></p>
                </div>
                <p className="text-red-400 col-span-full">Warning: Please verify the payment details before confirming. This action cannot be undone.</p>
                <button className="bg-(--primary) text-black px-4 py-2 rounded-md col-span-full hover:bg-(--primary)/80">Confirm Payment Received</button>
            </div>
        </div>
    );
}