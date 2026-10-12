
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  Bell,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
} from "lucide-react";

import HeaderRestaurante from "@/app/components/restaurante/HeaderRestaurante";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";


export default function AreaRestaurante() {
  const router = useRouter();

  
  const [responsavel, setResponsavel] = useState(null);
  const [restaurantes, setRestaurantes] = useState([]);
  const [restauranteSelecionado, setRestauranteSelecionado] =
    useState(null);

  const [menuRestaurantesAberto, setMenuRestaurantesAberto] =
    useState(false);
  
  const [statusFuncionamento, setStatusFuncionamento] =
  useState(null);

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const dadosSalvos = localStorage.getItem(
      "responsavelLogado"
    );

    if (!dadosSalvos) {
      router.push("/login");
      return;
    }

    const responsavelSalvo = JSON.parse(dadosSalvos);

    setResponsavel(responsavelSalvo);

    buscarRestaurantes(responsavelSalvo.id_responsavel);
  }, [router]);

    useEffect(() => {
      if (!restauranteSelecionado) {
        return;
      }

      const idRestaurante =
        restauranteSelecionado.id_restaurante;

      // Busca imediatamente
      buscarStatusFuncionamento(
        idRestaurante
      );

      // Atualiza a cada 1 minuto
      const intervalo = setInterval(() => {
        buscarStatusFuncionamento(
          idRestaurante
        );
      }, 60000);

      return () => {
        clearInterval(intervalo);
      };
    }, [restauranteSelecionado]);

  async function buscarRestaurantes(idResponsavel) {
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

      const restaurantesDoResponsavel = dados.filter(
        (restaurante) =>
          restaurante.responsavel_id === idResponsavel
      );

      setRestaurantes(restaurantesDoResponsavel);

      if (restaurantesDoResponsavel.length > 0) {
        const idSalvo = localStorage.getItem(
          "restauranteSelecionadoId"
        );

        const restauranteSalvo =
          restaurantesDoResponsavel.find(
            (restaurante) =>
              restaurante.id_restaurante === Number(idSalvo)
          );

        const restauranteInicial =
          restauranteSalvo || restaurantesDoResponsavel[0];

        setRestauranteSelecionado(restauranteInicial);

        localStorage.setItem(
          "restauranteSelecionadoId",
          restauranteInicial.id_restaurante
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  function selecionarRestaurante(restaurante) {
    setRestauranteSelecionado(restaurante);

    localStorage.setItem(
      "restauranteSelecionadoId",
      restaurante.id_restaurante
    );

    setMenuRestaurantesAberto(false);
  }

  function sair() {
    localStorage.removeItem("responsavelLogado");
    localStorage.removeItem("restauranteSelecionadoId");

    router.push("/login");
  }

  function novoRestaurante() {
    if (!responsavel) return;

    router.push(
      `/cadastro/restaurante/dados-restaurante?id_responsavel=${responsavel.id_responsavel}`
    );
  }

async function buscarStatusFuncionamento(
  idRestaurante
) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/restaurantes/${idRestaurante}/status-funcionamento`
    );

    if (!response.ok) {
      throw new Error(
        "Não foi possível verificar o funcionamento."
      );
    }

    const dados = await response.json();

    setStatusFuncionamento(dados);

  } catch (error) {
    console.error(
      "Erro ao verificar funcionamento:",
      error
    );

    setStatusFuncionamento(null);
  }
}  

async function continuarCadastro() {
  if (!restauranteSelecionado) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/restaurantes/${restauranteSelecionado.id_restaurante}/status-cadastro`
    );

    if (!response.ok) {
      throw new Error(
        "Não foi possível verificar o cadastro."
      );
    }

    const dados = await response.json();

    // =========================
    // FALTA CANAL DE VENDA
    // =========================

    if (
      dados.proxima_etapa ===
      "canais-venda"
    ) {
      router.push(
        `/cadastro/restaurante/canais-venda?id_restaurante=${restauranteSelecionado.id_restaurante}`
      );

      return;
    }

    // =========================
    // FALTA HORÁRIO
    // =========================

    if (
      dados.proxima_etapa ===
      "horarios-funcionamento"
    ) {
      router.push(
        `/cadastro/restaurante/horarios-funcionamento?id_restaurante=${restauranteSelecionado.id_restaurante}`
      );

      return;
    }

    // =========================
    // FALTA ENDEREÇO
    // =========================

    if (
      dados.proxima_etapa ===
      "endereco"
    ) {
      localStorage.setItem(
        "restauranteSelecionadoId",
        restauranteSelecionado.id_restaurante
      );

      router.push(
        "/restaurantes/endereco"
      );

      return;
    }

    // =========================
    // CADASTRO COMPLETO
    // =========================

    if (dados.completo) {
      router.push(
        "/restaurantes"
      );

      return;
    }

  } catch (error) {
    console.error(
      "Erro ao continuar cadastro:",
      error
    );
  }
}
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ========================================= */}
      {/* SIDEBAR */}
      {/* ========================================= */}

      <SidebarRestaurante />

      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderRestaurante />


      {/* ========================================= */}
      {/* CONTEÚDO */}
      {/* ========================================= */}

      

        {/* ========================================= */}
        {/* HOME */}
        {/* ========================================= */}

        <main className="flex-1 p-8">

          {!restauranteSelecionado ? (

            <div className="
              mx-auto
              mt-16
              max-w-lg
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-10
              text-center
              shadow-sm
            ">
              <div className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-red-50
                text-red-600
              ">
                <Store size={30} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">
                Cadastre seu primeiro restaurante
              </h2>

              <p className="
                mt-2
                text-sm
                leading-relaxed
                text-gray-500
              ">
                Comece cadastrando as informações do seu
                restaurante para utilizar o iComida Parceiros.
              </p>

              <button
                type="button"
                onClick={novoRestaurante}
                className="
                  mt-6
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-red-600
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                Cadastrar restaurante
                <ArrowRight size={18} />
              </button>
            </div>

          ) : (
            <>

              {/* BOAS-VINDAS */}

              <div className="
                mb-6
                flex
                flex-col
                justify-between
                gap-4
                md:flex-row
                md:items-center
              ">
                <div>
                  <h1 className="
                    text-2xl
                    font-bold
                    text-gray-900
                  ">
                    Olá,{" "}
                    {responsavel?.nome?.split(" ")[0]}!
                  </h1>

                  <p className="mt-1 text-sm text-gray-500">
                    Veja como está o seu restaurante hoje.
                  </p>
                </div>
              </div>

              {/* STATUS PENDENTE */}

              {restauranteSelecionado.status ===
                "PENDENTE" && (
                <div className="
                  mb-6
                  rounded-2xl
                  border
                  border-amber-200
                  bg-amber-50
                  p-6
                ">
                  <div className="
                    flex
                    flex-col
                    gap-5
                    md:flex-row
                    md:items-center
                    md:justify-between
                  ">
                    <div className="flex gap-4">

                      <div className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        text-amber-600
                      ">
                        <AlertTriangle size={22} />
                      </div>

                      <div>
                        <h2 className="
                          font-semibold
                          text-gray-900
                        ">
                          Complete o cadastro do restaurante
                        </h2>

                        <p className="
                          mt-1
                          max-w-xl
                          text-sm
                          leading-relaxed
                          text-gray-600
                        ">
                          Algumas informações ainda precisam
                          ser preenchidas antes que{" "}
                          <strong>
                            {
                              restauranteSelecionado.nome_fantasia
                            }
                          </strong>{" "}
                          possa começar a receber pedidos.
                        </p>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={continuarCadastro}
                      className="
                        flex
                        h-11
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-red-600
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-red-700
                      "
                    >
                      Continuar cadastro
                      <ArrowRight size={17} />
                    </button>

                  </div>
                </div>
              )}

              {/* RESTAURANTE DISPONÍVEL */}

              {/* RESTAURANTE DISPONÍVEL + FUNCIONAMENTO */}

{restauranteSelecionado.status ===
  "DISPONIVEL" && (
  <div
    className="
      mb-6
      grid
      grid-cols-1
      gap-4
      lg:grid-cols-2
    "
  >

    {/* RESTAURANTE DISPONÍVEL */}

    <div
      className="
        flex
        items-center
        rounded-xl
        border
        border-gray-200
        bg-white
        p-5
      "
    >
      <div className="flex items-center gap-3">

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-green-50
            text-green-600
          "
        >
          <CheckCircle2 size={21} />
        </div>

        <div>
          <p
            className="
              text-sm
              font-semibold
              text-gray-900
            "
          >
            Restaurante disponível
          </p>

          <p className="text-xs text-gray-500">
            Seu restaurante está pronto para
            receber pedidos.
          </p>
        </div>

      </div>
    </div>


    {/* FUNCIONAMENTO */}

    <div
      className="
        flex
        items-center
        justify-between
        rounded-xl
        border
        border-gray-200
        bg-white
        p-5
      "
    >

      <div className="flex items-center gap-3">

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            ${
              statusFuncionamento?.aberto
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }
          `}
        >
          <Clock size={21} />
        </div>

        <div>
          <p
            className="
              text-sm
              font-semibold
              text-gray-900
            "
          >
            Funcionamento agora
          </p>

          {statusFuncionamento ? (
            <p className="text-xs text-gray-500">
              {statusFuncionamento.proximo_evento}
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              Verificando horário...
            </p>
          )}
        </div>

      </div>

      {statusFuncionamento && (
        <span
          className={`
            rounded-full
            px-3
            py-1
            text-xs
            font-semibold
            ${
              statusFuncionamento.aberto
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }
          `}
        >
          {statusFuncionamento.aberto
            ? "Aberto"
            : "Fechado"}
        </span>
      )}

    </div>

  </div>
)}
              {/* INDICADORES */}

              <div className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-3
              ">
                <Indicador
                  titulo="Pedidos hoje"
                  valor="0"
                  descricao="Nenhum pedido recebido"
                />

                <Indicador
                  titulo="Vendas hoje"
                  valor="R$ 0,00"
                  descricao="Total vendido hoje"
                />

                <Indicador
                  titulo="Ticket médio"
                  valor="R$ 0,00"
                  descricao="Valor médio por pedido"
                />
              </div>

              {/* PARTE INFERIOR */}

              <div className="
                mt-6
                grid
                grid-cols-1
                gap-6
                xl:grid-cols-3
              ">

                {/* PEDIDOS */}

                <div className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-6
                  xl:col-span-2
                ">
                  <div className="
                    flex
                    items-center
                    justify-between
                  ">
                    <div>
                      <h2 className="
                        font-semibold
                        text-gray-900
                      ">
                        Pedidos recentes
                      </h2>

                      <p className="
                        mt-1
                        text-xs
                        text-gray-400
                      ">
                        Acompanhe os últimos pedidos recebidos
                      </p>
                    </div>

                    <button
                      type="button"
                      className="
                        text-sm
                        font-medium
                        text-red-600
                      "
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="
                    flex
                    min-h-56
                    flex-col
                    items-center
                    justify-center
                    text-center
                  ">
                    <ShoppingBag
                      size={38}
                      className="text-gray-300"
                    />

                    <p className="
                      mt-4
                      text-sm
                      font-medium
                      text-gray-600
                    ">
                      Nenhum pedido por enquanto
                    </p>

                    <p className="
                      mt-1
                      text-xs
                      text-gray-400
                    ">
                      Os pedidos aparecerão aqui quando forem
                      recebidos.
                    </p>
                  </div>
                </div>

                {/* RESUMO */}

                <div className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-6
                ">
                  <h2 className="
                    font-semibold
                    text-gray-900
                  ">
                    Seu restaurante
                  </h2>

                  <div className="mt-5 space-y-4">

                    <Informacao
                      titulo="Nome"
                      valor={
                        restauranteSelecionado.nome_fantasia
                      }
                    />

                    <Informacao
                      titulo="CNPJ"
                      valor={
                        restauranteSelecionado.cnpj
                      }
                    />

                    <Informacao
                      titulo="Status"
                      valor={
                        restauranteSelecionado.status ===
                        "DISPONIVEL"
                          ? "Disponível"
                          : "Cadastro pendente"
                      }
                    />

                    <Informacao
                      titulo="Categorias"
                      valor={
                        restauranteSelecionado.categorias
                          ?.map(
                            (categoria) =>
                              categoria.nome
                          )
                          .join(", ") || "-"
                      }
                    />

                  </div>
                </div>

              </div>

            </>
          )}
        </main>

      </div>
    </div>
  );
}

function Indicador({
  titulo,
  valor,
  descricao,
}) {
  return (
    <div className="
      rounded-2xl
      border
      border-gray-200
      bg-white
      p-5
    ">
      <p className="text-sm text-gray-500">
        {titulo}
      </p>

      <p className="
        mt-2
        text-2xl
        font-bold
        text-gray-900
      ">
        {valor}
      </p>

      <p className="mt-2 text-xs text-gray-400">
        {descricao}
      </p>
    </div>
  );
}

function Informacao({
  titulo,
  valor,
}) {
  return (
    <div className="
      border-b
      border-gray-100
      pb-3
      last:border-0
    ">
      <p className="text-xs text-gray-400">
        {titulo}
      </p>

      <p className="
        mt-1
        text-sm
        font-medium
        text-gray-700
      ">
        {valor}
      </p>
    </div>
  );
}