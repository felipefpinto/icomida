"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
function diaISO(data) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSO_PAINEL, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(data);
  const parte = (tipo) => partes.find((item) => item.type === tipo).value;
  return `${parte("year")}-${parte("month")}-${parte("day")}`;
}
function somarDias(dia, quantidade) {
  const data = new Date(dia + "T12:00:00Z");
  data.setUTCDate(data.getUTCDate() + quantidade);
  return data.toISOString().slice(0, 10);
}
function dataValida(dia) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const data = new Date(dia + "T12:00:00Z");
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === dia;
}
function resumir(pedidos, inicio, fim) {
  const lista = pedidos.filter((pedido) => {
    if (pedido.status !== "ENTREGUE") return false;
    const dia = diaISO(dataPedido(pedido.created_at));
    return dia >= inicio && dia <= fim;
  }).sort((a, b) =>
    dataPedido(b.created_at) - dataPedido(a.created_at) || b.id_pedido - a.id_pedido
  );
  const somar = (campo) => lista.reduce((total, pedido) => total + centavos(pedido[campo]), 0);
  const total = somar("valor_total");
  return {
    lista, quantidade: lista.length, total,
    produtos: somar("subtotal"), entrega: somar("taxa_entrega"), descontos: somar("desconto"),
    ticket: lista.length ? Math.round(total / lista.length) : 0,
  };
}async function consultar(caminho, signal) {
  const response = await fetch(API_URL + caminho, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível consultar a API.");
  return response.json();
}

export default function Financeiro() {
  const router = useRouter();
  const [restaurante, setRestaurante] = useState(null);
  const [pedidos, setPedidos] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  const [periodo, setPeriodo] = useState("7");
  const [hoje, setHoje] = useState("");
  const [inicioPersonalizado, setInicioPersonalizado] = useState("");
  const [fimPersonalizado, setFimPersonalizado] = useState("");

  useEffect(() => {
    const dia = diaISO(new Date());
    setHoje(dia);
    setInicioPersonalizado(somarDias(dia, -6));
    setFimPersonalizado(dia);
    const timer = setInterval(() => setHoje(diaISO(new Date())), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    setCarregando(true);
    setErro("");

    async function iniciar() {
      try {
        const salvo = localStorage.getItem("responsavelLogado");
        if (!salvo) { router.replace("/login"); return; }
        const responsavel = JSON.parse(salvo);
        if (!responsavel.id_responsavel) { router.replace("/login"); return; }
        const lista = await consultar("/restaurantes/", controller.signal);
        if (!Array.isArray(lista)) throw new Error("Lista inválida.");
        const permitidos = lista.filter((item) =>
          Number(item.responsavel_id) === Number(responsavel.id_responsavel) &&
          item.status !== "INATIVO"
        );
        const salvoId = localStorage.getItem("restauranteSelecionadoId");
        const selecionado = permitidos.find((item) =>
          String(item.id_restaurante) === salvoId
        ) || permitidos[0] || null;
        if (controller.signal.aborted) return;
        setRestaurante(selecionado);
        if (!selecionado) {
          localStorage.removeItem("restauranteSelecionadoId");
          setPedidos(null);
          setCarregando(false);
          return;
        }
        localStorage.setItem("restauranteSelecionadoId", String(selecionado.id_restaurante));

        async function atualizar() {
          try {
            const dados = await consultar(
              `/restaurantes/${selecionado.id_restaurante}/pedidos`, controller.signal
            );
            if (!Array.isArray(dados)) throw new Error("Lista inválida.");
            for (const pedido of dados) {
              if (Number(pedido.id_restaurante) !== Number(selecionado.id_restaurante) ||
                  !dataPedido(pedido.created_at)) throw new Error("Pedido inválido.");
              for (const campo of ["valor_total", "subtotal", "taxa_entrega", "desconto"]) {
                centavos(pedido[campo]);
              }
              for (const item of pedido.itens || []) {
                if (!Number.isInteger(item.quantidade) || item.quantidade < 0 ||
                    typeof item.nome_produto !== "string") throw new Error("Item inválido.");
              }
            }
            if (controller.signal.aborted) return;
            setPedidos(dados);
            setAtualizadoEm(new Date());
            setErro("");
          } catch (error) {
            if (!controller.signal.aborted) setErro("Não foi possível atualizar os dados da financeiro.");
          } finally {
            if (!controller.signal.aborted) {
              setCarregando(false);
              timer = setTimeout(atualizar, 30000);
            }
          }
        }
        await atualizar();
      } catch (error) {
        if (!controller.signal.aborted) {
          setErro("Não foi possível carregar o restaurante.");
          setCarregando(false);
        }
      }
    }
    iniciar();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [router, tentativa]);

  const inicio = periodo === "personalizado" ? inicioPersonalizado
    : hoje ? somarDias(hoje, 1 - Number(periodo)) : "";
  const fim = periodo === "personalizado" ? fimPersonalizado : hoje;
  let erroPeriodo = "";
  if (hoje) {
    if (!dataValida(inicio) || !dataValida(fim)) erroPeriodo = "Preencha as duas datas.";
    else if (inicio > fim) erroPeriodo = "A data inicial deve ser anterior ou igual à final.";
    else if (fim > hoje) erroPeriodo = "Escolha um período que termine até hoje.";
    else if ((new Date(fim + "T12:00:00Z") - new Date(inicio + "T12:00:00Z")) / 86400000 >= 366)
      erroPeriodo = "Selecione um período de até 366 dias.";
  }
  const resumo = pedidos && hoje && !erroPeriodo ? resumir(pedidos, inicio, fim) : null;


  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarRestaurante />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderRestaurante />
        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
              <p className="mt-1 text-sm text-gray-500">
                {restaurante?.nome_fantasia || "Resumo dos pedidos entregues"}
              </p>
            </div>
            <button type="button" onClick={() => setTentativa((valor) => valor + 1)}
              disabled={carregando}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
              {carregando ? "Carregando..." : "Atualizar dados"}
            </button>
          </div>

          <section aria-label="Filtro por período" className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
            <label className="block text-sm font-medium text-gray-700" htmlFor="periodo">Período</label>
            <select id="periodo" value={periodo} onChange={(event) => setPeriodo(event.target.value)}
              className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
              <option value="1">Hoje</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="personalizado">Personalizado</option>
            </select>
            {periodo === "personalizado" && (
              <div className="mt-4 flex flex-wrap gap-4">
                <label className="text-sm text-gray-700">De
                  <input type="date" value={inicioPersonalizado} max={fimPersonalizado || hoje}
                    onChange={(event) => setInicioPersonalizado(event.target.value)}
                    className="ml-2 rounded-lg border border-gray-300 px-3 py-2" />
                </label>
                <label className="text-sm text-gray-700">Até
                  <input type="date" value={fimPersonalizado} min={inicioPersonalizado} max={hoje}
                    onChange={(event) => setFimPersonalizado(event.target.value)}
                    className="ml-2 rounded-lg border border-gray-300 px-3 py-2" />
                </label>
              </div>
            )}
            {erroPeriodo && <p role="alert" className="mt-3 text-sm text-red-600">{erroPeriodo}</p>}
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Apenas pedidos com status Entregue. O período usa a data de criação do pedido
              no horário de Brasília, incluindo as duas datas. O total inclui entrega e descontos.
              Estes valores não descontam taxas do provedor e não representam saldo ou repasse confirmado.            </p>
          </section>

          {erro && (
            <p role="alert" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              {erro} {pedidos ? "Exibindo os últimos dados carregados. " : ""}
              Use “Atualizar dados” para tentar novamente.
            </p>
          )}
          {carregando && <p role="status" className="mb-5 text-sm text-gray-500">Consultando restaurante e pedidos...</p>}
          {!carregando && !erro && !restaurante && (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <p className="text-gray-600">Cadastre um restaurante para acompanhar o desempenho.</p>
              <button type="button" onClick={() => router.push("/restaurantes")}
                className="mt-4 font-semibold text-red-600">Ir para o início</button>
            </div>
          )}

          {resumo && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Indicador titulo="Total dos pedidos entregues" valor={moeda(resumo.total)} descricao="Com entrega e descontos" />
                <Indicador titulo="Pedidos entregues" valor={resumo.quantidade} descricao="Criados no período selecionado" />
                <Indicador titulo="Ticket médio" valor={moeda(resumo.ticket)} descricao="Total dividido pelos pedidos entregues" />
                <Indicador titulo="Descontos concedidos" valor={moeda(resumo.descontos)} descricao="Já deduzidos do total" />
              </div>
              <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="font-semibold text-gray-900">Composição do total</h2>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                  <div><dt className="text-gray-500">Subtotal dos produtos</dt><dd className="mt-1 font-semibold text-gray-900">{moeda(resumo.produtos)}</dd></div>
                  <div><dt className="text-gray-500">Taxas de entrega dos pedidos</dt><dd className="mt-1 font-semibold text-gray-900">{moeda(resumo.entrega)}</dd></div>
                  <div><dt className="text-gray-500">Descontos</dt><dd className="mt-1 font-semibold text-gray-900">− {moeda(resumo.descontos)}</dd></div>
                </dl>
              </section>
              <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-semibold text-gray-900">Histórico de pedidos entregues</h2>
                  <button type="button" onClick={() => router.push("/restaurantes/pedidos")}
                    className="text-sm font-semibold text-red-600">Ir para pedidos</button>
                </div>
                {resumo.lista.length === 0 ? (
                  <p role="status" className="py-12 text-center text-sm text-gray-500">
                    Nenhum pedido entregue criado neste período. Experimente outras datas.
                  </p>
                ) : (
                  <div className="mt-4 max-h-[600px] overflow-auto">
                    <table className="w-full whitespace-nowrap text-left text-sm">
                      <caption className="sr-only">Pedidos entregues por data de criação</caption>
                      <thead className="sticky top-0 bg-white text-xs text-gray-500">
                        <tr>
                          <th scope="col" className="p-3">Pedido</th>
                          <th scope="col" className="p-3">Criado em</th>
                          <th scope="col" className="p-3">Tipo</th>
                          <th scope="col" className="p-3 text-right">Produtos</th>
                          <th scope="col" className="p-3 text-right">Entrega</th>
                          <th scope="col" className="p-3 text-right">Desconto</th>
                          <th scope="col" className="p-3 text-right">Total</th>
                          <th scope="col" className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumo.lista.map((pedido) => (
                          <tr key={pedido.id_pedido} className="border-t border-gray-100 text-gray-700">
                            <td className="p-3 font-semibold">#{pedido.id_pedido}</td>
                            <td className="p-3">{dataPedido(pedido.created_at).toLocaleString("pt-BR", {
                              timeZone: FUSO_PAINEL, day: "2-digit", month: "2-digit", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}</td>
                            <td className="p-3">{pedido.tipo_entrega === "RETIRADA" ? "Retirada" : "Entrega"}</td>
                            <td className="p-3 text-right">{moeda(centavos(pedido.subtotal))}</td>
                            <td className="p-3 text-right">{moeda(centavos(pedido.taxa_entrega))}</td>
                            <td className="p-3 text-right">{moeda(centavos(pedido.desconto))}</td>
                            <td className="p-3 text-right font-semibold">{moeda(centavos(pedido.valor_total))}</td>
                            <td className="p-3"><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">Entregue</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}          {atualizadoEm && (
            <p className="mt-5 text-xs text-gray-400">
              Atualizado às {atualizadoEm.toLocaleTimeString("pt-BR", {timeZone: FUSO_PAINEL})}.
              Atualização automática a cada 30 segundos.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

function Indicador({ titulo, valor, descricao }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm text-gray-500">{titulo}</h2>
      <p className="mt-2 text-2xl font-bold text-gray-900">{valor}</p>
      <p className="mt-2 text-xs text-gray-400">{descricao}</p>
    </section>
  );
}

