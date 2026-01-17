import { useEffect, useState, useContext, FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
  Trash2,
  LogOut,
  FileText,
  Users,
  Tag,
  Save,
  Edit,
  X,
} from "lucide-react";
import { Category } from "../types";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  // Estados do Formulário
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null); // Se null = Criando, Se número = Editando

  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const fetchCategories = () => {
    api.get("/categories").then((res) => {
      const data = res.data.content ? res.data.content : res.data;
      setCategories(data);
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- MODO EDIÇÃO ---
  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Sobe a tela
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
  };

  // --- SUBMIT (CRIA OU ATUALIZA) ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        // PUT (Atualizar)
        await api.put(`/categories/${editingId}`, { name });
        alert("Categoria atualizada com sucesso!");
      } else {
        // POST (Criar)
        await api.post("/categories", { name });
        alert("Categoria criada com sucesso!");
      }

      handleCancelEdit(); // Limpa o form e sai do modo edição
      fetchCategories(); // Recarrega a tabela
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar categoria.");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      confirm("Tem certeza? Os posts dessa categoria ficarão 'Sem Categoria'.")
    ) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error) {
        console.error(error);
        alert("Erro ao deletar categoria.");
      }
    }
  };

  const getLinkClass = (path: string) => {
    const base =
      "flex items-center gap-3 p-3 rounded transition cursor-pointer ";
    return location.pathname === path
      ? base + "bg-blue-600 text-white"
      : base + "text-gray-300 hover:bg-gray-700 hover:text-white";
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
          className="flex items-center gap-2 text-red-400 hover:text-red-300 p-2"
        >
          <LogOut size={20} /> Sair
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Gerenciar Categorias
        </h1>

        {/* Formulário Inteligente (Criação/Edição) */}
        <div
          className={`p-6 rounded-lg shadow-sm border mb-8 transition-colors ${editingId ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">
              {editingId
                ? `Editando Categoria #${editingId}`
                : "Adicionar Nova Categoria"}
            </h2>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="text-red-600 text-sm flex items-center gap-1 hover:underline"
              >
                <X size={16} /> Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              placeholder="Nome da categoria (ex: Tecnologia)"
              className="flex-1 p-3 border border-gray-300 rounded focus:border-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={18} /> {editingId ? "Atualizar" : "Salvar"}
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-gray-500 font-semibold w-20">ID</th>
                <th className="p-4 text-gray-500 font-semibold">Nome</th>
                <th className="p-4 text-gray-500 font-semibold">Slug (URL)</th>
                <th className="p-4 text-center text-gray-500 font-semibold w-32">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className={`border-b hover:bg-gray-50 transition ${editingId === cat.id ? "bg-blue-50" : ""}`}
                >
                  <td className="p-4 text-gray-500">{cat.id}</td>
                  <td className="p-4 font-bold text-gray-800">{cat.name}</td>
                  <td className="p-4 text-gray-500 italic text-sm">
                    {cat.slug}
                  </td>
                  <td className="p-4 flex gap-2 justify-center">
                    {/* Botão EDITAR */}
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>

                    {/* Botão EXCLUIR */}
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
