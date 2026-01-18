import ReactQuill from "react-quill-new"; // <--- MUDANÇA AQUI (Biblioteca Nova)
import "react-quill-new/dist/quill.snow.css"; // <--- MUDANÇA AQUI (CSS Novo)
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft,
  Save,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { Post, Category } from "../types";

// --- CONFIGURAÇÕES DO EDITOR ---
const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
];
// ------------------------------

export default function PostForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Estados dos campos
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // Estados de Imagem
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Dados auxiliares
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Carregar lista de categorias
    api.get("/categories").then((res) => {
      const data = res.data.content ? res.data.content : res.data;
      setCategories(data);
    });

    // 2. Se for edição, carregar os dados do post
    if (isEditing) {
      api.get(`/posts/${id}`).then((res) => {
        const post: Post = res.data;
        setTitle(post.title);
        setContent(post.content); // O Quill recebe o HTML aqui
        if (post.categoryId) setCategoryId(post.categoryId);
        if (post.imageUrl) {
          setPreviewUrl(post.imageUrl);
          setImageUrlInput(post.imageUrl);
          setImageMode(post.imageUrl.startsWith("http") ? "url" : "upload");
        }
      });
    }
  }, [id, isEditing]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrlInput(url);
    setPreviewUrl(url);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      const postData: any = {
        title,
        content, // Envia o HTML gerado pelo editor
        category: categoryId ? { id: categoryId } : null,
      };

      if (imageMode === "url" && imageUrlInput) {
        postData.imageUrl = imageUrlInput;
      }

      const jsonBlob = new Blob([JSON.stringify(postData)], {
        type: "application/json",
      });
      formData.append("post", jsonBlob);

      if (imageMode === "upload" && selectedFile) {
        formData.append("file", selectedFile);
      }

      if (isEditing) {
        await api.put(`/posts/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Post atualizado!");
      } else {
        await api.post("/posts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Post criado!");
      }
      navigate("/admin");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <h1 className="text-2xl font-black text-[#000914]">
            {isEditing ? "Editar Notícia" : "Nova Notícia"}
          </h1>
          <Link
            to="/admin"
            className="text-gray-500 hover:text-red-900 flex items-center gap-2 text-sm font-bold uppercase"
          >
            <ArrowLeft size={18} /> Cancelar
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Título da Matéria
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded focus:border-blue-600 outline-none text-lg"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Categoria
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded focus:border-blue-600 outline-none bg-white"
              value={categoryId || ""}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              <option value="">Selecione uma categoria...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Area da Imagem (Upload ou URL) */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label className="block text-gray-700 font-bold mb-4">
              Imagem de Capa
            </label>
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setImageMode("upload")}
                className={`flex-1 py-2 flex items-center justify-center gap-2 rounded transition font-bold text-sm uppercase ${imageMode === "upload" ? "bg-[#000914] text-white" : "bg-white text-gray-500 border"}`}
              >
                <Upload size={16} /> Enviar Arquivo
              </button>
              <button
                type="button"
                onClick={() => setImageMode("url")}
                className={`flex-1 py-2 flex items-center justify-center gap-2 rounded transition font-bold text-sm uppercase ${imageMode === "url" ? "bg-[#000914] text-white" : "bg-white text-gray-500 border"}`}
              >
                <LinkIcon size={16} /> Link Externo
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 w-full">
                {imageMode === "upload" ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500 text-sm">
                      Clique para selecionar
                    </p>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full p-3 border border-gray-300 rounded"
                    value={imageUrlInput}
                    onChange={handleUrlChange}
                  />
                )}
              </div>
              <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden border flex items-center justify-center shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <ImageIcon size={24} className="text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* --- EDITOR DE TEXTO RICO --- */}
          <div className="mb-12">
            <label className="block text-gray-700 font-bold mb-2">
              Conteúdo da Notícia
            </label>
            <div className="h-80 bg-white pb-10 sm:pb-0">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="h-full"
                placeholder="Escreva sua notícia aqui..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save size={20} /> {loading ? "Salvando..." : "Publicar Notícia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
