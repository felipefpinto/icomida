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
} from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuarioLogado");

    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

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

        <button
          className="
            hidden
            items-center
            gap-2
            rounded-lg
            px-2
            py-2
            transition
            hover:bg-gray-100
            lg:flex
          "
        >

          <MapPin
            size={21}
            className="text-red-600"
          />

          <div className="flex flex-col items-start">

            <span className="text-[11px] text-gray-500">
              Entregar em
            </span>

            <strong className="text-xs font-semibold text-gray-800">
              São Paulo, SP
            </strong>

          </div>

          <ChevronDown
            size={16}
            className="text-gray-500"
          />

        </button>


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

        {usuario ? (
          <div
            className="
              hidden
              items-center
              gap-2
              rounded-lg
              px-2
              py-2
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
                {usuario.nome.split(" ")[0]}
              </strong>
            </div>
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