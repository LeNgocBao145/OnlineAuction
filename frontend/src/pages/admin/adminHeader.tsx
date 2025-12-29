import { useNavigate } from "react-router";

export default function AdminHeader({activeTab}: {activeTab: string}) {
    const navigate = useNavigate();
    
    return (
        <>
            <h1 className = "text-(--primary) text-2xl font-bold mt-4">Admin Management Panel</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 h-20 mt-4 border border-white/10 rounded-t-lg">
                <button className={`border-r lg:border-b-0 border-b border-white/10 ${activeTab === 'user' ? 'bg-(--primary) text-black font-bold rounded-tl-lg' : 'bg-(--third) text-white/60'}`} onClick={() => navigate('/admin/user')}
                >User</button>
                <button className={`lg:border-r lg:border-b-0 border-b lg:rounded-none rounded-tr-lg border-white/10 ${activeTab === 'product' ? 'bg-(--primary) text-black font-bold' : 'bg-(--third) text-white/60'}`} onClick={() => navigate('/admin/product')}
                >Product</button>
                <button className={`border-r border-white/10 ${activeTab === 'category' ? 'bg-(--primary) text-black font-bold' : 'bg-(--third) text-white/60'}`} onClick={() => navigate('/admin/category')}
                >Category</button>
                <button className={`lg:rounded-tr-lg rounded-none ${activeTab === 'requests' ? 'bg-(--primary) text-black font-bold' : 'bg-(--third) text-white/60'}`} onClick={() => navigate('/admin/requests')}
                >Requests</button>
            </div>
        </>
    );
}