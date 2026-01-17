import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { Post } from "../types";

export default function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api
      .get(`/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch((err) => console.error("Erro ao buscar post:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <h2 className="text-2xl font-bold text-gray-700">
          Notícia não encontrada
        </h2>
        <Link to="/" className="text-blue-900 hover:underline">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* --- HEADER NOVO --- */}
      <header className="bg-[#000914] text-white py-4 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm uppercase hidden md:inline">
              Voltar
            </span>
          </Link>
          <Link
            to="/"
            className="text-xl md:text-2xl font-black uppercase tracking-tighter italic"
          >
            PLAYREPORT.COM.BR
          </Link>
          <div className="w-16"></div>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* --- CABEÇALHO DO ARTIGO --- */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-2">
              <Tag size={12} />
              {post.categoryName || "Geral"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-gray-500 text-sm border-b border-gray-100 pb-8">
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#000914]" />
              <span className="font-medium">
                {post.author?.name || "Redação"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#000914]" />
              <span>
                {post.dataPublication
                  ? new Date(post.dataPublication).toLocaleDateString("pt-BR")
                  : "Data desconhecida"}
              </span>
            </div>
          </div>
        </div>

        {/* --- IMAGEM DE CAPA --- */}
        {post.imageUrl && (
          <div className="w-full h-64 md:h-[500px] bg-gray-200 rounded-xl overflow-hidden mb-10 shadow-lg">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* --- CONTEÚDO DO TEXTO --- */}
        <div className="prose prose-lg max-w-none text-gray-800 leading-loose whitespace-pre-line text-lg">
          {post.content}
        </div>
      </article>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 border-t mt-12 py-12 text-center">
        <div className="container mx-auto px-4">
          <p className="text-gray-500 mb-4">Gostou dessa notícia?</p>
          <Link
            to="/"
            className="inline-block bg-[#000914] text-white px-8 py-3 rounded font-bold hover:bg-gray-800 transition"
          >
            Ler mais notícias
          </Link>
        </div>
      </footer>
    </div>
  );
}
