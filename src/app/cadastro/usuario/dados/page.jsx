"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export default function DadosUsuario() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const telefone = searchParams.get("telefone") || "";

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function formatarCpf(value) {
    const numeros = value.replace(/\D/g, "");

    if (numeros.length <= 3) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    }

    if (numeros.length <= 9) {
      return `${numeros.slice(0, 3)}.${numeros.slice(
        3,
        6
      )}.${numeros.slice(6)}`;
    }

    return `${numeros.slice(0, 3)}.${numeros.slice(
      3,
      6
    )}.${numeros.slice(6, 9)}-${numeros.slice(9, 11)}`;
  }

  function handleCpfChange(event) {
    const value = event.target.value;

    if (value.replace(/\D/g, "").length > 11) {
      return;
    }

    setCpf(formatarCpf(value));
    setErro("");
  }

  async function cadastrar() {
    setErro("");

    if (!nome.trim()) {
        setErro("Digite seu nome completo.");
        return;
    }

    const cpfNumeros = cpf.replace(/\D/g, "");
    const celularNumeros = telefone.replace(/\D/g, "");

    if (cpfNumeros.length > 0 && cpfNumeros.length !== 11) {
        setErro("Digite um CPF válido.");
        return;
    }

    if (celularNumeros.length !== 11) {
        setErro("Telefone inválido.");
        return;
    }

    try {
        setCarregando(true);

        const response = await fetch(
        "http://127.0.0.1:8000/usuario/",
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            nome: nome.trim(),
            email: email,
            celular: celularNumeros,
            cpf: cpfNumeros || null,
            }),
        }
        );

        const data = await response.json();

        if (!response.ok) {
        if (Array.isArray(data.detail)) {
            setErro("Verifique os dados informados.");
        } else {
            setErro(
            data.detail || "Não foi possível realizar o cadastro."
            );
        }

        return;
        }

        console.log("Usuário cadastrado:", data);

        // Cadastro realizado com sucesso
        router.push("/login");

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);

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
        <Link
          href={`/cadastro/usuario/verificar-telefone?email=${encodeURIComponent(
            email
          )}&telefone=${encodeURIComponent(telefone)}`}
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            text-gray-600
            transition
            hover:text-red-600
          "
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* ÍCONE */}
          <div className="mb-6 flex justify-center">
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-red-50
                text-red-600
              "
            >
              <User size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">

            <h1 className="text-2xl font-bold text-gray-900">
              Finalize seu cadastro
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Informe seus dados para criar sua conta.
            </p>

          </div>

          {/* NOME */}
          <div className="mt-8">

            <label
              htmlFor="nome"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Nome completo
            </label>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                transition
                focus-within:border-red-600
                focus-within:ring-2
                focus-within:ring-red-100
              "
            >
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
                className="
                  h-12
                  w-full
                  bg-transparent
                  text-sm
                  text-gray-900
                  outline-none
                  placeholder:text-gray-400
                "
              />
            </div>

          </div>

          {/* CPF */}
          <div className="mt-5">

            <label
              htmlFor="cpf"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              CPF
              <span className="ml-1 text-gray-400">
                (Opcional)
              </span>
            </label>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                transition
                focus-within:border-red-600
                focus-within:ring-2
                focus-within:ring-red-100
              "
            >
              <CreditCard
                size={20}
                className="text-gray-400"
              />

              <input
                id="cpf"
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className="
                  h-12
                  w-full
                  bg-transparent
                  text-sm
                  text-gray-900
                  outline-none
                  placeholder:text-gray-400
                "
              />
            </div>

          </div>

          {/* EMAIL */}
          <div className="mt-5">

            <label
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-lg
                border
                border-gray-200
                bg-gray-50
                px-4
              "
            >
              <Mail
                size={20}
                className="text-gray-400"
              />

              <div className="flex h-12 items-center">
                <p className="truncate text-sm text-gray-600">
                  {email || "E-mail não informado"}
                </p>
              </div>
            </div>

          </div>

          {/* TELEFONE */}
          <div className="mt-5">

            <label
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Telefone
            </label>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-lg
                border
                border-gray-200
                bg-gray-50
                px-4
              "
            >
              <Phone
                size={20}
                className="text-gray-400"
              />

              <div className="flex h-12 items-center">
                <p className="text-sm text-gray-600">
                  {telefone
                    ? telefone.replace(
                        /(\d{2})(\d{5})(\d{4})/,
                        "($1) $2-$3"
                      )
                    : "Telefone não informado"}
                </p>
              </div>
            </div>

          </div>

          {/* ERRO */}
          {erro && (
            <p className="mt-4 text-center text-sm text-red-600">
              {erro}
            </p>
          )}

          {/* CADASTRAR */}
          <button
            type="button"
            onClick={cadastrar}
            disabled={carregando}
            className="
              mt-6
              flex
              h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-red-600
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:bg-gray-300
            "
          >
            {carregando
              ? "Cadastrando..."
              : "Cadastrar"}

            {!carregando && <ArrowRight size={18} />}
          </button>

        </div>
      </div>
    </main>
  );
}