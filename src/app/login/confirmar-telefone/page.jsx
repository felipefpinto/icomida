"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Smartphone,
  ArrowRight,
} from "lucide-react";

export default function ConfirmarTelefoneLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const tipo = searchParams.get("tipo");

  const [celular, setCelular] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

useEffect(() => {
  async function buscarTelefone() {
    if (!email) {
      setErro("E-mail não informado.");
      setCarregando(false);
      return;
    }

    if (
      tipo !== "usuario" &&
      tipo !== "responsavel"
    ) {
      setErro("Tipo de acesso não informado.");
      setCarregando(false);
      return;
    }

    try {
      let url = "";

      // =========================
      // USUÁRIO
      // =========================
      if (tipo === "usuario") {
        url =
          `http://127.0.0.1:8000/usuario/telefone?email=${encodeURIComponent(
            email
          )}`;
      }

      // =========================
      // RESPONSÁVEL
      // =========================
      if (tipo === "responsavel") {
        url =
        `http://127.0.0.1:8000/responsavel-restaurante/telefone?email=${encodeURIComponent(
        email
        )}`;
        }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          "Telefone não encontrado."
        );
      }

      const data = await response.json();

      // =========================
      // USUÁRIO
      // =========================
      if (tipo === "usuario") {
        setCelular(data.numero);
      }

      // =========================
      // RESPONSÁVEL
      // =========================
      if (tipo === "responsavel") {
      setCelular(data.numero);
      }
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível encontrar o telefone cadastrado."
      );
    } finally {
      setCarregando(false);
    }
  }

  buscarTelefone();
}, [email, tipo]);

async function enviarCodigo() {
  if (!email) {
    setErro("E-mail não informado.");
    return;
  }

  if (
    tipo !== "usuario" &&
    tipo !== "responsavel"
  ) {
    setErro("Tipo de acesso não informado.");
    return;
  }

  setErro("");
  setEnviando(true);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/verificacao/telefone/enviar-por-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          tipo: tipo,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.sucesso) {
      setErro(
        data.mensagem ||
          data.detail ||
          "Não foi possível enviar o código."
      );
      return;
    }

    router.push(
      `/login/verificar-telefone?email=${encodeURIComponent(
        email
      )}&tipo=${encodeURIComponent(tipo)}`
    );
  } catch (error) {
    console.error(
      "Erro ao enviar código:",
      error
    );

    setErro(
      "Não foi possível enviar o código."
    );
  } finally {
    setEnviando(false);
  }
}

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600"
        >
          <ArrowLeft size={18} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Smartphone size={30} />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Confirme seu telefone
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              Enviaremos um código de confirmação para o número:
            </p>

            {carregando && (
              <p className="mt-4 text-gray-500">
                Carregando telefone...
              </p>
            )}

            {erro && (
              <p className="mt-4 text-sm text-red-600">
                {erro}
              </p>
            )}

            {!carregando && !erro && (
              <p className="mt-4 text-lg font-semibold text-gray-900">
                {celular}
              </p>
            )}
          </div>

          {!carregando && !erro && (
            <button
              type="button"
              onClick={enviarCodigo}
              disabled={enviando}
              className="
                mt-8
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
              {enviando ? (
              "Enviando código..."
            ) : (
              <>
                Enviar código
                <ArrowRight size={18} />
              </>
            )}
            </button>
          )}

        </div>
      </div>
    </main>
  );
}