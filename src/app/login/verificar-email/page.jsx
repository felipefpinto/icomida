"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Mail,
} from "lucide-react";

export default function VerificarEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const celular = searchParams.get("celular");
  const tipo = searchParams.get("tipo");
  const [emailMascarado, setEmailMascarado] = useState("");
  
  const [codigo, setCodigo] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const inputsRef = useRef([]);

  // Código temporário para testes
  //const codigoCorreto = "123456";

useEffect(() => {
  async function buscarEmailMascarado() {
    // Se temos o e-mail real, não precisamos buscar.
    if (email) {
      return;
    }

    // Essa busca acontece quando o login começou pelo celular.
    if (!celular) {
      return;
    }

    if (
      tipo !== "usuario" &&
      tipo !== "responsavel"
    ) {
      return;
    }

    try {
      let url;

      if (tipo === "usuario") {
        url = `http://127.0.0.1:8000/usuario/email?celular=${encodeURIComponent(
          celular
        )}`;
      } else {
        url = `http://127.0.0.1:8000/responsavel-restaurante/email?celular=${encodeURIComponent(
          celular
        )}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setEmailMascarado(data.email);
    } catch (error) {
      console.error(
        "Erro ao buscar e-mail mascarado:",
        error
      );
    }
  }

  buscarEmailMascarado();
}, [email, celular, tipo]);

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

const handleSubmit = async (event) => {
  event.preventDefault();

  const codigoDigitado = codigo.join("");

  if (codigoDigitado.length !== 6) {
    setErro("Digite o código completo.");
    return;
  }

  if (
    tipo !== "usuario" &&
    tipo !== "responsavel"
  ) {
    setErro("Tipo de acesso não informado.");
    return;
  }

  if (!email && !celular) {
    setErro("Não foi possível identificar o cadastro.");
    return;
  }

  setErro("");
  setCarregando(true);

  try {
    let responseVerificacao;

    // ==========================================
    // LOGIN COMEÇOU PELO CELULAR
    // Backend encontra o e-mail verdadeiro.
    // ==========================================
    if (celular && !email) {
      responseVerificacao = await fetch(
        "http://127.0.0.1:8000/verificacao/email/verificar-por-celular",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            celular: celular.replace(/\D/g, ""),
            codigo: codigoDigitado,
            tipo: tipo,
          }),
        }
      );
    }

    // ==========================================
    // LOGIN COMEÇOU PELO E-MAIL
    // Temos o e-mail verdadeiro.
    // ==========================================
    else {
      responseVerificacao = await fetch(
        "http://127.0.0.1:8000/verificacao/email/verificar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            codigo: codigoDigitado,
          }),
        }
      );
    }

    const dataVerificacao =
      await responseVerificacao.json();

    if (
      !responseVerificacao.ok ||
      !dataVerificacao.sucesso
    ) {
      setErro(
        dataVerificacao.mensagem ||
          dataVerificacao.detail ||
          "Código inválido ou expirado."
      );
      return;
    }

    // ==========================================
    // LOGIN COMEÇOU PELO CELULAR
    // Telefone + e-mail já confirmados.
    // ==========================================
    if (celular && !email) {
      if (tipo === "usuario") {
        const response = await fetch(
          `http://127.0.0.1:8000/usuario/dados-login?celular=${encodeURIComponent(
            celular
          )}`
        );

        if (!response.ok) {
          setErro("Usuário não encontrado.");
          return;
        }

        const usuario = await response.json();

        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(usuario)
        );

        router.push("/");
        return;
      }

      if (tipo === "responsavel") {
        const response = await fetch(
          `http://127.0.0.1:8000/responsavel-restaurante/celular/${encodeURIComponent(
            celular
          )}`
        );

        if (!response.ok) {
          setErro(
            "Responsável pelo restaurante não encontrado."
          );
          return;
        }

        const responsavel =
          await response.json();

        localStorage.setItem(
          "responsavelLogado",
          JSON.stringify(responsavel)
        );

        router.push("/restaurantes");
        return;
      }
    }

    // ==========================================
    // LOGIN COMEÇOU PELO E-MAIL
    // E-mail confirmado.
    // Agora confirma telefone.
    // ==========================================
    if (email && !celular) {
      router.push(
        `/login/confirmar-telefone?email=${encodeURIComponent(
          email
        )}&tipo=${encodeURIComponent(tipo)}`
      );

      return;
    }
  } catch (error) {
    console.error(error);

    setErro(
      "Não foi possível continuar o login."
    );
  } finally {
    setCarregando(false);
  }
};

const reenviarCodigo = async () => {
  if (
    tipo !== "usuario" &&
    tipo !== "responsavel"
  ) {
    setErro("Tipo de acesso não informado.");
    return;
  }

  if (!email && !celular) {
    setErro("Não foi possível identificar o cadastro.");
    return;
  }

  try {
    setErro("");

    let response;

    // ==========================================
    // LOGIN COMEÇOU PELO CELULAR
    // Backend encontra o e-mail verdadeiro.
    // ==========================================
    if (celular && !email) {
      response = await fetch(
        "http://127.0.0.1:8000/verificacao/email/enviar-por-celular",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            celular: celular.replace(/\D/g, ""),
            tipo: tipo,
          }),
        }
      );
    }

    // ==========================================
    // LOGIN COMEÇOU PELO E-MAIL
    // Já temos o e-mail verdadeiro.
    // ==========================================
    else {
      response = await fetch(
        "http://127.0.0.1:8000/verificacao/email/enviar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );
    }

    const data = await response.json();

    if (!response.ok || !data.sucesso) {
      setErro(
        data.mensagem ||
          data.detail ||
          "Não foi possível reenviar o código."
      );
      return;
    }

    setCodigo(["", "", "", "", "", ""]);
    inputsRef.current[0]?.focus();
  } catch (error) {
    console.error(
      "Erro ao reenviar código:",
      error
    );

    setErro(
      "Não foi possível reenviar o código."
    );
  }
};
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* VOLTAR */}
        <Link
          href="/login"
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
            {email || emailMascarado || "E-mail cadastrado"}
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
                    handleChange(
                      event.target.value,
                      index
                    )
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
              {carregando ? (
              "Verificando..."
            ) : (
              <>
                Confirmar código
                <ArrowRight size={18} />
              </>
            )}
            </button>
          </form>

          {/* REENVIO */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não recebeu o código?
            </p>

            <button
              type="button"
              onClick={reenviarCodigo}
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