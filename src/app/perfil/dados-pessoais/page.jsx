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
} from "lucide-react";

export default function DadosPessoais() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (!usuarioSalvo) {
      router.push("/login");
      return;
    }

    try {
      setUsuario(JSON.parse(usuarioSalvo));
    } catch (error) {
      localStorage.removeItem("usuarioLogado");
      router.push("/login");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  function excluirConta() {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita."
    );

    if (!confirmar) {
      return;
    }

    // Temporariamente apenas encerra a sessão.
    // Depois vamos conectar ao DELETE da API.

    localStorage.removeItem("usuarioLogado");

    router.push("/");
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Carregando...
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


        {/* DADOS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="space-y-5">

            {/* NOME */}

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <User size={20} className="text-gray-600" />
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
                <Mail size={20} className="text-gray-600" />
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
                <Phone size={20} className="text-gray-600" />
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
                <CreditCard size={20} className="text-gray-600" />
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

        </div>


        {/* EXCLUIR */}

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

      </div>

    </main>
  );
}