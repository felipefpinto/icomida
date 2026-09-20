"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  Home,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  Star,
  Megaphone,
  Store,
  Clock,
  Truck,
  Settings,
  Wallet,
  CircleHelp,
  ChevronDown,
  LogOut,
  CheckCircle2,
  Plus,
  MapPin,
  MapPinned,
} from "lucide-react";

export default function SidebarRestaurante() {
  const router = useRouter();
  const pathname = usePathname();

  const [responsavel, setResponsavel] = useState(null);
  const [restaurantes, setRestaurantes] = useState([]);
  const [restauranteSelecionado, setRestauranteSelecionado] =
    useState(null);

  const [menuRestaurantesAberto, setMenuRestaurantesAberto] =
    useState(false);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem(
      "responsavelLogado"
    );

    if (!dadosSalvos) {
      router.push("/login");
      return;
    }

    const responsavelSalvo = JSON.parse(
      dadosSalvos
    );

    setResponsavel(responsavelSalvo);

    buscarRestaurantes(
      responsavelSalvo.id_responsavel
    );
  }, [router]);

  async function buscarRestaurantes(
  idResponsavel
) {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/restaurantes/"
    );

    if (!response.ok) {
      throw new Error(
        "Não foi possível buscar os restaurantes."
      );
    }

    const dados = await response.json();

    // Mostra apenas os restaurantes
    // do responsável que não estejam INATIVOS
    const restaurantesDoResponsavel =
      dados.filter(
        (restaurante) =>
          Number(
            restaurante.responsavel_id
          ) ===
            Number(idResponsavel) &&
          restaurante.status !==
            "INATIVO"
      );

    setRestaurantes(
      restaurantesDoResponsavel
    );

    // Caso não exista nenhum restaurante
    // ativo ou pendente
    if (
      restaurantesDoResponsavel.length ===
      0
    ) {
      setRestauranteSelecionado(
        null
      );

      localStorage.removeItem(
        "restauranteSelecionadoId"
      );

      return;
    }

    // Busca o restaurante que estava
    // selecionado anteriormente
    const idSalvo =
      localStorage.getItem(
        "restauranteSelecionadoId"
      );

    const restauranteSalvo =
      restaurantesDoResponsavel.find(
        (restaurante) =>
          restaurante.id_restaurante ===
          Number(idSalvo)
      );

    // Se o restaurante salvo virou INATIVO,
    // ele não estará mais na lista.
    // Nesse caso seleciona o primeiro disponível.
    const restauranteInicial =
      restauranteSalvo ||
      restaurantesDoResponsavel[0];

    setRestauranteSelecionado(
      restauranteInicial
    );

    localStorage.setItem(
      "restauranteSelecionadoId",
      restauranteInicial.id_restaurante.toString()
    );
  } catch (error) {
    console.error(
      "Erro ao buscar restaurantes:",
      error
    );

    setRestaurantes([]);
    setRestauranteSelecionado(
      null
    );
  }
}

  function selecionarRestaurante(
    restaurante
  ) {
    setRestauranteSelecionado(
      restaurante
    );

    localStorage.setItem(
      "restauranteSelecionadoId",
      restaurante.id_restaurante
    );

    setMenuRestaurantesAberto(false);

    window.location.reload();
  }

  function novoRestaurante() {
    if (!responsavel) return;

    router.push(
      `/cadastro/restaurante/dados-restaurante?id_responsavel=${responsavel.id_responsavel}`
    );
  }

  function sair() {
    localStorage.removeItem(
      "responsavelLogado"
    );

    localStorage.removeItem(
      "restauranteSelecionadoId"
    );

    router.push("/login");
  }

  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">

      {/* LOGO */}

      <div className="flex h-20 items-center border-b border-gray-100 px-6">
        <div>
          <h1 className="text-xl font-bold text-red-600">
            iComida
          </h1>

          <p className="text-xs font-medium text-gray-400">
            Parceiros
          </p>
        </div>
      </div>

      {/* RESTAURANTE SELECIONADO */}

      <div className="border-b border-gray-100 p-4">
        {restauranteSelecionado ? (
          <div className="relative">

            <button
              type="button"
              onClick={() =>
                setMenuRestaurantesAberto(
                  !menuRestaurantesAberto
                )
              }
              className="
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                border
                border-gray-200
                p-3
                text-left
                transition
                hover:bg-gray-50
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  bg-red-50
                  text-red-600
                "
              >
                <Store size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {
                    restauranteSelecionado.nome_fantasia
                  }
                </p>

                <p className="text-xs text-gray-400">
                  Restaurante
                </p>
              </div>

              <ChevronDown
                size={18}
                className="text-gray-400"
              />
            </button>

            {menuRestaurantesAberto && (
              <div
                className="
                  absolute
                  left-0
                  right-0
                  top-full
                  z-50
                  mt-2
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  shadow-lg
                "
              >
                {restaurantes.map(
                  (restaurante) => (
                    <button
                      key={
                        restaurante.id_restaurante
                      }
                      type="button"
                      onClick={() =>
                        selecionarRestaurante(
                          restaurante
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        border-b
                        border-gray-100
                        px-4
                        py-3
                        text-left
                        transition
                        last:border-b-0
                        hover:bg-gray-50
                      "
                    >
                      <Store
                        size={18}
                        className="text-gray-400"
                      />

                      <span className="flex-1 truncate text-sm text-gray-700">
                        {
                          restaurante.nome_fantasia
                        }
                      </span>

                      {restauranteSelecionado
                        ?.id_restaurante ===
                        restaurante.id_restaurante && (
                        <CheckCircle2
                          size={17}
                          className="text-green-600"
                        />
                      )}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={novoRestaurante}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2
                    bg-gray-50
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
                >
                  <Plus size={17} />

                  Adicionar restaurante
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={novoRestaurante}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-dashed
              border-gray-300
              px-3
              py-3
              text-sm
              font-medium
              text-red-600
              transition
              hover:border-red-300
              hover:bg-red-50
            "
          >
            <Plus size={18} />

            Cadastrar restaurante
          </button>
        )}
      </div>

      {/* NAVEGAÇÃO */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">

        <MenuTitulo titulo="Principal" />

        <MenuItem
          icone={Home}
          texto="Início"
          ativo={pathname === "/restaurantes"}
          onClick={() =>
            router.push("/restaurantes")
          }
        />

        <MenuTitulo titulo="Operação" />

        <MenuItem
          icone={ShoppingBag}
          texto="Pedidos"
        />

        <MenuItem
          icone={UtensilsCrossed}
          texto="Cardápio"
          ativo={
          pathname ===
          "/restaurantes/cardapio"
          }
          onClick={() =>
          router.push(
          "/restaurantes/cardapio"
          )
          }
          />

        <MenuTitulo titulo="Desempenho" />

        <MenuItem
          icone={BarChart3}
          texto="Visão geral"
        />

        <MenuItem
          icone={Star}
          texto="Avaliações"
        />

        <MenuTitulo titulo="Marketing" />

        <MenuItem
          icone={Megaphone}
          texto="Promoções"
        />

        <MenuTitulo titulo="Restaurante" />

<MenuItem
  icone={Store}
  texto="Dados do restaurante"
  ativo={
    pathname ===
    "/restaurantes/dados"
  }
  onClick={() =>
    router.push(
      "/restaurantes/dados"
    )
  }
/>

<MenuItem
  icone={Clock}
  texto="Horários"
  ativo={
    pathname ===
    "/restaurantes/horarios"
  }
  onClick={() =>
    router.push(
      "/restaurantes/horarios"
    )
  }
/>

<MenuItem
  icone={Truck}
  texto="Formas de Entrega"
  ativo={
    pathname ===
    "/restaurantes/tipos-de-entrega"
  }
  onClick={() =>
    router.push(
      "/restaurantes/tipos-de-entrega"
    )
  }
/>

<MenuItem
  icone={MapPinned}
  texto="Entrega"
  ativo={
    pathname ===
    "/restaurantes/entrega"
  }
  onClick={() =>
    router.push(
      "/restaurantes/entrega"
    )
  }
/>

<MenuItem
  icone={MapPin}
  texto="Endereço"
  ativo={
    pathname ===
    "/restaurantes/endereco"
  }
  onClick={() =>
    router.push(
      "/restaurantes/endereco"
    )
  }
/>
        <MenuTitulo titulo="Financeiro" />

        <MenuItem
          icone={Wallet}
          texto="Financeiro"
        />

        <MenuTitulo titulo="Suporte" />

        <MenuItem
          icone={CircleHelp}
          texto="Ajuda"
        />

      </nav>

      {/* SAIR */}

      <div className="border-t border-gray-100 p-4">
        <button
          type="button"
          onClick={sair}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-2
            text-sm
            text-gray-600
            transition
            hover:bg-gray-100
            hover:text-red-600
          "
        >
          <LogOut size={19} />

          Sair
        </button>
      </div>
    </aside>
  );
}

function MenuTitulo({ titulo }) {
  return (
    <p
      className="
        mb-2
        mt-5
        px-3
        text-[10px]
        font-bold
        uppercase
        tracking-wider
        text-gray-400
        first:mt-0
      "
    >
      {titulo}
    </p>
  );
}

function MenuItem({
  icone: Icone,
  texto,
  ativo = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        mb-1
        flex
        w-full
        items-center
        gap-3
        rounded-lg
        px-3
        py-2.5
        text-sm
        font-medium
        transition
        ${
          ativo
            ? "bg-red-50 text-red-600"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }
      `}
    >
      <Icone size={19} />

      {texto}
    </button>
  );
}