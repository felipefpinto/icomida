"use client";

import {useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  FileText,
  Store,
  Utensils,
} from "lucide-react";

export default function DadosRestaurante() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idResponsavel = searchParams.get("id_responsavel");

  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [categoriasAbertas, setCategoriasAbertas] = useState(false);
  const [descricao, setDescricao] = useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);


  useEffect(() => {
  async function carregarCategorias() {
    try {
      setCarregandoCategorias(true);

      const response = await fetch(
        "http://127.0.0.1:8000/categorias/"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar as categorias."
        );
      }

      setCategorias(data);
    } catch (error) {
      console.error(
        "Erro ao carregar categorias:",
        error
      );

      setErro(
        "Não foi possível carregar as categorias."
      );
    } finally {
      setCarregandoCategorias(false);
    }
  }

  carregarCategorias();
}, []);

    function alternarCategoria(idCategoria) {
  setCategoriasSelecionadas((categoriasAtuais) => {
    if (categoriasAtuais.includes(idCategoria)) {
      return categoriasAtuais.filter(
        (id) => id !== idCategoria
      );
    }

    return [
      ...categoriasAtuais,
      idCategoria,
    ];
  });

  setErro("");
}

  function formatarCnpj(valor) {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, 14);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 5) {
      return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
    }

    if (numeros.length <= 8) {
      return `${numeros.slice(0, 2)}.${numeros.slice(
        2,
        5
      )}.${numeros.slice(5)}`;
    }

    if (numeros.length <= 12) {
      return `${numeros.slice(0, 2)}.${numeros.slice(
        2,
        5
      )}.${numeros.slice(5, 8)}/${numeros.slice(8)}`;
    }

    return `${numeros.slice(0, 2)}.${numeros.slice(
      2,
      5
    )}.${numeros.slice(5, 8)}/${numeros.slice(
      8,
      12
    )}-${numeros.slice(12)}`;
  }

  function handleCnpjChange(event) {
    setCnpj(formatarCnpj(event.target.value));
    setErro("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    const cnpjNumeros = cnpj.replace(/\D/g, "");

    if (!idResponsavel) {
      setErro("Responsável não identificado.");
      return;
    }

    if (cnpjNumeros.length !== 14) {
      setErro("Informe um CNPJ válido.");
      return;
    }

    if (!razaoSocial.trim()) {
      setErro("Informe a razão social.");
      return;
    }

    if (!nomeFantasia.trim()) {
      setErro("Informe o nome fantasia.");
      return;
    }

    if (categoriasSelecionadas.length === 0) {
  setErro(
    "Selecione pelo menos uma categoria."
  );
  return;
}

    try {
      setCarregando(true);

      const response = await fetch(
        "http://127.0.0.1:8000/restaurantes/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            cnpj: cnpjNumeros,
            razao_social: razaoSocial.trim(),
            nome_fantasia: nomeFantasia.trim(),
            categoria_ids: categoriasSelecionadas,
            descricao: descricao.trim() || null,

            responsavel_id: Number(idResponsavel),

            canais_venda: [],
            horarios_funcionamento: [],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Erro retornado pela API:",
          data
        );

        if (typeof data.detail === "string") {
          setErro(data.detail);
          return;
        }

        if (Array.isArray(data.detail)) {
          const mensagem =
            data.detail[0]?.msg ||
            "Dados inválidos.";

          setErro(mensagem);
          return;
        }

        setErro(
          "Não foi possível cadastrar o restaurante."
        );

        return;
      }

      console.log(
        "Restaurante cadastrado:",
        data
      );

      router.push(
        `/cadastro/restaurante/canais-venda?id_restaurante=${encodeURIComponent(
          data.id_restaurante
        )}`
      );
    } catch (error) {
      console.error(
        "Erro ao cadastrar restaurante:",
        error
      );

      setErro(
        "Não foi possível conectar com o servidor."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* VOLTAR */}
        <button
  type="button"
  onClick={() => router.back()}
  className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
>
  <ArrowLeft size={18} />
  Voltar
</button>

        {/* CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* ÍCONE */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Store size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Dados do restaurante
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Agora informe os dados principais do seu
              estabelecimento.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            {/* CNPJ */}
            <div>
              <label
                htmlFor="cnpj"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                CNPJ
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 transition focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100">
                <FileText
                  size={20}
                  className="text-gray-400"
                />

                <input
                  id="cnpj"
                  type="text"
                  inputMode="numeric"
                  value={cnpj}
                  onChange={handleCnpjChange}
                  placeholder="00.000.000/0000-00"
                  className="h-12 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* RAZÃO SOCIAL */}
            <div className="mt-4">
              <label
                htmlFor="razaoSocial"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Razão social
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 transition focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100">
                <Building2
                  size={20}
                  className="text-gray-400"
                />

                <input
                  id="razaoSocial"
                  type="text"
                  value={razaoSocial}
                  onChange={(event) => {
                    setRazaoSocial(
                      event.target.value
                    );
                    setErro("");
                  }}
                  placeholder="Ex: Restaurante Exemplo LTDA"
                  className="h-12 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* NOME FANTASIA */}
            <div className="mt-4">
              <label
                htmlFor="nomeFantasia"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nome fantasia
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 transition focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100">
                <Store
                  size={20}
                  className="text-gray-400"
                />

                <input
                  id="nomeFantasia"
                  type="text"
                  value={nomeFantasia}
                  onChange={(event) => {
                    setNomeFantasia(
                      event.target.value
                    );
                    setErro("");
                  }}
                  placeholder="Ex: Burguer House"
                  className="h-12 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* CATEGORIA */}
            {/* CATEGORIAS */}
<div className="relative mt-4">
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Categorias
  </label>

  {/* CAMPO */}
  <button
    type="button"
    onClick={() =>
      setCategoriasAbertas(
        !categoriasAbertas
      )
    }
    className="
      flex min-h-12 w-full
      items-center justify-between
      rounded-lg border border-gray-300
      bg-white px-4 py-3
      text-left
      transition
      hover:border-gray-400
      focus:border-red-600
      focus:outline-none
      focus:ring-2
      focus:ring-red-100
    "
  >
    <div className="flex min-w-0 items-center gap-3">
      <Utensils
        size={20}
        className="shrink-0 text-gray-400"
      />

      {categoriasSelecionadas.length === 0 ? (
        <span className="text-sm text-gray-400">
          Selecione as categorias
        </span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {categorias
  .filter((categoria) =>
    categoriasSelecionadas.includes(
      categoria.id
    )
  )
  .map((categoria) => (
    <span
      key={categoria.id}
      className="
        flex items-center gap-1.5
        rounded-full
        bg-red-50
        py-1 pl-2.5 pr-1.5
        text-xs font-medium
        text-red-700
      "
    >
      {categoria.nome}

      <span
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();

          alternarCategoria(
            categoria.id
          );
        }}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            event.stopPropagation();

            alternarCategoria(
              categoria.id
            );
          }
        }}
        className="
          flex h-5 w-5
          items-center justify-center
          rounded-full
          text-red-500
          transition
          hover:bg-red-100
          hover:text-red-700
        "
        aria-label={`Remover ${categoria.nome}`}
      >
        ×
      </span>
    </span>
  ))}
        </div>
      )}
    </div>

    <svg
      className={`
        ml-3 h-4 w-4 shrink-0
        text-gray-400
        transition-transform
        ${
          categoriasAbertas
            ? "rotate-180"
            : ""
        }
      `}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  </button>

  {/* JANELA */}
  {categoriasAbertas && (
    <div
      className="
        absolute z-20 mt-2
        w-full
        overflow-hidden
        rounded-xl
        border border-gray-200
        bg-white
        shadow-lg
      "
    >
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">
          Selecione as categorias
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Você pode escolher mais de uma.
        </p>
      </div>

      <div className="max-h-64 overflow-y-auto p-2">
        {carregandoCategorias ? (
          <p className="px-3 py-4 text-center text-sm text-gray-500">
            Carregando categorias...
          </p>
        ) : categorias.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-gray-500">
            Nenhuma categoria disponível.
          </p>
        ) : (
          categorias.map((categoria) => {
            const selecionada =
              categoriasSelecionadas.includes(
                categoria.id
              );

            return (
              <button
                key={categoria.id}
                type="button"
                onClick={() =>
                  alternarCategoria(
                    categoria.id
                  )
                }
                className={`
                  flex w-full
                  items-center gap-3
                  rounded-lg px-3 py-3
                  text-left
                  transition
                  ${
                    selecionada
                      ? "bg-red-50"
                      : "hover:bg-gray-50"
                  }
                `}
              >
                {/* CHECKBOX VISUAL */}
                <div
                  className={`
                    flex h-5 w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded
                    border
                    ${
                      selecionada
                        ? "border-red-600 bg-red-600"
                        : "border-gray-300 bg-white"
                    }
                  `}
                >
                  {selecionada && (
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.292a1 1 0 010 1.416l-8 8a1 1 0 01-1.416 0l-4-4a1 1 0 011.416-1.416L8 12.586l7.296-7.294a1 1 0 011.408 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`
                      text-sm font-medium
                      ${
                        selecionada
                          ? "text-red-700"
                          : "text-gray-800"
                      }
                    `}
                  >
                    {categoria.nome}
                  </p>

                  {categoria.descricao && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {categoria.descricao}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* RODAPÉ */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-xs text-gray-500">
          {categoriasSelecionadas.length}{" "}
          {categoriasSelecionadas.length === 1
            ? "selecionada"
            : "selecionadas"}
        </span>

        <button
          type="button"
          onClick={() =>
            setCategoriasAbertas(false)
          }
          className="
            rounded-lg
            bg-red-600
            px-4 py-2
            text-xs font-semibold
            text-white
            transition
            hover:bg-red-700
          "
        >
          Concluir
        </button>
      </div>
    </div>
  )}
</div>

            {/* DESCRIÇÃO */}
            <div className="mt-4">
              <label
                htmlFor="descricao"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Descrição
                <span className="ml-1 text-gray-400">
                  (opcional)
                </span>
              </label>

              <textarea
                id="descricao"
                value={descricao}
                maxLength={500}
                onChange={(event) => {
                  setDescricao(event.target.value);
                  setErro("");
                }}
                placeholder="Conte um pouco sobre o restaurante..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-100"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {descricao.length}/500
              </p>
            </div>

            {/* ERRO */}
            {erro && (
              <p className="mt-4 text-center text-sm text-red-600">
                {erro}
              </p>
            )}

            {/* CONTINUAR */}
            <button
              type="submit"
              disabled={carregando}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {carregando
                ? "Cadastrando..."
                : "Continuar"}

              {!carregando && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}