"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Smartphone,
} from "lucide-react";

export default function DadosResponsavel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const celular = searchParams.get("celular") || "";

  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function formatarCelular(numero) {
    if (!numero) {
      return "Celular não informado";
    }

    return numero.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3"
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    const nomeFormatado = nome.trim();

    if (!nomeFormatado) {
      setErro("Informe o nome do responsável.");
      return;
    }

    if (nomeFormatado.length < 3) {
      setErro("Digite um nome válido.");
      return;
    }

    if (!email) {
      setErro("E-mail não informado.");
      return;
    }

    if (!celular) {
      setErro("Celular não informado.");
      return;
    }

    try {
      setCarregando(true);

      const response = await fetch(
        "http://127.0.0.1:8000/responsavel-restaurante/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: nomeFormatado,
            email: email,
            celular: celular,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErro(
          data.detail ||
            "Não foi possível cadastrar o responsável."
        );
        return;
      }

      console.log("Responsável cadastrado:", data);

      router.push(
        `/cadastro/restaurante/dados-restaurante?id_responsavel=${encodeURIComponent(
          data.id_responsavel
        )}`
      );
    } catch (error) {
      console.error(
        "Erro ao cadastrar responsável:",
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
              <User size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Dados do responsável
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Informe quem será o responsável pelo
              restaurante.
            </p>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit}>
            {/* NOME */}
            <div className="mt-8">
              <label
                htmlFor="nome"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Nome completo
              </label>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 transition focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100">
                <User
                  size={20}
                  className="text-gray-400"
                />

                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => {
                    setNome(event.target.value);
                    setErro("");
                  }}
                  placeholder="Digite seu nome completo"
                  className="h-12 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* E-MAIL */}
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Mail size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">
                  E-mail verificado
                </p>

                <p className="truncate font-medium text-gray-900">
                  {email || "E-mail não informado"}
                </p>
              </div>
            </div>

            {/* CELULAR */}
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Smartphone size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500">
                  Celular verificado
                </p>

                <p className="truncate font-medium text-gray-900">
                  {formatarCelular(celular)}
                </p>
              </div>
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