"use client";

import {useEffect, useState } from "react";
import Link from "next/link";

import {
 Search,
  MapPin,
  ShoppingBag,
  User,
  ChevronDown,
  Menu,
  X,
  Heart,
  Clock,
  LogOut,
} from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [menuEnderecoAberto, setMenuEnderecoAberto] = useState(false);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  useEffect(() => {
  async function carregarEnderecos() {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (!usuarioSalvo) {
      setEnderecos([]);
      setEnderecoSelecionado(null);
      return;
    }

    try {
      const usuarioLogado = JSON.parse(usuarioSalvo);

      if (!usuarioLogado.id_usuario) {
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:8000/usuario/${usuarioLogado.id_usuario}/enderecos/`
      );

      if (!response.ok) {
        throw new Error("Não foi possível buscar os endereços.");
      }

      const dados = await response.json();

      setEnderecos(dados);

      // Busca o ID salvo anteriormente
      const enderecoSelecionadoId = localStorage.getItem(
        "enderecoSelecionadoId"
      );

      let enderecoFinal = null;

      // Procura o endereço salvo
      if (enderecoSelecionadoId) {
        enderecoFinal = dados.find(
          (endereco) =>
            endereco.id_endereco ===
            Number(enderecoSelecionadoId)
        );
      }

      // Se não houver endereço salvo, procura o principal
      if (!enderecoFinal) {
        enderecoFinal = dados.find(
          (endereco) => endereco.ativo === true
        );
      }

      // Se não houver principal, usa o primeiro
      if (!enderecoFinal && dados.length > 0) {
        enderecoFinal = dados[0];
      }

      if (enderecoFinal) {
        setEnderecoSelecionado(enderecoFinal);

        localStorage.setItem(
          "enderecoSelecionadoId",
          enderecoFinal.id_endereco.toString()
        );
      }
    } catch (error) {
      console.error(
        "Erro ao carregar endereços:",
        error
      );
    }
  }

  carregarEnderecos();
}, [usuario]);

  function sair() {
  localStorage.removeItem("usuarioLogado");

  setUsuario(null);
  setPerfilOpen(false);

  window.location.href = "/";
  }

  function selecionarEndereco(endereco) {
  setEnderecoSelecionado(endereco);

  localStorage.setItem(
    "enderecoSelecionadoId",
    endereco.id_endereco.toString()
  );

  setMenuEnderecoAberto(false);
}

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">

      {/* HEADER PRINCIPAL */}

      <div className="mx-auto flex min-h-[72px] max-w-[1400px] items-center gap-4 px-6">

        {/* LOGO */}

        <a
          href="/"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="text-3xl">
            🍔
          </span>

          <span className="text-2xl font-extrabold tracking-tight text-red-600">
            iComida
          </span>
        </a>


        {/* LOCALIZAÇÃO */}

{/* LOCALIZAÇÃO */}
<div className="relative hidden lg:block">

  <button
    type="button"
    onClick={() =>
      setMenuEnderecoAberto(!menuEnderecoAberto)
    }
    className="
      flex
      items-center
      gap-2
      rounded-lg
      px-2
      py-2
      transition
      hover:bg-gray-100
    "
  >

    <MapPin
      size={21}
      className="text-red-600"
    />

    <div className="flex max-w-[180px] flex-col items-start">

      <span className="text-[11px] text-gray-500">
        Entregar em
      </span>

      <strong className="max-w-[180px] truncate text-xs font-semibold text-gray-800">
      {enderecoSelecionado
    ? enderecoSelecionado.apelido || "Endereço"
    : "Selecionar endereço"}
      </strong>

    </div>

    <ChevronDown
      size={16}
      className={`
        text-gray-500
        transition-transform
        ${menuEnderecoAberto ? "rotate-180" : ""}
      `}
    />

  </button>


  {/* DROPDOWN DE ENDEREÇOS */}
  {menuEnderecoAberto && (

    <div
      className="
        absolute
        left-0
        top-full
        z-50
        mt-2
        w-80
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-lg
      "
    >

      {/* CABEÇALHO */}
      <div className="border-b border-gray-100 px-4 py-3">

        <p className="text-sm font-semibold text-gray-900">
          Escolha o endereço
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Selecione onde deseja receber seu pedido.
        </p>

      </div>


      {/* SEM ENDEREÇOS */}
      {enderecos.length === 0 ? (

        <div className="px-4 py-6 text-center">

          <MapPin
            size={24}
            className="mx-auto text-gray-400"
          />

          <p className="mt-2 text-sm text-gray-500">
            Nenhum endereço cadastrado.
          </p>

          <Link
            href="/perfil/enderecos"
            onClick={() =>
              setMenuEnderecoAberto(false)
            }
            className="
              mt-3
              inline-block
              text-sm
              font-semibold
              text-red-600
              hover:text-red-700
            "
          >
            Cadastrar endereço
          </Link>

        </div>

      ) : (

        <div className="max-h-80 overflow-y-auto py-2">

          {enderecos.map((endereco) => {

            const selecionado =
              enderecoSelecionado?.id_endereco ===
              endereco.id_endereco;

            return (

              <button
                key={endereco.id_endereco}
                type="button"
                onClick={() =>
                  selecionarEndereco(endereco)
                }
                className={`
                  flex
                  w-full
                  items-start
                  gap-3
                  px-4
                  py-3
                  text-left
                  transition
                  hover:bg-gray-50
                  ${
                    selecionado
                      ? "bg-red-50"
                      : ""
                  }
                `}
              >

                <MapPin
                  size={18}
                  className={`
                    mt-0.5
                    shrink-0
                    ${
                      selecionado
                        ? "text-red-600"
                        : "text-gray-400"
                    }
                  `}
                />


<div className="min-w-0 flex-1">
  <p className="truncate text-sm text-gray-700">
    <span className="font-semibold text-gray-900">
      {endereco.apelido || "Endereço"}:
    </span>{" "}
    {endereco.logradouro}, {endereco.numero}
  </p>
</div>


                {selecionado && (

                  <span className="text-sm font-bold text-red-600">
                    ✓
                  </span>

                )}

              </button>

            );
          })}

        </div>

      )}


      {/* RODAPÉ */}
      <div className="border-t border-gray-100 p-2">

        <Link
          href="/perfil/enderecos"
          onClick={() =>
            setMenuEnderecoAberto(false)
          }
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            px-3
            py-2.5
            text-sm
            font-semibold
            text-red-600
            transition
            hover:bg-red-50
          "
        >

          <MapPin size={17} />

          Gerenciar endereços

        </Link>

      </div>

    </div>

  )}

</div>


        {/* PESQUISA */}

        <div
          className="
            flex
            h-11
            flex-1
            overflow-hidden
            rounded-lg
            border
            border-gray-300
            bg-gray-50
            transition
            focus-within:border-red-500
            focus-within:ring-2
            focus-within:ring-red-100
          "
        >

          <input
            type="text"
            placeholder="Buscar restaurantes ou pratos..."
            className="
              min-w-0
              flex-1
              bg-transparent
              px-4
              text-sm
              text-gray-800
              outline-none
              placeholder:text-gray-400
            "
          />

          <button
            className="
              flex
              w-12
              items-center
              justify-center
              bg-red-600
              text-white
              transition
              hover:bg-red-700
            "
          >
            <Search size={21} />
          </button>

        </div>


        {/* USUÁRIO */}

        {/* USUÁRIO */}

{usuario ? (

  <div className="relative hidden md:block">

    <button
      type="button"
      onClick={() => setPerfilOpen(!perfilOpen)}
      className="
        flex
        items-center
        gap-2
        rounded-lg
        px-2
        py-2
        transition
        hover:bg-gray-100
      "
    >

      <User
        size={32}
        className="text-gray-600"
      />

      <div className="flex flex-col items-start">

        <span className="text-[15px] text-gray-500">
          Olá!
        </span>

        <strong className="text-sm font-semibold text-gray-800">
          {usuario.nome?.split(" ")[0]}
        </strong>

      </div>

      <ChevronDown
        size={16}
        className={`
          text-gray-500
          transition-transform
          ${perfilOpen ? "rotate-180" : ""}
        `}
      />

    </button>


    {/* DROPDOWN */}

    {perfilOpen && (

      <div
        className="
          absolute
          right-0
          top-full
          mt-2
          w-52
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-lg
        "
      >

        {/* PERFIL */}

        <Link
          href="/perfil"
          onClick={() => setPerfilOpen(false)}
          className="
            flex
            items-center
            gap-3
            px-4
            py-3
            text-sm
            text-gray-700
            transition
            hover:bg-gray-50
          "
        >

          <User size={18} />

          <span>
            Meu perfil
          </span>

        </Link>


        {/* SAIR */}

        <button
          type="button"
          onClick={sair}
          className="
            flex
            w-full
            items-center
            gap-3
            border-t
            border-gray-100
            px-4
            py-3
            text-sm
            text-red-600
            transition
            hover:bg-red-50
          "
        >

          <LogOut size={18} />

          <span>
            Sair
          </span>

        </button>

        </div>

        )}

        </div>

        ) : (

        <Link
          href="/login"
          className="
            hidden
            items-center
            gap-2
            rounded-lg
            px-2
            py-2
            transition
            hover:bg-gray-100
            md:flex
          "
        >

          <User
            size={32}
            className="text-gray-600"
          />

          <div className="flex flex-col items-start">

            <span className="text-[15px] text-gray-500">
              Olá!
            </span>

            <strong className="text-sm font-semibold text-gray-800">
              Entrar
            </strong>

          </div>

        </Link>

      )}


        {/* FAVORITOS */}

        <button
          className="
            hidden
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            text-gray-700
            transition
            hover:bg-gray-100
            md:flex
          "
        >
          <Heart size={21} />
        </button>


        {/* CARRINHO */}

        <button
          className="
            relative
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            text-gray-700
            transition
            hover:bg-gray-100
          "
        >

          <ShoppingBag size={40} />

          <span
            className="
              absolute
              -right-0.25
              -top-0.25
              flex
              h-[25px]
              w-[25px]
              items-center
              justify-center
              rounded-full
              bg-red-600
              text-[15px]
              font-bold
              text-white
            "
          >
            0
          </span>

        </button>


        {/* MENU MOBILE */}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            text-gray-700
            hover:bg-gray-100
            md:hidden
          "
        >

          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}

        </button>

      </div>


      {/* MENU */}

      <nav
        className={`
          border-t
          border-gray-100
          bg-white
          ${menuOpen ? "block" : "hidden md:block"}
        `}
      >

        <div
          className="
            mx-auto
            flex
            min-h-12
            max-w-[1400px]
            items-center
            gap-7
            px-6
          "
        >

          <button
            className="
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-gray-800
              hover:text-red-600
            "
          >

            <Menu size={18} />

            Categorias

            <ChevronDown size={15} />

          </button>


          <a
            href="/restaurantes"
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Restaurantes
          </a>

          <a
            href="/bebidas"
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Bebidas
          </a>

          <a
            href="/mercados"
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Mercados
          </a>


          <a
            href="#"
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Ofertas
          </a>


          <a
            href="#"
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Mais pedidos
          </a>


          <a
            href="#"
            className="text-sm text-gray-600 hover:text-red-600"
          >
            Novidades
          </a>


          <div className="flex-1" />


          <a
            href="/pedidos"
            className="
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-gray-700
              hover:text-red-600
            "
          >

            <Clock size={18} />

            Meus pedidos

          </a>

        </div>

      </nav>

    </header>
  );
}