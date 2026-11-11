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
  const dias = [];
  for (let dia = inicio; dia <= fim; dia = somarDias(dia, 1)) {
    dias.push({ dia, total: 0, pedidos: 0 });
  }
  const porDia = new Map(dias.map((item) => [item.dia, item]));
  const status = new Map();
  const produtos = new Map();
  let quantidade = 0, vendas = 0, quantidadeVendas = 0, cancelados = 0;
  for (const pedido of pedidos) {
    const dia = diaISO(dataPedido(pedido.created_at));
    if (dia < inicio || dia > fim) continue;
    quantidade++;
    status.set(pedido.status, (status.get(pedido.status) || 0) + 1);
    if (["CANCELADO", "RECUSADO"].includes(pedido.status)) cancelados++;
    if (!STATUS_VENDA.has(pedido.status)) continue;
    quantidadeVendas++;
    const total = centavos(pedido.valor_total);
    vendas += total;
    porDia.get(dia).total += total;
    porDia.get(dia).pedidos++;
    for (const item of pedido.itens || []) {
      const chave = item.id_produto == null ? "nome:" + item.nome_produto : "id:" + item.id_produto;
      const produto = produtos.get(chave) || { chave, nome: item.nome_produto, quantidade: 0 };
      produto.quantidade += item.quantidade;
      produtos.set(chave, produto);
    }
  }
  return {
    quantidade, vendas, cancelados,
    ticket: quantidadeVendas ? Math.round(vendas / quantidadeVendas) : 0,
    taxa: quantidade ? cancelados * 100 / quantidade : 0,
    dias,
    status: [...status.entries()].sort((a, b) => b[1] - a[1]),
    produtos: [...produtos.values()].sort((a, b) =>
      b.quantidade - a.quantidade || a.nome.localeCompare(b.nome, "pt-BR")
    ).slice(0, 5),
  };
}
async function consultar(caminho, signal) {
  const response = await fetch(API_URL + caminho, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("Não foi possível consultar a API.");
  return response.json();
}

export default function VisaoGeral() {
  const router = useRouter();
  const [restaurante, setRestaurante] = useState(null);
  const [pedidos, setPedidos] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [tentativa, setTentativa] = useState(0);
  const [diaDetalhe, setDiaDetalhe] = useState(null);
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
              centavos(pedido.valor_total);
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
            if (!controller.signal.aborted) setErro("Não foi possível atualizar os dados da visão geral.");
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
  const maiorVenda = resumo ? Math.max(1, ...resumo.dias.map((dia) => dia.total)) : 1;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarRestaurante />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderRestaurante />
        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visão geral</h1>
              <p className="mt-1 text-sm text-gray-500">
                {restaurante?.nome_fantasia || "Desempenho do restaurante"}
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
              Período pela data de criação do pedido, no horário de Brasília, incluindo as duas datas.
              Vendas, ticket e pratos vendidos consideram pedidos aceitos ou em etapas posteriores.
              Vendas incluem entrega e descontos. Pedidos pendentes, recusados e cancelados não entram nas vendas.
            </p>
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
                <Indicador titulo="Pedidos no período" valor={resumo.quantidade} descricao="Todos os status" />
                <Indicador titulo="Vendas no período" valor={moeda(resumo.vendas)} descricao="Pedidos aceitos ou em etapas posteriores" />
                <Indicador titulo="Ticket médio" valor={moeda(resumo.ticket)} descricao="Média dos pedidos considerados nas vendas" />
                <Indicador titulo="Cancelados / recusados" valor={resumo.cancelados}
                  descricao={resumo.taxa.toLocaleString("pt-BR", {maximumFractionDigits: 1}) + "% dos pedidos no período"} />
              </div>
              {resumo.quantidade === 0 && (
                <p role="status" className="mt-5 rounded-xl bg-white p-5 text-sm text-gray-600">
                  Nenhum pedido encontrado neste período. Experimente outras datas.
                </p>
              )}

              <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="font-semibold text-gray-900">Vendas por dia</h2>
                <p className="mt-1 text-xs text-gray-500">Passe o mouse ou toque em uma barra para consultar o valor.</p>
                <div className="mt-5 overflow-x-auto">
                  <div className="flex h-64 items-end gap-3 pb-1" style={{minWidth: Math.max(300, resumo.dias.length * 54)}}>
                    {resumo.dias.map((dia) => (
                      <div key={dia.dia} className="flex h-full min-w-10 flex-1 flex-col justify-end">
                        <div className="flex h-52 items-end justify-center">
                          <button type="button"
                            aria-label={dia.dia.split("-").reverse().join("/") + ": " + moeda(dia.total)}
                            title={dia.dia.split("-").reverse().join("/") + " — " + moeda(dia.total)}
                            onClick={() => setDiaDetalhe({dia: dia.dia, total: dia.total})}
                            className="w-full max-w-10 rounded-t bg-red-500 transition hover:bg-red-600 focus:outline-2 focus:outline-red-800"
                            style={{height: Math.max(2, dia.total / maiorVenda * 100) + "%"}} />
                        </div>
                        <span className="mt-2 text-center text-[10px] text-gray-500">
                          {dia.dia.slice(8)}/{dia.dia.slice(5, 7)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p role="status" className="mt-3 text-sm text-gray-700">
                  {diaDetalhe && resumo.dias.some((dia) => dia.dia === diaDetalhe.dia)
                    ? diaDetalhe.dia.split("-").reverse().join("/") + ": " + moeda(resumo.dias.find((dia) => dia.dia === diaDetalhe.dia).total)
                    : "Selecione uma barra para ver o total do dia."}
                </p>
                <details className="mt-4 text-sm text-gray-600">
                  <summary className="cursor-pointer font-medium">Ver valores em tabela</summary>
                  <div className="mt-3 max-h-64 overflow-auto">
                    <table className="w-full text-left">
                      <thead><tr><th scope="col" className="p-2">Data</th><th scope="col" className="p-2">Vendas</th></tr></thead>
                      <tbody>{resumo.dias.map((dia) => (
                        <tr key={dia.dia} className="border-t border-gray-100">
                          <td className="p-2">{dia.dia.split("-").reverse().join("/")}</td>
                          <td className="p-2">{moeda(dia.total)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </details>
              </section>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h2 className="font-semibold text-gray-900">Pratos mais vendidos</h2>
                  <p className="mt-1 text-xs text-gray-500">Os cinco primeiros por quantidade de unidades.</p>
                  {resumo.produtos.length === 0
                    ? <p className="py-8 text-sm text-gray-500">Nenhum prato vendido no período.</p>
                    : <ol className="mt-5 divide-y divide-gray-100">
                        {resumo.produtos.map((produto, indice) => (
                          <li key={produto.chave} className="flex items-center justify-between gap-4 py-4 text-sm">
                            <span className="text-gray-700">{indice + 1}. {produto.nome}</span>
                            <strong className="shrink-0 text-red-600">{produto.quantidade} un.</strong>
                          </li>
                        ))}
                      </ol>}
                </section>
                <section className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h2 className="font-semibold text-gray-900">Pedidos por status</h2>
                  {resumo.status.length === 0
                    ? <p className="py-8 text-sm text-gray-500">Nenhum pedido no período.</p>
                    : <div className="mt-5 space-y-4">
                        {resumo.status.map(([status, quantidade]) => (
                          <div key={status}>
                            <div className="mb-2 flex justify-between gap-4 text-sm">
                              <span className="text-gray-600">{STATUS_ROTULOS[status] || status}</span>
                              <span className="font-medium text-gray-900">{quantidade} ({Math.round(quantidade / resumo.quantidade * 100)}%)</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-red-500" style={{width: quantidade / resumo.quantidade * 100 + "%"}} />
                            </div>
                          </div>
                        ))}
                      </div>}
                </section>
              </div>
            </>
          )}
          {atualizadoEm && (
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
