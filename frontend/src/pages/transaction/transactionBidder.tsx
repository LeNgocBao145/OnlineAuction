import Nav from "@/components/ui/nav";
import Chatbox from "./chatbox";
import TransactionInfoCard from "./infoCard";
import Step1Box from "./bidder/step1";
import Step2Box from "./bidder/step2";
import Step3Box from "./bidder/step3";
import Step4Box from "./bidder/step4";

import { useState } from "react";

export default function BidderTransactionPage() {
    const [currentStep, setCurrentStep] = useState(4); //fetch current step from backend
  return (
    <>
        <Nav />
        <div className="lg:px-[10%] px-4 pb-10">
            <h1 className="text-(--primary) text-3xl font-bold mt-6">Complete Order</h1>
            <p className="text-white/60">Finalize your transaction with the seller.</p>
            <div className="mt-6 grid lg:grid-cols-[2fr_1fr] grid-cols-1 gap-6 items-start">
                <div className="grid gap-6">
                    <TransactionInfoCard currentStep={currentStep} />
                    {currentStep === 1 && <Step1Box />}
                    {currentStep === 2 && <Step2Box />}
                    {currentStep === 3 && <Step3Box />}
                </div>
                <Chatbox sideCalling="bidder" />
            </div>
            {currentStep === 4 && <Step4Box />}
        </div>
    </>
  );
}