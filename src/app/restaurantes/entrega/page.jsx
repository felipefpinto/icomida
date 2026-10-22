"use client";

import { useEffect, useState } from "react";
import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

import {
  Bike,
  CheckCircle,
  Loader2,
  MapPin,
  Save,
  Truck,
  Pencil,
  Trash2,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function EntregaRestaurante() {
  const [restauranteId, setRestauranteId] = useState(null);

  const [configuracaoExiste, setConfiguracaoExiste] =
    useState(false);

  const [faixas, setFaixas] = useState([]);  
  const [carregando, setCarregando] = useState(true);
  const [modalFaixaAberto, setModalFaixaAberto] =
  useState(false);
  const [faixaEditando, setFaixaEditando] =
  useState(null);

const [salvandoFaixa, setSalvandoFaixa] =
  useState(false);

const [novaFaixa, setNovaFaixa] = useState({
  distancia_min_km: "",
  distancia_max_km: "",
  taxa: "",
});  

  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [form, setForm] = useState({
    raio_entrega_km: "",
    valor_minimo_pedido: "",
    entrega_gratis: false,
    valor_minimo_entrega_gratis: "",
    ativo: true,
  });

useEffect(() => {
  const id = localStorage.getItem(
    "restauranteSelecionadoId"
  );

  if (!id) {
    setErro("Nenhum restaurante selecionado.");
    setCarregando(false);
    return;
  }

  setRestauranteId(Number(id));
  carregarConfiguracao(Number(id));
}, []);
  async function carregarConfiguracao(id) {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(
        `${API_URL}/restaurantes/${id}/configuracao-entrega/`
      );

      if (response.status === 404) {
        setConfiguracaoExiste(false);
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar as configurações."
        );
      }

      const dados = await response.json();

      setConfiguracaoExiste(true);

      setFaixas(dados.faixas || []);

      setForm({
        raio_entrega_km:
          dados.raio_entrega_km ?? "",

        valor_minimo_pedido:
          dados.valor_minimo_pedido ?? "",

        entrega_gratis:
          dados.entrega_gratis ?? false,

        valor_minimo_entrega_gratis:
          dados.valor_minimo_entrega_gratis ?? "",

        ativo:
          dados.ativo ?? true,
      });
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar as configurações de entrega."
      );
    } finally {
      setCarregando(false);
    }
  }

  function alterarCampo(event) {
    const { name, value, type, checked } =
      event.target;

    setForm((anterior) => ({
      ...anterior,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function abrirEdicaoFaixa(faixa) {
  setErro("");
  setSucesso("");

  setFaixaEditando(faixa);

  setNovaFaixa({
    distancia_min_km:
      faixa.distancia_min_km.toString(),

    distancia_max_km:
      faixa.distancia_max_km.toString(),

    taxa:
      faixa.taxa.toString(),
  });

  setModalFaixaAberto(true);
}

async function excluirFaixa(faixa) {
  if (!restauranteId) {
    return;
  }

  const confirmar = window.confirm(
    `Tem certeza que deseja excluir a faixa de ${Number(
      faixa.distancia_min_km
    ).toLocaleString("pt-BR")} km até ${Number(
      faixa.distancia_max_km
    ).toLocaleString("pt-BR")} km?`
  );

  if (!confirmar) {
    return;
  }

  setErro("");
  setSucesso("");

  try {
    const response = await fetch(
      `${API_URL}/restaurantes/${restauranteId}/configuracao-entrega/faixas/${faixa.id_faixa}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const dados =
        await response.json().catch(() => ({}));

      throw new Error(
        dados.detail ||
          "Não foi possível excluir a faixa."
      );
    }

    setFaixas((anteriores) =>
      anteriores.filter(
        (item) =>
          item.id_faixa !== faixa.id_faixa
      )
    );

    setSucesso(
      "Faixa de entrega excluída com sucesso."
    );
  } catch (error) {
    console.error(
      "Erro ao excluir faixa:",
      error
    );

    setErro(
      error.message ||
        "Não foi possível excluir a faixa."
    );
  }
}
async function adicionarFaixa(event) {
  event.preventDefault();

  if (!restauranteId) {
    return;
  }

  setErro("");
  setSucesso("");

  const distanciaMin = Number(
    novaFaixa.distancia_min_km
  );

  const distanciaMax = Number(
    novaFaixa.distancia_max_km
  );

  const taxa = Number(novaFaixa.taxa);

  if (
    novaFaixa.distancia_min_km === "" ||
    novaFaixa.distancia_max_km === "" ||
    novaFaixa.taxa === ""
  ) {
    setErro("Preencha todos os campos da faixa.");
    return;
  }

  if (distanciaMin < 0) {
    setErro(
      "A distância inicial não pode ser negativa."
    );
    return;
  }

  if (distanciaMax <= distanciaMin) {
    setErro(
      "A distância final deve ser maior que a inicial."
    );
    return;
  }

  if (taxa < 0) {
    setErro(
      "A taxa de entrega não pode ser negativa."
    );
    return;
  }

  try {
    setSalvandoFaixa(true);

    const url = faixaEditando
  ? `${API_URL}/restaurantes/${restauranteId}/configuracao-entrega/faixas/${faixaEditando.id_faixa}`
  : `${API_URL}/restaurantes/${restauranteId}/configuracao-entrega/faixas/`;

const response = await fetch(url, {
  method: faixaEditando
    ? "PATCH"
    : "POST",

  headers: {
    "Content-Type": "application/json",
  },

  body: JSON.stringify({
    distancia_min_km: distanciaMin,
    distancia_max_km: distanciaMax,
    taxa: taxa,
    ativo: faixaEditando
      ? faixaEditando.ativo
      : true,
    ordem: faixaEditando
      ? faixaEditando.ordem
      : faixas.length,
  }),
});

    const dados =
      await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível cadastrar a faixa."
      );
    }

if (faixaEditando) {
  setFaixas((anteriores) =>
    anteriores.map((faixa) =>
      faixa.id_faixa === dados.id_faixa
        ? dados
        : faixa
    )
  );
} else {
  setFaixas((anteriores) => [
    ...anteriores,
    dados,
  ]);
}

setNovaFaixa({
  distancia_min_km: "",
  distancia_max_km: "",
  taxa: "",
});

setFaixaEditando(null);
setModalFaixaAberto(false);

setSucesso(
  faixaEditando
    ? "Faixa de entrega atualizada com sucesso."
    : "Faixa de entrega cadastrada com sucesso."
);
  } catch (error) {
    console.error(
      "Erro ao cadastrar faixa:",
      error
    );

    setErro(
      error.message ||
        "Não foi possível cadastrar a faixa."
    );
  } finally {
    setSalvandoFaixa(false);
  }
}
  async function salvarConfiguracao(event) {
    event.preventDefault();

    if (!restauranteId) {
      return;
    }

    setErro("");
    setSucesso("");

    if (
      !form.raio_entrega_km ||
      Number(form.raio_entrega_km) <= 0
    ) {
      setErro(
        "Informe um raio de entrega válido."
      );
      return;
    }

    if (
      form.valor_minimo_pedido === "" ||
      Number(form.valor_minimo_pedido) < 0
    ) {
      setErro(
        "Informe um valor mínimo de pedido válido."
      );
      return;
    }

    if (
      form.entrega_gratis &&
      (
        form.valor_minimo_entrega_gratis === "" ||
        Number(
          form.valor_minimo_entrega_gratis
        ) < 0
      )
    ) {
      setErro(
        "Informe o valor mínimo para entrega grátis."
      );
      return;
    }

    const payload = {
      raio_entrega_km:
        Number(form.raio_entrega_km),

      valor_minimo_pedido:
        Number(form.valor_minimo_pedido),

      entrega_gratis:
        form.entrega_gratis,

      valor_minimo_entrega_gratis:
        form.entrega_gratis
          ? Number(
              form.valor_minimo_entrega_gratis
            )
          : null,

      ativo:
        form.ativo,
    };

    try {
      setSalvando(true);

      const response = await fetch(
        `${API_URL}/restaurantes/${restauranteId}/configuracao-entrega/`,
        {
          method: configuracaoExiste
            ? "PATCH"
            : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(
          dados.detail ||
            "Não foi possível salvar."
        );
      }

      setConfiguracaoExiste(true);

      setSucesso(
        "Configurações de entrega salvas com sucesso."
      );

      setForm({
        raio_entrega_km:
          dados.raio_entrega_km ?? "",

        valor_minimo_pedido:
          dados.valor_minimo_pedido ?? "",

        entrega_gratis:
          dados.entrega_gratis ?? false,

        valor_minimo_entrega_gratis:
          dados.valor_minimo_entrega_gratis ?? "",

        ativo:
          dados.ativo ?? true,
      });
    } catch (error) {
      console.error(error);

      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2
            size={22}
            className="animate-spin"
          />

          Carregando configurações...
        </div>
      </div>
    );
  }

  
    return (
        <div className="flex min-h-screen bg-gray-50">
            <SidebarRestaurante />

            <main className="flex-1 px-4 py-10 lg:px-10">
                <div className="mx-auto w-full max-w-5xl">

        {/* CABEÇALHO */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <Bike
                size={23}
                className="text-red-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Entrega
              </h1>

              <p className="text-sm text-gray-500">
                Configure sua área e suas taxas de entrega.
              </p>
            </div>
          </div>
        </div>

        {/* MENSAGENS */}
        {erro && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle size={18} />

            {sucesso}
          </div>
        )}

        {/* CONFIGURAÇÃO */}
        <form
          onSubmit={salvarConfiguracao}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <MapPin
              size={21}
              className="text-red-600"
            />

            <div>
              <h2 className="font-bold text-gray-900">
                Área de entrega
              </h2>

              <p className="text-sm text-gray-500">
                Defina até onde seu restaurante realiza entregas.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* RAIO */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Raio máximo de entrega
              </label>

              <div className="relative">
                <input
                  type="number"
                  name="raio_entrega_km"
                  min="0.1"
                  step="0.1"
                  value={form.raio_entrega_km}
                  onChange={alterarCampo}
                  className="w-full text-sm
                        text-gray-900 rounded-xl border border-gray-300 px-4 py-3 pr-14 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  placeholder="8"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  km
                </span>
              </div>
            </div>

            {/* PEDIDO MÍNIMO */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Pedido mínimo
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  R$
                </span>

                <input
                  type="number"
                  name="valor_minimo_pedido"
                  min="0"
                  step="0.01"
                  value={form.valor_minimo_pedido}
                  onChange={alterarCampo}
                  className="w-full text-sm
                        text-gray-900 rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  placeholder="30,00"
                />
              </div>
            </div>
          </div>

          {/* ENTREGA GRÁTIS */}
          <div className="mt-8 border-t border-gray-100 pt-6">

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="entrega_gratis"
                checked={form.entrega_gratis}
                onChange={alterarCampo}
                className="mt-1 h-4 w-4 accent-red-600"
              />

              <div>
                <p className="font-medium text-gray-900">
                  Oferecer entrega grátis
                </p>

                <p className="text-sm text-gray-500">
                  Defina um valor mínimo para o cliente ganhar frete grátis.
                </p>
              </div>
            </label>

            {form.entrega_gratis && (
              <div className="mt-5 max-w-sm">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Entrega grátis acima de
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    R$
                  </span>

                  <input
                    type="number"
                    name="valor_minimo_entrega_gratis"
                    min="0"
                    step="0.01"
                    value={
                      form.valor_minimo_entrega_gratis
                    }
                    onChange={alterarCampo}
                    className="w-full rounded-xl text-sm
                        text-gray-900 border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    placeholder="80,00"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ATIVO */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  Entregas ativas
                </p>

                <p className="text-sm text-gray-500">
                  Permitir que clientes recebam pedidos por entrega.
                </p>
              </div>

              <input
                type="checkbox"
                name="ativo"
                checked={form.ativo}
                onChange={alterarCampo}
                className="h-5 w-5 accent-red-600"
              />
            </label>
          </div>

          {/* SALVAR */}
          <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save size={18} />
              )}

              {salvando
                ? "Salvando..."
                : "Salvar configurações"}
            </button>
          </div>
        </form>

        {/* TAXAS */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
  <div className="flex items-center gap-3">
    <Truck
      size={21}
      className="text-red-600"
    />

    <div>
      <h2 className="font-bold text-gray-900">
        Taxas por distância
      </h2>

      <p className="text-sm text-gray-500">
        Configure quanto será cobrado de acordo
        com a distância.
      </p>
    </div>
  </div>

  {configuracaoExiste && (
    <button
      type="button"
      onClick={() => {
  setErro("");
  setSucesso("");

  setFaixaEditando(null);

  setNovaFaixa({
    distancia_min_km: "",
    distancia_max_km: "",
    taxa: "",
  });

  setModalFaixaAberto(true);
}}
      className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
    >
      + Adicionar faixa
    </button>
  )}
</div>

{faixas.length === 0 ? (
  <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-5 py-10 text-center">
    <Truck
      size={28}
      className="mx-auto text-gray-400"
    />

    <p className="mt-3 font-medium text-gray-700">
      Nenhuma taxa cadastrada
    </p>

    <p className="mt-1 text-sm text-gray-500">
      Adicione faixas de distância para definir
      suas taxas de entrega.
    </p>
  </div>
) : (
  <div className="mt-6 space-y-3">
    {faixas.map((faixa) => (
      <div
        key={faixa.id_faixa}
        className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-5 py-4"
      >
        <div className="flex items-center gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
            <MapPin
              size={19}
              className="text-red-600"
            />
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              {Number(
                faixa.distancia_min_km
              ).toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })}
              {" km até "}
              {Number(
                faixa.distancia_max_km
              ).toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })}
              {" km"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Faixa de entrega
            </p>
          </div>
        </div>

<div className="flex items-center gap-4">
  <div className="text-right">
    <p className="text-lg font-bold text-gray-900">
      {Number(
        faixa.taxa
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
    </p>

    <p
      className={`mt-1 text-xs font-medium ${
        faixa.ativo
          ? "text-green-600"
          : "text-gray-400"
      }`}
    >
      {faixa.ativo
        ? "Ativa"
        : "Inativa"}
    </p>
  </div>

  <button
    type="button"
    onClick={() =>
      abrirEdicaoFaixa(faixa)
    }
    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    title="Editar faixa"
  >
    <Pencil size={16} />
  </button>

  <button
  type="button"
  onClick={() =>
    excluirFaixa(faixa)
  }
  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
  title="Excluir faixa"
>
  <Trash2 size={16} />
</button>
</div>
      </div>
    ))}
  </div>
  
)}


      </section>

      </div>
    </main>

    {modalFaixaAberto  && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      <div>
<h2 className="text-xl font-bold text-gray-900">
  {faixaEditando
    ? "Editar faixa"
    : "Adicionar faixa"}
</h2>

        <p className="mt-1 text-sm text-gray-500">
          Defina a distância e a taxa de entrega.
        </p>
      </div>

      <form
        onSubmit={adicionarFaixa}
        className="mt-6"
      >
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              De
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.1"
                value={
                  novaFaixa.distancia_min_km
                }
                onChange={(event) =>
                  setNovaFaixa((anterior) => ({
                    ...anterior,
                    distancia_min_km:
                      event.target.value,
                  }))
                }
                className="w-full rounded-lg border text-sm
                        text-gray-900 border-gray-300 px-3 py-3 pr-10 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder="0"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                km
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Até
            </label>

            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.1"
                value={
                  novaFaixa.distancia_max_km
                }
                onChange={(event) =>
                  setNovaFaixa((anterior) => ({
                    ...anterior,
                    distancia_max_km:
                      event.target.value,
                  }))
                }
                className="w-full text-sm
                        text-gray-900 rounded-lg border border-gray-300 px-3 py-3 pr-10 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder="2"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                km
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Taxa de entrega
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              R$
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              value={novaFaixa.taxa}
              onChange={(event) =>
                setNovaFaixa((anterior) => ({
                  ...anterior,
                  taxa: event.target.value,
                }))
              }
              className="w-full text-sm
                        text-gray-900 rounded-lg border border-gray-300 py-3 pl-11 pr-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="5,00"
            />
          </div>
        </div>

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            disabled={salvandoFaixa}
            onClick={() => {
            setModalFaixaAberto(false);
            setFaixaEditando(null);

            setNovaFaixa({
                distancia_min_km: "",
                distancia_max_km: "",
                taxa: "",
            });
            }}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={salvandoFaixa}
            className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {salvandoFaixa
  ? "Salvando..."
  : faixaEditando
  ? "Salvar alterações"
  : "Adicionar"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
    
  );
}