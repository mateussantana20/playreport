import { useEffect, useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Importe Link e useLocation
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
  Trash2,
  PlusCircle,
  LogOut,
  Edit,
  Image as ImageIcon,
  FileText,
  Users,
  Tag,
} from "lucide-react";
import { Post } from "../types";

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Para destacar o link ativo

  const fetchPosts = () => {
    api
      .get("/posts?sort=id,desc")
      .then((res) => {
        const data = res.data.content ? res.data.content : res.data;
        setPosts(data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este post?")) {
      try {
        await api.delete(`/posts/${id}`);
        fetchPosts();
      } catch (error) {
        alert("Erro ao deletar post.");
      }
    }
  };

  // Função auxiliar para estilo do link ativo
  const getLinkClass = (path: string) => {
    const base =
      "flex items-center gap-3 p-3 rounded transition cursor-pointer ";
    return location.pathname === path
      ? base + "bg-blue-600 text-white"
      : base + "text-gray-300 hover:bg-gray-700 hover:text-white";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* --- SIDEBAR ATUALIZADA --- */}
      <aside className="w-64 bg-[#000914] text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-black italic mb-8 tracking-tighter">
            ADMIN<span className="text-blue-500">.</span>
          </h2>

          <nav className="flex flex-col gap-2">
            <Link to="/admin" className={getLinkClass("/admin")}>
              <FileText size={20} /> Posts
            </Link>

            <Link
              to="/admin/categories"
              className={getLinkClass("/admin/categories")}
            >
              <Tag size={20} /> Categorias
            </Link>

            <Link to="/admin/users" className={getLinkClass("/admin/users")}>
              <Users size={20} /> Usuários
            </Link>
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition p-2"
        >
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* --- CONTEÚDO (POSTS) --- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Posts</h1>
          <button
            onClick={() => navigate("/admin/new-post")}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition font-bold"
          >
            <PlusCircle size={20} /> Novo Post
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 w-16 text-gray-500 font-semibold">Img</th>
                <th className="p-4 text-gray-500 font-semibold">Título</th>
                <th className="p-4 text-gray-500 font-semibold">Categoria</th>
                <th className="p-4 text-gray-500 font-semibold">Autor</th>
                <th className="p-4 text-center text-gray-500 font-semibold">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt="Capa"
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-800">
                    {post.title}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold uppercase text-gray-600 border border-gray-200">
                      {post.categoryName || "Geral"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {post.author?.name || "-"}
                  </td>
                  <td className="p-4 flex gap-3 justify-center items-center">
                    <button
                      onClick={() => navigate(`/admin/edit-post/${post.id}`)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
