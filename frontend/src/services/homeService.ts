import api from "@/lib/axios";

const homeService = {
  getHomeData: async () => {
    const res = await api.get("/");
    return res.data;
  },
};

export default homeService;
