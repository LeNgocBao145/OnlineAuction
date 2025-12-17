export interface Product {
  id: number;
  name: string;
  current_price: number;
  image_url?: string;
  time_left: string;
  bid_count?: number;
}