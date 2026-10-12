"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Phone,
} from "lucide-react";

export default function VerificarTelefone() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const celular = searchParams.get("celular");
  const tipo = searchParams.get("tipo");
  const [celularMascarado, setCelularMascarado] = useState("");

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
  async function buscarCelularMascarado() {
    // Se começamos pelo celular, não precisamos buscar.
    if (celular) {
      return;
    }

    // Essa busca só é necessária quando começamos pelo e-mail.
    if (!email) {
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
        url = `http://127.0.0.1:8000/usuario/telefone?email=${encodeURIComponent(
          email
        )}`;
      } else {
        url = `http://127.0.0.1:8000/responsavel-restaurante/telefone?email=${encodeURIComponent(
          email
        )}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setCelularMascarado(data.numero);
    } catch (error) {
      console.error(
        "Erro ao buscar celular mascarado:",
        error
      );
    }
  }

  buscarCelularMascarado();
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

  // Precisamos ter pelo menos um identificador.
  if (!email && !celular) {
    setErro("Não foi possível identificar o cadastro.");
    return;
  }

  setErro("");
  setCarregando(true);

  try {
    let responseVerificacao;

    // ==========================================
    // LOGIN COMEÇOU PELO E-MAIL
    // Não temos o celular real no frontend.
    // Backend encontra o telefone pelo e-mail.
    // ==========================================
    if (email && !celular) {
      responseVerificacao = await fetch(
        "http://127.0.0.1:8000/verificacao/telefone/verificar-por-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            codigo: codigoDigitado,
            tipo: tipo,
          }),
        }
      );
    }

    // ==========================================
    // LOGIN COMEÇOU PELO CELULAR
    // Já temos o celular real.
    // ==========================================
    else {
      responseVerificacao = await fetch(
        "http://127.0.0.1:8000/verificacao/telefone/verificar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            celular: celular.replace(/\D/g, ""),
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
    // LOGIN INICIADO PELO CELULAR
    // Ainda não temos o e-mail.
    // ==========================================
    if (!email) {
      router.push(
        `/login/confirmar-email?celular=${encodeURIComponent(
          celular
        )}&tipo=${encodeURIComponent(tipo)}`
      );

      return;
    }

    // ==========================================
    // LOGIN INICIADO PELO E-MAIL
    // Telefone acabou de ser confirmado.
    // Podemos finalizar o login.
    // ==========================================

    if (tipo === "usuario") {
      const response = await fetch(
        `http://127.0.0.1:8000/usuario/dados-login?email=${encodeURIComponent(
          email
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
        `http://127.0.0.1:8000/responsavel-restaurante/email/${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) {
        setErro(
          "Responsável pelo restaurante não encontrado."
        );
        return;
      }

      const responsavel = await response.json();

      localStorage.setItem(
        "responsavelLogado",
        JSON.stringify(responsavel)
      );

      router.push("/restaurantes");
      return;
    }
  } catch (error) {
    console.error(error);

    setErro(
      "Não foi possível realizar o login."
    );
  } finally {
    setCarregando(false);
  }
};

async function reenviarCodigo() {
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
    // LOGIN COMEÇOU PELO E-MAIL
    // Backend encontra o celular verdadeiro.
    // ==========================================
    if (email && !celular) {
      response = await fetch(
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
    }

    // ==========================================
    // LOGIN COMEÇOU PELO CELULAR
    // Já temos o celular verdadeiro.
    // ==========================================
    else {
      response = await fetch(
        "http://127.0.0.1:8000/verificacao/telefone/enviar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            celular: celular.replace(/\D/g, ""),
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

    // Limpa o código anterior.
    setCodigo(["", "", "", "", "", ""]);

    // Volta o foco para o primeiro campo.
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
}

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
              <Phone size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">

            <h1 className="text-2xl font-bold text-gray-900">
              Verifique seu telefone
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Enviamos um código de 6 dígitos para:
            </p>

           <p className="mt-1 font-medium text-gray-900">
            {celular
              ? celular.replace(
                  /(\d{2})(\d{5})(\d{4})/,
                  "($1) $2-$3"
                )
              : celularMascarado || "seu celular cadastrado"}
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