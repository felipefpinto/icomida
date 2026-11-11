"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";

export default function DadosPessoais() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    celular: "",
    cpf: "",
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  /*
   * BUSCAR USUÁRIO
   */

  useEffect(() => {
    async function carregarUsuario() {
      const usuarioSalvo = localStorage.getItem("usuarioLogado");

      if (!usuarioSalvo) {
        router.push("/login");
        return;
      }

      try {
        const usuarioLogado = JSON.parse(usuarioSalvo);

        if (!usuarioLogado.id_usuario) {
          throw new Error("ID do usuário não encontrado.");
        }

        const response = await fetch(
          `http://127.0.0.1:8000/usuario/${usuarioLogado.id_usuario}`
        );

        if (!response.ok) {
          throw new Error("Não foi possível buscar o usuário.");
        }

        const dadosUsuario = await response.json();

        setUsuario(dadosUsuario);

        setFormulario({
          nome: dadosUsuario.nome || "",
          email: dadosUsuario.email || "",
          celular: dadosUsuario.celular || "",
          cpf: dadosUsuario.cpf || "",
        });
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);

        setErro("Não foi possível carregar seus dados.");

      } finally {
        setCarregando(false);
      }
    }

    carregarUsuario();
  }, [router]);

  /*
   * ALTERAR CAMPOS DO FORMULÁRIO
   */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  /*
   * CANCELAR EDIÇÃO
   */

  function cancelarEdicao() {
    setFormulario({
      nome: usuario.nome || "",
      email: usuario.email || "",
      celular: usuario.celular || "",
      cpf: usuario.cpf || "",
    });

    setErro("");
    setSucesso("");
    setEditando(false);
  }

  /*
   * SALVAR ALTERAÇÕES
   */

  async function salvarAlteracoes(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/usuario/${usuario.id_usuario}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: formulario.nome,
            email: formulario.email,
            celular: formulario.celular,
            cpf: formulario.cpf || null,
          }),
        }
      );

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(
          dados.detail || "Não foi possível atualizar seus dados."
        );
      }

      /*
       * Atualiza o estado da página
       */

      setUsuario(dados);

      setFormulario({
        nome: dados.nome || "",
        email: dados.email || "",
        celular: dados.celular || "",
        cpf: dados.cpf || "",
      });

      /*
       * Atualiza o usuário salvo no localStorage
       */

      const usuarioLocalStorage = {
        id_usuario: dados.id_usuario,
        nome: dados.nome,
        email: dados.email,
      };

      localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuarioLocalStorage)
      );

      setSucesso("Dados atualizados com sucesso.");
      setEditando(false);

    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);

      setErro(error.message || "Erro ao atualizar seus dados.");

    } finally {
      setSalvando(false);
    }
  }

  /*
   * EXCLUIR CONTA
   */

  async function excluirConta() {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita."
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/usuario/${usuario.id_usuario}`,
        {
          method: "DELETE",
        }
      );

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(
          dados.detail || "Não foi possível excluir sua conta."
        );
      }

      localStorage.removeItem("usuarioLogado");

      router.push("/");

    } catch (error) {
      console.error("Erro ao excluir conta:", error);

      setErro(
        error.message || "Não foi possível excluir sua conta."
      );
    }
  }

  /*
   * CARREGAMENTO
   */

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Carregando seus dados...
        </p>
      </main>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto w-full max-w-3xl">

        {/* VOLTAR */}

        <Link
          href="/perfil"
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            text-gray-600
            transition
            hover:text-red-600
          "
        >
          <ArrowLeft size={18} />
          Minha conta
        </Link>


        {/* TÍTULO */}

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-900">
            Dados pessoais
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Consulte e gerencie suas informações pessoais.
          </p>

        </div>


        {/* MENSAGEM DE SUCESSO */}

        {sucesso && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {sucesso}
          </div>
        )}


        {/* MENSAGEM DE ERRO */}

        {erro && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {erro}
          </div>
        )}


        {/* DADOS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          {!editando ? (

            <>
              {/* VISUALIZAÇÃO */}

              <div className="space-y-6">

                {/* NOME */}

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <User
                      size={20}
                      className="text-gray-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Nome completo
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {usuario.nome}
                    </p>

                  </div>

                </div>


                {/* EMAIL */}

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Mail
                      size={20}
                      className="text-gray-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      E-mail
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {usuario.email}
                    </p>

                  </div>

                </div>


                {/* CELULAR */}

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Phone
                      size={20}
                      className="text-gray-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Celular
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {usuario.celular || "Não informado"}
                    </p>

                  </div>

                </div>


                {/* CPF */}

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <CreditCard
                      size={20}
                      className="text-gray-600"
                    />
                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      CPF
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {usuario.cpf || "Não informado"}
                    </p>

                  </div>

                </div>

              </div>


              {/* EDITAR */}

              <button
                type="button"
                onClick={() => {
                  setErro("");
                  setSucesso("");
                  setEditando(true);
                }}
                className="
                  mt-8
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-red-600
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                <Pencil size={18} />
                Editar informações
              </button>

            </>

          ) : (

            <form onSubmit={salvarAlteracoes}>

              <div className="space-y-5">

                {/* NOME */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nome completo
                  </label>

                  <input
                    type="text"
                    name="nome"
                    value={formulario.nome}
                    onChange={handleChange}
                    required
                    className="
                      h-11
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-red-500
                      focus:ring-2
                      focus:ring-red-100
                    "
                  />

                </div>


                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    E-mail
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={handleChange}
                    required
                    className="
                      h-11
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-red-500
                      focus:ring-2
                      focus:ring-red-100
                    "
                  />

                </div>


                {/* CELULAR */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Celular
                  </label>

                  <input
                    type="text"
                    name="celular"
                    value={formulario.celular}
                    onChange={handleChange}
                    required
                    className="
                      h-11
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-red-500
                      focus:ring-2
                      focus:ring-red-100
                    "
                  />

                </div>


                {/* CPF */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    CPF
                  </label>

                  <input
                    type="text"
                    name="cpf"
                    value={formulario.cpf}
                    onChange={handleChange}
                    className="
                      h-11
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-4
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-red-500
                      focus:ring-2
                      focus:ring-red-100
                    "
                  />

                </div>

              </div>


              {/* BOTÕES */}

              <div className="mt-8 flex gap-3">

                <button
                  type="button"
                  onClick={cancelarEdicao}
                  disabled={salvando}
                  className="
                    flex
                    h-12
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    text-sm
                    font-semibold
                    text-gray-700
                    transition
                    hover:bg-gray-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <X size={18} />
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={salvando}
                  className="
                    flex
                    h-12
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-red-600
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-red-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Save size={18} />

                  {salvando
                    ? "Salvando..."
                    : "Salvar alterações"}

                </button>

              </div>

            </form>

          )}

        </div>


        {/* EXCLUIR CONTA */}

        {!editando && (
          <div className="mt-6 rounded-2xl border border-red-100 bg-white p-6">

            <h2 className="text-sm font-bold text-gray-900">
              Excluir minha conta
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Ao excluir sua conta, seus dados serão removidos
              permanentemente. Essa ação não poderá ser desfeita.
            </p>

            <button
              type="button"
              onClick={excluirConta}
              className="
                mt-5
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-lg
                border
                border-red-200
                px-5
                text-sm
                font-semibold
                text-red-600
                transition
                hover:bg-red-50
              "
            >
              <Trash2 size={18} />
              Excluir minha conta
            </button>

          </div>
        )}

      </div>

    </main>
  );
}