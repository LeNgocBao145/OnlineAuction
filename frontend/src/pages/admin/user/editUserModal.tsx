import { useState } from "react";
import { toast } from "sonner";
import adminService, { type AdminUser } from "@/services/adminService";

export default function EditUserModal({
    setEditingUser, userData, onUpdate
} : {
    setEditingUser: React.Dispatch<React.SetStateAction<boolean>>,
    userData: AdminUser,
    onUpdate: () => void
}) {
    const [name, setName] = useState(userData.name);
    const [email, setEmail] = useState(userData.email);
    const [birthdate, setBirthdate] = useState(userData.birthdate?.split('T')[0] || '');
    const [address, setAddress] = useState(userData.address);
    const [role, setRole] = useState(userData.role);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name || !email || !birthdate || !address || !role) {
            toast.error("All fields are required");
            return;
        }
        try {
            setIsSubmitting(true);
            await adminService.updateUser(userData.id, {
                name,
                email,
                birthdate,
                address,
                role
            });
            toast.success("User updated successfully");
            onUpdate();
            setEditingUser(false);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update user");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="backdrop-filter backdrop-blur-sm fixed inset-0 flex justify-center items-center z-99999">
            <div className="bg-(--third) border border-white/10 rounded-lg lg:w-1/2 w-9/10 p-4">
                <div className="flex flex-col justify-start items-center gap-4 w-full p-8">
                    <h2 className="text-(--primary) font-bold text-2xl text-center">Edit User Information</h2>
                    <p className="text-white/60 text-center">Update the user's basic information.</p>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Name <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Enter name..." value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"/>
                    </div>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Email <span className="text-red-500">*</span></label>
                        <input type="email" placeholder="Enter email..." value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"/>
                    </div>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                        <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"/>
                    </div>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Address <span className="text-red-500">*</span></label>
                        <input type="text" placeholder="Enter address..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white"/>
                    </div>
                    <div className="w-full">
                        <label className="text-white/80 mb-2">Role <span className="text-red-500">*</span></label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 rounded-md mt-2 bg-(--secondary) border border-white/10 text-white">
                            <option value="bidder">Bidder</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="w-full flex justify-between items-center gap-4">
                        <button className="bg-(--secondary) text-white rounded-md p-2 w-full" onClick={() => setEditingUser(false)}>Cancel</button>
                        <button 
                            className="bg-(--primary) text-black rounded-md p-2 w-full disabled:opacity-50" 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}