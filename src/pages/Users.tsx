import { useEffect, useState, useContext, FormEvent, ChangeEvent } from "react";
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
  User,
  Edit,
  X,
} from "lucide-react";
import { Admin } from "../types";

export default function UsersPage() {
  const [users, setUsers] = useState<Admin[]>([]);
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  // Estados do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");

  // Estado de Controle de Edição
  const [editingId, setEditingId] = useState<number | null>(null); // <--- NOVO

  // Estado da Imagem
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    api
      .get("/admins")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.content || [];
        setUsers(data);
      })
      .catch((err) => console.error("Erro ao listar usuários:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // --- FUNÇÃO PARA ENTRAR NO MODO DE EDIÇÃO ---
  const handleEdit = (user: Admin) => {
    setEditingId(user.id); // Marca que estamos editando este ID
    setName(user.name);
    setEmail(user.email);
    setBio(user.bio || "");
    setPreviewUrl(user.profilePicture || null);
    setPassword(""); // Limpa a senha (só preenche se quiser trocar)

    // Rola a página para cima para ver o formulário
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- FUNÇÃO PARA CANCELAR EDIÇÃO ---
  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setBio("");
    setPassword("");
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // JSON body
      const adminData = { name, email, password, bio };
      const jsonBlob = new Blob([JSON.stringify(adminData)], {
        type: "application/json",
      });
      formData.append("admin", jsonBlob);

      // File (se tiver)
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        // Validação apenas se for CRIAÇÃO (editingId é null)
        if (!editingId && !previewUrl) {
          alert("Por favor, selecione uma foto de perfil.");
          setLoading(false);
          return;
        }
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editingId) {
        // --- MODO ATUALIZAÇÃO (PUT) ---
        await api.put(`/admins/${editingId}`, formData, config);
        alert("Usuário atualizado com sucesso!");
        handleCancelEdit(); // Sai do modo de edição
      } else {
        // --- MODO CRIAÇÃO (POST) ---
        await api.post("/admins", formData, config);
        alert("Usuário cadastrado com sucesso!");
        handleCancelEdit(); // Limpa o form
      }

      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar usuário.");
    } finally {
      setLoading(false);
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
          Gerenciar Usuários
        </h1>

        {/* Formulário */}
        <div
          className={`p-6 rounded-lg shadow-sm border mb-8 transition-colors ${editingId ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">
              {editingId
                ? `Editando Usuário #${editingId}`
                : "Cadastrar Novo Administrador"}
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Upload de Foto */}
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-500 transition cursor-pointer group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-gray-400 group-hover:text-blue-500" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-bold text-gray-700">Foto de Perfil</p>
                <p>
                  {editingId
                    ? "Clique para alterar (opcional)"
                    : "Clique para enviar (Obrigatório)"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nome Completo"
                required
                className="p-3 border border-gray-300 rounded focus:border-blue-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                required
                className="p-3 border border-gray-300 rounded focus:border-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder={
                  editingId
                    ? "Nova Senha (Deixe em branco para manter)"
                    : "Senha"
                }
                required={!editingId} // Obrigatório apenas se NÃO estiver editando
                className="p-3 border border-gray-300 rounded focus:border-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="text"
                placeholder="Bio (Opcional)"
                className="p-3 border border-gray-300 rounded focus:border-blue-500 outline-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-6 py-2 rounded font-bold hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                {loading ? (
                  "Salvando..."
                ) : (
                  <>
                    <Save size={18} /> {editingId ? "Atualizar" : "Cadastrar"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 w-16">Foto</th>
                <th className="p-4 text-gray-500 font-semibold">Nome</th>
                <th className="p-4 text-gray-500 font-semibold">Email</th>
                <th className="p-4 text-center text-gray-500 font-semibold w-24">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className={`border-b hover:bg-gray-50 transition ${editingId === u.id ? "bg-blue-50" : ""}`}
                >
                  <td className="p-4">
                    {u.profilePicture ? (
                      <img
                        src={u.profilePicture}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <User size={16} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-bold text-gray-800">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4 flex gap-2 justify-center">
                    {/* BOTÃO EDITAR */}
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition"
                      title="Editar Usuário"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      className="text-gray-300 cursor-not-allowed p-1"
                      title="Excluir desabilitado"
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
