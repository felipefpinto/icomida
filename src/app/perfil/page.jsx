"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function Perfil() {
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
      const usuarioLogado = JSON.parse(usuarioSalvo);

      setUsuario(usuarioLogado);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);

      localStorage.removeItem("usuarioLogado");

      router.push("/login");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  function sair() {
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

      <div className="mx-auto w-full max-w-4xl">

        {/* TÍTULO */}

        <div className="mb-8">

        <div className="flex items-center justify-between">

            <h1 className="text-3xl font-bold text-gray-900">
            Minha conta
            </h1>

            <Link
            href="/"
            className="
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
            Voltar para o início
            </Link>

        </div>

        <p className="mt-2 text-sm text-gray-500">
            Gerencie seus dados e preferências.
        </p>

        </div>

        {/* USUÁRIO */}

        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div
            className="
              flex
              h-16
              w-16
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-red-600
            "
          >
            <User size={30} />
          </div>

          <div className="min-w-0">

            <h2 className="truncate text-lg font-bold text-gray-900">
              {usuario.nome}
            </h2>

            <p className="mt-1 truncate text-sm text-gray-500">
              {usuario.email}
            </p>

          </div>

        </div>


        {/* OPÇÕES */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* DADOS PESSOAIS */}

          <Link
            href="/perfil/dados-pessoais"
            className="
              flex
              items-center
              gap-4
              border-b
              border-gray-100
              p-5
              transition
              hover:bg-gray-50
            "
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <User size={21} />
            </div>

            <div className="flex-1">

              <h3 className="text-sm font-semibold text-gray-900">
                Dados pessoais
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Nome, e-mail, telefone, CPF e conta
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-400"
            />

          </Link>


          {/* ENDEREÇOS */}

          <Link
            href="/perfil/enderecos"
            className="
              flex
              items-center
              gap-4
              border-b
              border-gray-100
              p-5
              transition
              hover:bg-gray-50
            "
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <MapPin size={21} />
            </div>

            <div className="flex-1">

              <h3 className="text-sm font-semibold text-gray-900">
                Meus endereços
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Gerencie seus endereços de entrega
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-400"
            />

          </Link>


          {/* PEDIDOS */}

          <Link
            href="/perfil/pedidos"
            className="
              flex
              items-center
              gap-4
              border-b
              border-gray-100
              p-5
              transition
              hover:bg-gray-50
            "
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <ShoppingBag size={21} />
            </div>

            <div className="flex-1">

              <h3 className="text-sm font-semibold text-gray-900">
                Meus pedidos
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Consulte seus pedidos anteriores
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-400"
            />

          </Link>


          {/* FAVORITOS */}

          <Link
            href="/perfil/favoritos"
            className="
              flex
              items-center
              gap-4
              border-b
              border-gray-100
              p-5
              transition
              hover:bg-gray-50
            "
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <Heart size={21} />
            </div>

            <div className="flex-1">

              <h3 className="text-sm font-semibold text-gray-900">
                Favoritos
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Restaurantes e pratos favoritos
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-400"
            />

          </Link>


          {/* CONFIGURAÇÕES */}

          <Link
            href="/perfil/configuracoes"
            className="
              flex
              items-center
              gap-4
              p-5
              transition
              hover:bg-gray-50
            "
          >

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <Settings size={21} />
            </div>

            <div className="flex-1">

              <h3 className="text-sm font-semibold text-gray-900">
                Configurações
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Preferências e configurações da conta
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-400"
            />

          </Link>

        </div>


        {/* SAIR */}

        <button
          type="button"
          onClick={sair}
          className="
            mt-6
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-gray-200
            bg-white
            text-sm
            font-semibold
            text-gray-700
            shadow-sm
            transition
            hover:bg-gray-50
          "
        >

          <LogOut size={19} />

          Sair da conta

        </button>

      </div>

    </main>
  );
}