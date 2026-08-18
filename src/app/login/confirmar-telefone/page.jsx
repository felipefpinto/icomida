"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  ArrowRight,
} from "lucide-react";

export default function VerificarCodigoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const telefone = searchParams.get("telefone");

  const [codigo, setCodigo] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [erro, setErro] = useState("");

  const inputsRef = useRef([]);

  // Código temporário para testes
  const codigoCorreto = "123456";

  function handleChange(value, index) {
    // Permite apenas números
    if (!/^\d*$/.test(value)) return;

    const novoCodigo = [...codigo];

    novoCodigo[index] = value.slice(-1);

    setCodigo(novoCodigo);
    setErro("");

    // Vai automaticamente para o próximo campo
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(event, index) {
    // Volta para o campo anterior ao apagar
    if (
      event.key === "Backspace" &&
      !codigo[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const codigoDigitado = codigo.join("");

    // Verifica se todos os campos foram preenchidos
    if (codigoDigitado.length !== 6) {
      setErro("Digite o código completo.");
      return;
    }

    // Código temporário
    if (codigoDigitado !== codigoCorreto) {
      setErro("Código incorreto. Tente novamente.");
      return;
    }

    // Login aprovado temporariamente
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* VOLTAR */}
        <Link
          href={`/login/telefone?email=${encodeURIComponent(email || "")}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          {/* ÍCONE */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Smartphone size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Digite o código de 6 dígitos que enviamos para:
            </h1>

            <p className="mt-3 text-lg font-medium text-gray-900">
              {telefone || "Telefone não informado"}
            </p>
          </div>

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit}>

            {/* CAMPOS DO OTP */}
            <div className="mt-8 flex justify-center gap-2 sm:gap-3">
              {codigo.map((numero, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={numero}
                  onChange={(event) =>
                    handleChange(event.target.value, index)
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(event, index)
                  }
                  className="
                    h-14
                    w-11
                    rounded-lg
                    border
                    border-gray-300
                    bg-gray-50
                    text-center
                    text-xl
                    font-semibold
                    text-gray-900
                    outline-none
                    transition
                    focus:border-red-600
                    focus:ring-2
                    focus:ring-red-100
                    sm:w-12
                  "
                />
              ))}
            </div>

            {/* ERRO */}
            {erro && (
              <p className="mt-4 text-center text-sm text-red-600">
                {erro}
              </p>
            )}

            {/* BOTÃO */}
            <button
              type="submit"
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
              "
            >
              Confirmar código
              <ArrowRight size={18} />
            </button>

          </form>

          {/* REENVIO */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não recebeu o código?
            </p>

            <button
              type="button"
              onClick={() => {
                alert("Código reenviado!");
              }}
              className="mt-2 text-sm font-medium text-red-600 transition hover:text-red-700"
            >
              Reenviar código
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}