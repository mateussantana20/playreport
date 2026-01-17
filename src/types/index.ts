export interface Category {
  id: number;
  name: string;
  slug?: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  categoryName: string;
  categorySlug: string;
  categoryId?: number; // <--- ADICIONE ISSO
  author?: Admin;
  dataPublication?: string;
}
