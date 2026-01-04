import { CheckIcon } from "@heroicons/react/24/solid";
import { formatTimeLeft } from "@/utils/timeUtils";
import type { Transaction } from "@/services/transactionService";
import { formatCurrency } from "@/utils/numberUtils";

export default function TransactionInfoCard({
    currentStep,
    transaction
}: { 
    currentStep: number,
    transaction: Transaction | null
}) {
    if (!transaction) {
        return (
          <div className="border border-white/10 rounded-lg p-4 bg-(--third) text-white/60">
            Loading transaction...
          </div>
        );
    }
    return (
        <>
            {/*product info component*/}
            <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-4">
                    <img className="w-full mr-4 aspect-square border-(--primary) border rounded-lg flex justify-center items-center text-white/60" src={transaction.image} alt="product image" />
                    <div className="w-full h-[200px] flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-white text-xl font-bold">{transaction?.name}</h2>
                                <div className="p-[0.35rem] bg-(--primary) text-black rounded-2xl flex justify-center items-center">
                                    {currentStep === 1 ? "Awaiting confirmation" : 
                                    currentStep === 2 ? "Processing shipment" :
                                    currentStep === 3 ? "Awaiting delivery confirmation" :
                                    currentStep === 4 ? "Transaction completed" :
                                    currentStep === 5 ? "Transaction failed" :
                                    "Unknown status"}
                                </div>
                            </div>
                            <div>
                                <p className="text-(--primary) text-2xl font-bold">{formatCurrency(transaction.current_price)}</p>
                                <p className="text-white/60">Final Price</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <p className="text-white/60">Seller: <span className="text-white">{transaction.seller_name}</span></p>
                            <p className="text-white/60">Winner: <span className="text-white">{transaction.bidder_name}</span></p>
                        </div>
                        <p className="text-white/60">Ended: {formatTimeLeft(transaction.expired_at || 0)}</p>
                    </div>
                </div>
            </div>
            {/*progress component*/}
            <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
                <h2 className="text-(--primary) text-xl font-bold">Transaction Progress</h2>
                <div className="flex items-center gap-4 mt-4">
                    <div className={`relative h-8 w-8 rounded-full border border-white ${currentStep > 1 ? "bg-(--primary) border-0" : ""}`}>
                        {currentStep > 1 && (
                            <CheckIcon className="absolute h-6 w-6 top-1 left-1 text-black"/>
                        )}
                    </div>
                    <p className="text-white">Step 1: Payment Information.</p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <div className={`relative h-8 w-8 rounded-full border border-white ${currentStep > 2 ? "bg-(--primary) border-0" : ""}`}>
                        {currentStep > 2 && (
                            <CheckIcon className="absolute h-6 w-6 top-1 left-1 text-black"/>
                        )}
                    </div>
                    <p className="text-white">Step 2: Seller confirms payment and submits shipping invoice.</p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <div className={`relative h-8 w-8 rounded-full border border-white ${currentStep > 3 ? "bg-(--primary) border-0" : ""}`}>
                        {currentStep > 3 && (
                            <CheckIcon className="absolute h-6 w-6 top-1 left-1 text-black"/>
                        )}
                    </div>
                    <p className="text-white">Step 3: Buyer confirms product delivery.</p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <div className={`relative h-8 w-8 rounded-full border border-white ${currentStep > 4 ? "bg-(--primary) border-0" : ""}`}>
                        {currentStep > 4 && (
                            <CheckIcon className="absolute h-6 w-6 top-1 left-1 text-black"/>
                        )}
                    </div>
                    <p className="text-white">Step 4: Buyer and seller rate the transaction.</p>
                </div>
            </div>
        </>
    );
}