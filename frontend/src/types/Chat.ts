export interface Message {
  id: number;
  product: number;
  sender: number;
  sender_name: string;
  content: string | null;
  image: string | null;
  type: 'text' | 'image' | 'text_and_image';
  created_at: string;
  isOwn?: boolean;
}

export interface MessageThread {
  items: Message[];
  hasMore: boolean;
}
