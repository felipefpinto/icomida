"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Clock, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import HeaderRestaurante from "@/app/components/restaurante/HeaderRestaurante";
import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

const API_URL = "http://127.0.0.1:8000";
const FUSO_PAINEL = "America/Sao_Paulo";
// Hipótese para timestamps sem fuso. Troque por "Z" se o banco grava UTC.
const FUSO_DATA_SEM_OFFSET = "-03:00";
const STATUS_VENDA = new Set([
  "ACEITO", "EM_PREPARO", "PRONTO", "SAIU_PARA_ENTREGA", "ENTREGUE",
]);
const STATUS_ROTULOS = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  AGUARDANDO_ACEITE: "Aguardando aceite",
  ACEITO: "Aceito",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};
function dataPedido(valor) {
  if (!valor) return null;
  const texto = String(valor).trim().replace(" ", "T");
  const data = new Date(/[zZ]$|[+-]\d{2}:?\d{2}$/.test(texto)
    ? texto : texto + FUSO_DATA_SEM_OFFSET);
  return Number.isNaN(data.getTime()) ? null : data;
}
function diaPainel(data) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_PAINEL, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(data);
}
function centavos(valor) {
  const texto = String(valor).trim();
  if (!/^-?\d+(\.\d{1,2})?$/.test(texto)) throw new Error("Valor de pedido inválido.");
  const negativo = texto.startsWith("-");
  const [inteiro, fracao = ""] = texto.replace(/^-/, "").split(".");
  const total = Number(inteiro) * 100 + Number(fracao.padEnd(2, "0"));
  if (!Number.isSafeInteger(total)) throw new Error("Valor fora do limite.");
  return negativo ? -total : total;
}
function moeda(valorEmCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL",
  }).format(valorEmCentavos / 100);
}
function calcularIndicadores(pedidos, agora) {
  const hoje = diaPainel(agora);
  const pedidosHoje = pedidos.filter((pedido) => diaPainel(dataPedido(pedido.created_at)) === hoje);
  const vendasHoje = pedidosHoje.filter((pedido) => STATUS_VENDA.has(pedido.status));
  const total = vendasHoje.reduce((soma, pedido) => soma + centavos(pedido.valor_total), 0);
  return {
    pedidos: pedidosHoje.length,
    vendas: total,
    ticket: vendasHoje.length ? Math.round(total / vendasHoje.length) : 0,
  };
}
async function consultar(caminho, signal) {
  const response = await fetch(API_URL + caminho, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível consultar os dados.");
  return response.json();
}

export default function AreaRestaurante() {
  const router = useRouter();
  const [responsavel, setResponsavel] = useState(null);
  const [restauranteSelecionado, setRestauranteSelecionado] = useState(null);
  const [statusFuncionamento, setStatusFuncionamento] = useState(null);
  const [erroFuncionamento, setErroFuncionamento] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erroInicial, setErroInicial] = useState("");
  const [pedidos, setPedidos] = useState(null);
  const [erroPedidos, setErroPedidos] = useState("");
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [agora, setAgora] = useState(() => new Date());
  const [tentativa, setTentativa] = useState(0);
  const [erroCadastro, setErroCadastro] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      try {
        const salvo = localStorage.getItem("responsavelLogado");
        if (!salvo) { router.replace("/login"); return; }
        const usuario = JSON.parse(salvo);
        if (!usuario.id_responsavel) { router.replace("/login"); return; }
        setResponsavel(usuario);
        const dados = await consultar("/restaurantes/", controller.signal);
        if (!Array.isArray(dados)) throw new Error("Resposta inválida.");
        const lista = dados.filter((r) =>
          Number(r.responsavel_id) === Number(usuario.id_responsavel) && r.status !== "INATIVO"
        );
        const idSalvo = localStorage.getItem("restauranteSelecionadoId");
        const selecionado = lista.find((r) => String(r.id_restaurante) === idSalvo) || lista[0] || null;
        if (controller.signal.aborted) return;
        setRestauranteSelecionado(selecionado);
        if (selecionado) localStorage.setItem("restauranteSelecionadoId", String(selecionado.id_restaurante));
        else localStorage.removeItem("restauranteSelecionadoId");
      } catch (error) {
        if (!controller.signal.aborted) setErroInicial("Não foi possível carregar seu restaurante. Atualize a página para tentar novamente.");
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    if (!restauranteSelecionado) return;
    const controller = new AbortController();
    let timer;
    const id = restauranteSelecionado.id_restaurante;
    setPedidos(null);
    setErroPedidos("");
    setAtualizadoEm(null);
    setStatusFuncionamento(null);
    setErroFuncionamento("");

    async function atualizar() {
      await Promise.allSettled([
        (async () => {
          try {
            const lista = await consultar(`/restaurantes/${id}/pedidos`, controller.signal);
            if (!Array.isArray(lista)) throw new Error("Resposta inválida.");
            for (const pedido of lista) {
              if (Number(pedido.id_restaurante) !== Number(id) || !dataPedido(pedido.created_at)) {
                throw new Error("Pedido inválido.");
              }
              centavos(pedido.valor_total);
            }
            if (controller.signal.aborted) return;
            setPedidos([...lista].sort((a, b) =>
              dataPedido(b.created_at) - dataPedido(a.created_at) || b.id_pedido - a.id_pedido
            ));
            setErroPedidos("");
            setAtualizadoEm(new Date());
          } catch (error) {
            if (!controller.signal.aborted) setErroPedidos("Não foi possível atualizar os pedidos.");
          }
        })(),
        (async () => {
          try {
            const dados = await consultar(`/restaurantes/${id}/status-funcionamento`, controller.signal);
            if (typeof dados?.aberto !== "boolean") throw new Error("Status inválido.");
            if (!controller.signal.aborted) {
              setStatusFuncionamento(dados);
              setErroFuncionamento("");
            }
          } catch (error) {
            if (!controller.signal.aborted) {
              setStatusFuncionamento(null);
              setErroFuncionamento("Não foi possível verificar o funcionamento.");
            }
          }
        })(),
      ]);
      if (!controller.signal.aborted) {
        setAgora(new Date());
        timer = setTimeout(atualizar, 30000);
      }
    }
    atualizar();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [restauranteSelecionado, tentativa]);

  function novoRestaurante() {
    if (responsavel) router.push(
      `/cadastro/restaurante/dados-restaurante?id_responsavel=${responsavel.id_responsavel}`
    );
  }
  async function continuarCadastro() {
    if (!restauranteSelecionado) return;
    setErroCadastro("");
    try {
      const id = restauranteSelecionado.id_restaurante;
      const dados = await consultar(`/restaurantes/${id}/status-cadastro`);
      const etapas = {
        "canais-venda": `/cadastro/restaurante/canais-venda?id_restaurante=${id}`,
        "horarios-funcionamento": `/cadastro/restaurante/horarios-funcionamento?id_restaurante=${id}`,
        endereco: "/restaurantes/endereco",
      };
      if (dados.completo) { window.location.reload(); return; }
      const destino = etapas[dados.proxima_etapa];
      if (!destino) throw new Error("Etapa desconhecida.");
      router.push(destino);
    } catch (error) {
      setErroCadastro("Não foi possível verificar a próxima etapa do cadastro.");
    }
  }
  const indicadores = pedidos ? calcularIndicadores(pedidos, agora) : null;
  const pedidosRecentes = pedidos?.slice(0, 5) || [];
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

          {carregando ? (
            <p role="status" className="py-16 text-center text-gray-500">Carregando restaurante...</p>
          ) : erroInicial ? (
            <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-600">{erroInicial}</p>
          ) : !restauranteSelecionado ? (

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

              {erroCadastro && <p role="alert" className="mb-4 text-sm text-red-600">{erroCadastro}</p>}
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
              {erroFuncionamento || "Verificando horário..."}
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
              <p className="mb-3 text-xs text-gray-500">
                Hoje, no horário de Brasília. Vendas e ticket consideram pedidos criados hoje,
                aceitos ou em etapas posteriores, com entrega e descontos incluídos.
              </p>
              {erroPedidos && (
                <div role="alert" className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  {erroPedidos} {pedidos && "Exibindo os últimos dados carregados."}
                  <button type="button" onClick={() => setTentativa((valor) => valor + 1)}
                    className="ml-3 font-semibold underline">Tentar novamente</button>
                </div>
              )}
              {!pedidos && !erroPedidos && (
                <p role="status" className="mb-3 text-sm text-gray-500">Carregando indicadores e pedidos...</p>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Indicador titulo="Pedidos hoje" valor={indicadores ? String(indicadores.pedidos) : "—"}
                  descricao="Todos os pedidos criados hoje" />
                <Indicador titulo="Vendas hoje" valor={indicadores ? moeda(indicadores.vendas) : "—"}
                  descricao="Total de pedidos aceitos ou em etapas posteriores" />
                <Indicador titulo="Ticket médio" valor={indicadores ? moeda(indicadores.ticket) : "—"}
                  descricao="Média dos pedidos considerados nas vendas" />
              </div>
              {atualizadoEm && (
                <p className="mt-2 text-xs text-gray-400">
                  Atualizado às {atualizadoEm.toLocaleTimeString("pt-BR", {timeZone: FUSO_PAINEL})}.
                  Atualização automática a cada 30 segundos.
                </p>
              )}
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
                      onClick={() => router.push("/restaurantes/pedidos")}
                      className="
                        text-sm
                        font-medium
                        text-red-600
                      "
                    >
                      Ver todos
                    </button>
                  </div>

                  {pedidos === null ? (
                    <p className="py-12 text-center text-sm text-gray-500">
                      {erroPedidos ? "Pedidos indisponíveis no momento." : "Carregando pedidos..."}
                    </p>
                  ) : pedidosRecentes.length === 0 ? (
                    <p className="py-12 text-center text-sm text-gray-500">Nenhum pedido por enquanto.</p>
                  ) : (
                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <caption className="sr-only">Cinco pedidos mais recentes</caption>
                        <thead className="border-b text-xs text-gray-500">
                          <tr>
                            <th scope="col" className="py-3 pr-4">Pedido</th>
                            <th scope="col" className="py-3 pr-4">Data</th>
                            <th scope="col" className="py-3 pr-4">Status</th>
                            <th scope="col" className="py-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedidosRecentes.map((pedido) => (
                            <tr key={pedido.id_pedido} className="border-b border-gray-100 last:border-0">
                              <td className="py-4 pr-4 font-semibold text-gray-900">#{pedido.id_pedido}</td>
                              <td className="whitespace-nowrap py-4 pr-4 text-gray-600">
                                {dataPedido(pedido.created_at).toLocaleString("pt-BR", {
                                  timeZone: FUSO_PAINEL, day: "2-digit", month: "2-digit",
                                  year: "numeric", hour: "2-digit", minute: "2-digit",
                                })}
                              </td>
                              <td className="py-4 pr-4 text-gray-600">
                                {STATUS_ROTULOS[pedido.status] || pedido.status}
                              </td>
                              <td className="whitespace-nowrap py-4 text-right font-medium text-gray-900">
                                {moeda(centavos(pedido.valor_total))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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

