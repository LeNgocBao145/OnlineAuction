export default function Step1() {
    return (
      <div className="border border-white/10 rounded-lg p-4 bg-(--third)">
        <h2 className="text-(--primary) text-xl font-bold mb-4">
          Step 1: Waiting bidder sends payment        
        </h2>
  
        <div className="grid lg:grid-cols-[1fr_2fr] grid-cols-1 gap-4">
          {/* Invoice placeholder */}
          <div className="mt-4 w-full h-[300px] rounded-md border border-white/10 flex items-center justify-center text-white/40">
            No invoice image
          </div>
  
          {/* Info placeholder */}
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-white/60">
              Bidder: <span className="text-white">-</span>
            </p>
            <p className="text-white/60">
              Shipping Address: <span className="text-white">-</span>
            </p>
          </div>
  
          <p className="text-red-400 col-span-full">
            Warning: Please verify the payment details before confirming. This action cannot be undone.
          </p>
  
          <button
            type="button"
            disabled
            className="bg-(--primary) text-black px-4 py-2 rounded-md col-span-full disabled:opacity-60"
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }
  