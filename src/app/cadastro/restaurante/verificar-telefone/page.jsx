"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Phone,
} from "lucide-react";

export default function VerificarTelefoneRestaurante() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const celular = searchParams.get("celular");
  const origem = searchParams.get("origem");

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
    if (!/^\d*$/.test(value)) {
      return;
    }

    const novoCodigo = [...codigo];

    novoCodigo[index] = value.slice(-1);

    setCodigo(novoCodigo);
    setErro("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(event, index) {
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

    if (codigoDigitado.length !== 6) {
      setErro("Digite o código completo.");
      return;
    }

    if (codigoDigitado !== codigoCorreto) {
      setErro("Código incorreto. Tente novamente.");
      return;
    }

    // ==========================================
    // CADASTRO COMEÇOU PELO CELULAR
    // Ainda precisamos solicitar o e-mail.
    // ==========================================
    if (!email) {
      router.push(
        `/cadastro/restaurante/email?celular=${encodeURIComponent(
          celular || ""
        )}`
      );

      return;
    }

    // ==========================================
    // E-MAIL E CELULAR JÁ FORAM VERIFICADOS
    // Vai para os dados do responsável.
    // ==========================================
    router.push(
      `/cadastro/restaurante/dados-responsavel?email=${encodeURIComponent(
        email
      )}&celular=${encodeURIComponent(
        celular || ""
      )}&origem=${encodeURIComponent(origem || "")}`
    );
  }

  function formatarCelular(numero) {
    if (!numero) {
      return "Celular não informado";
    }

    return numero.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3"
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href={`/cadastro/restaurante/confirmar-telefone?email=${encodeURIComponent(
            email || ""
          )}&celular=${encodeURIComponent(
            celular || ""
          )}&origem=${encodeURIComponent(origem || "")}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Phone size={30} />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Verifique seu telefone
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Enviamos um código de 6 dígitos para:
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {formatarCelular(celular)}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
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
                    handleChange(
                      event.target.value,
                      index
                    )
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(event, index)
                  }
                  className="h-14 w-11 rounded-lg border border-gray-300 bg-gray-50 text-center text-xl font-semibold text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 sm:w-12"
                />
              ))}
            </div>

            {erro && (
              <p className="mt-4 text-center text-sm text-red-600">
                {erro}
              </p>
            )}

            <button
              type="submit"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Confirmar código
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não recebeu o código?
            </p>

            <button
              type="button"
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