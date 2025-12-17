import {useForm} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useSearchStore from '@/stores/searchStore';

export default function SearchFilter() {
    const filterSchema = z.object({
        keyword: z.string().optional(),
        timeFrom: z.string().optional(),
        timeTo: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        incoming: z.boolean().optional(),
        bidding: z.boolean().optional(),
        sold: z.boolean().optional(),
    }).refine(
        (data) =>
        !data.maxPrice ||
        !data.minPrice ||
        Number(data.maxPrice) >= Number(data.minPrice),
        {
        message: "Max price cannot be less than min price",
        path: ["maxPrice"], 
        }
    ).refine(
        (data) =>
        !data.timeTo || !data.timeFrom || data.timeTo >= data.timeFrom,
        {
        message: "End time cannot be before start time",
        path: ["timeTo"], 
        }
    );

    const {register, handleSubmit, formState: { errors }, reset} = useForm({
        resolver: zodResolver(filterSchema)
    });

    const { filterProducts, loading } = useSearchStore();

    const applyFilters = async (data: any) => {
        try {
            const states = [];
            if (data.incoming) states.push("incoming");
            if (data.bidding) states.push("bidding");
            if (data.sold) states.push("sold");

            await filterProducts({
                keyword: data.keyword || undefined,
                startDate: data.timeFrom || undefined,
                endDate: data.timeTo || undefined,
                minPrice: data.minPrice ? parseFloat(data.minPrice) : undefined,
                maxPrice: data.maxPrice ? parseFloat(data.maxPrice) : undefined,
                states: states.length > 0 ? states : undefined,
                page: 1,
                limit: 10,
            });
        } catch (error) {
            console.error("Error applying filters:", error);
        }
    }

    return (
        <div className="border border-white/10 rounded-xl bg-(--third) w-full p-4 mt-4">
            <h1 className="font-bold font-inter text-(--primary) text-3xl">Filter</h1>
            <form onSubmit={handleSubmit(applyFilters)} className="mt-4 flex flex-col gap-4">
                <div className='flex flex-col'>
                    <label htmlFor='keyword' className='text-white'>Search</label>
                    <input type="text" id="keyword" {...register('keyword')} 
                    placeholder="Search products..."
                    className='border border-white/10 bg-(--secondary) text-white/80 rounded-lg h-10 mt-1 pl-2'
                    />
                </div>
                <div className='flex flex-col'>
                    <label htmlFor='timeFrom' className='text-white'>From</label>
                    <input type="datetime-local" id="timeFrom" {...register('timeFrom')} 
                    className='border border-white/10 bg-(--secondary) text-white/80 rounded-lg h-10 mt-1 pl-2'
                    />
                </div>
                <div className='flex flex-col'>
                    <label htmlFor='timeTo' className='text-white'>To</label>
                    <input type="datetime-local" id="timeTo" {...register('timeTo')} 
                    className='border border-white/10 bg-(--secondary) text-white/80 rounded-lg h-10 mt-1 pl-2' 
                    />
                </div>
                {errors.timeTo && <p className='text-red-400'>{errors.timeTo.message}</p>}
                <h2 className='text-white text-2xl'>Price Range</h2>
                <div className='grid grid-cols-2 gap-4'>
                    <div className='relative flex flex-col'>
                        <label htmlFor='minPrice' className='text-white'>Min</label>
                        <input type="number" id="minPrice" {...register('minPrice')} 
                        min={0}
                        className='border border-white/10 bg-(--secondary) text-white/80 rounded-lg h-10 mt-1 pl-5'
                        />
                        <span className="absolute left-2 top-1/2 text-gray-500">$</span>
                    </div>
                    <div className='relative flex flex-col'>
                        <label htmlFor='maxPrice' className='text-white'>Max</label>
                        <input type="number" id="maxPrice" {...register('maxPrice')} 
                        min={0}
                        className='border border-white/10 bg-(--secondary) text-white/80 rounded-lg h-10 mt-1 pl-5'
                        />
                        <span className="absolute left-2 top-1/2 text-gray-500">$</span>
                    </div>
                    {errors.maxPrice && <p className='text-red-400 col-span-2'>{errors.maxPrice.message}</p>}
                </div>
                <h2 className='text-white text-2xl'>Status</h2>
                <div>
                    <input type="checkbox" id="incoming" {...register('incoming')} />
                    <label htmlFor='incoming' className='text-white ml-1'>Incoming</label>
                </div>
                <div>
                    <input type="checkbox" id="bidding" {...register('bidding')} />
                    <label htmlFor='bidding' className='text-white ml-1'>Bidding</label>
                </div>
                <div>
                    <input type="checkbox" id="sold" {...register('sold')} />
                    <label htmlFor='sold' className='text-white ml-1'>Sold</label>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                    <button type="button" onClick={() => reset()} className="mt-4 bg-white/10 text-white px-4 py-2 rounded-lg font-semibold">Reset</button>
                    <button type="submit" disabled={loading} className="mt-4 bg-(--primary) text-(--secondary) px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Loading..." : "Apply Filters"}
                    </button>
                </div>
            </form>
        </div>
    )
}



