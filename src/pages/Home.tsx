import { useEffect, useState, FormEvent } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import { Post } from "../types";
import {
  Image as ImageIcon,
  Calendar,
  User,
  ArrowRight,
  Search,
  X,
} from "lucide-react";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Novos estados para a busca
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Função para carregar posts iniciais
  const loadDefaultPosts = () => {
    setLoading(true);
    api
      .get("/posts?sort=id,desc&size=10")
      .then((res) => {
        const data = res.data.content ? res.data.content : res.data;
        setPosts(data);
        setIsSearching(false);
      })
      .catch((err) => console.error("Erro ao carregar posts:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDefaultPosts();
  }, []);

  // Função que chama o seu Backend de Busca
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault(); // Evita recarregar a página

    if (!searchTerm.trim()) {
      loadDefaultPosts();
      return;
    }

    setLoading(true);
    try {
      // Chama o endpoint /search do seu Java
      const res = await api.get(`/posts/search?title=${searchTerm}`);
      const data = res.data.content ? res.data.content : res.data;
      setPosts(data);
      setIsSearching(true); // Ativa o modo de busca
    } catch (error) {
      console.error("Erro na busca:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para limpar a busca
  const clearSearch = () => {
    setSearchTerm("");
    loadDefaultPosts();
  };

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      {/* --- HEADER COM BUSCA --- */}
      <header className="bg-[#000914] text-white sticky top-0 z-50 border-b border-gray-800 shadow-md">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <div>
            <Link to="/" onClick={clearSearch}>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 cursor-pointer">
                PLAYREPORT<span className="text-blue-500">.</span>
              </h1>
            </Link>
          </div>

          {/* Barra de Pesquisa */}
          <div className="flex-1 max-w-md w-full mx-4">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Buscar notícias..."
                className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder-gray-600 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-gray-500 group-focus-within:text-blue-500 hover:text-white transition"
              >
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Botão Login */}
          <Link
            to="/login"
            className="text-xs font-bold bg-white text-[#000914] px-5 py-2.5 rounded hover:bg-blue-500 hover:text-white transition-all duration-300 uppercase tracking-wider shrink-0"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        {/* Feedback visual da busca */}
        {isSearching && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-700">
              Resultados para:{" "}
              <span className="text-blue-600">"{searchTerm}"</span>
            </h2>
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 text-sm text-red-600 hover:underline font-semibold"
            >
              <X size={16} /> Limpar busca
            </button>
          </div>
        )}

        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p>Carregando conteúdo...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              Nenhum resultado encontrado.
            </p>
            {isSearching && (
              <button
                onClick={clearSearch}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Ver todas as notícias
              </button>
            )}
          </div>
        ) : (
          <>
            {/* --- LAYOUT DE BUSCA (GRADE SIMPLES) --- */}
            {isSearching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition border border-gray-100 flex flex-col h-full"
                  >
                    <div className="h-48 overflow-hidden relative">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <ImageIcon size={32} />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 uppercase rounded">
                        {post.categoryName}
                      </span>
                    </div>
                    <div className="p-5 flex flex-col grow">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-grow">
                        {post.content}
                      </p>
                      <div className="text-xs text-gray-400 font-bold uppercase mt-auto">
                        {post.author?.name}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* --- LAYOUT PADRÃO (DESTAQUE + SIDEBAR) --- */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Destaque */}
                <div className="lg:col-span-8">
                  {featuredPost && (
                    <Link
                      to={`/post/${featuredPost.id}`}
                      className="group relative block h-[500px] w-full overflow-hidden rounded-none shadow-xl"
                    >
                      {featuredPost.imageUrl ? (
                        <img
                          src={featuredPost.imageUrl}
                          alt={featuredPost.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <ImageIcon size={64} className="text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-8 w-full">
                        <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 uppercase tracking-widest mb-3 inline-block">
                          {featuredPost.categoryName || "Destaque"}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-2 group-hover:text-blue-400 transition">
                          {featuredPost.title}
                        </h2>
                        <div className="flex items-center gap-4 text-gray-300 text-xs font-medium uppercase tracking-wide mt-4">
                          <span className="flex items-center gap-1">
                            <User size={14} /> {featuredPost.author?.name}
                          </span>
                          <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> Recente
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 flex flex-col gap-1">
                  <h3 className="text-[#000914] font-black text-xl mb-4 uppercase tracking-tighter flex items-center gap-2">
                    Últimas notícias{" "}
                  </h3>

                  {otherPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="group flex gap-4 bg-white p-4 hover:bg-gray-50 border-b border-gray-200 transition shadow-sm"
                    >
                      <div className="w-24 h-24 bg-gray-200 shrink-0 overflow-hidden relative">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-blue-600 text-[10px] font-bold uppercase mb-1">
                          {post.categoryName}
                        </span>
                        <h3 className="font-bold text-gray-900 leading-snug group-hover:text-blue-700 transition line-clamp-2">
                          {post.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-[#000914] text-gray-500 py-10 text-center border-t border-gray-800">
        <p className="text-sm font-medium">
          &copy; {new Date().getFullYear()} PLAYREPORT. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
