import Chatbox from "./chatbox";
import TransactionInfoCard from "./infoCard";
import Step1Box from './seller/step1';
import Step2Box from "./seller/step2";
import Step3Box from "./seller/step3";
import Step4Box from "./seller/step4";
import { useEffect, useMemo, useState } from "react";
import transactionService, { type Transaction } from "@/services/transactionService";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const STEP = {
  pending_payment: 1,
  pending_seller_confirm: 2,
  pending_bidder_confirm: 3,
  completed: 4,
  failed: 5,
};

export default function SellerTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const productId = useMemo(() => Number(id), [id]);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const refetch = async () => {
    if (!id || Number.isNaN(productId)) return;
    try {
      const tx = await transactionService.getTransaction(productId);
      setTransaction(tx);
      setCurrentStep(STEP[tx.state]);
    } catch {
      navigate(`/`, { replace: true });
      toast.error("Failed to fetch transaction");
    }
  };
  useEffect(() => {
    refetch();
  }, [id, productId]);
  return (
    <div className="lg:px-[10%] px-4 pb-10">
      <h1 className="text-(--primary) text-3xl font-bold mt-6">Complete Order</h1>
      <p className="text-white/60">Finalize your transaction with the buyer.</p>
      <div className="mt-6 grid lg:grid-cols-[2fr_1fr] grid-cols-1 gap-6 items-start">
        <div className="grid gap-6">
          <TransactionInfoCard currentStep={currentStep ?? 0} transaction={transaction ?? null} />
          {currentStep === 1 && <Step1Box productId={productId} transaction={transaction} onSuccess={refetch}/>}
          {currentStep === 2 && <Step2Box productId={productId} transaction={transaction} onSuccess={refetch} />}
          {currentStep === 3 && <Step3Box productId={productId} transaction={transaction} onSuccess={refetch} />}
        </div>
        <Chatbox sideCalling="seller" productId={productId} recipientId={transaction?.bidder} />
      </div>
      {currentStep === 4 && <Step4Box productId={productId} transaction={transaction} onSuccess={refetch} />}
    </div>
  );
}