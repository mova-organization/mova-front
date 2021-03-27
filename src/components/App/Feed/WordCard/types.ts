export interface WordCardInterface {
  isLiked: boolean;
  isFavourited: boolean;
  wordname: string;
  isDisliked: boolean;
  meaning: string;
  description: string;
  tags: string[];
  createdAt: string;
  createdByUserId: string;
  className?: string;
  _id: string;
  likes: number;
  dislikes: number;
}
