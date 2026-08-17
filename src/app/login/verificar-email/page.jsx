"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  ArrowRight,
  User,
} from "lucide-react";

export default function VerificarCodigo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [erro, setErro] = useState("");

  const inputsRef = useRef([]);

  // Código temporário para testes
  const codigoCorreto = "123456";

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const novoCodigo = [...codigo];
    novoCodigo[index] = value.slice(-1);

    setCodigo(novoCodigo);
    setErro("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (
      event.key === "Backspace" &&
      !codigo[index] &&
      index > 0
    ) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (event) => {
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

    // Temporariamente, avança para a próxima etapa
    router.push(
      `/login/confirmar-telefone?email=${encodeURIComponent(email)}`
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* VOLTAR */}
        <Link
          href={"/login"}
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
              <Mail size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">

            <h1 className="text-2xl font-bold text-gray-900">
              Digite o código de 6 dígitos que enviamos para:
            </h1>

            
            <p className="mt-1 truncate font-medium text-gray-900">
              {email || "E-mail não informado"}
            </p>

          </div>

          {/* CÓDIGO */}
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

            {/* CONFIRMAR */}
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
              className="
                mt-2
                text-sm
                font-medium
                text-red-600
                transition
                hover:text-red-700
              "
            >
              Reenviar código
            </button>

          </div>

        </div>
      </div>
    </main>
  );
}