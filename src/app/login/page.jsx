"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

import {
  Mail,
  Smartphone,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const router = useRouter();

  const [method, setMethod] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");


  async function enviarCodigoEmail(email) {
  const response = await fetch(
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

  const data = await response.json();

  if (!response.ok || !data.sucesso) {
    throw new Error(
      data.mensagem ||
        "Não foi possível enviar o código por e-mail."
    );
  }

  return data;
}

async function enviarCodigoTelefone(celular) {
  const response = await fetch(
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

  const data = await response.json();

  if (!response.ok || !data.sucesso) {
    throw new Error(
      data.mensagem ||
        "Não foi possível enviar o código por SMS."
    );
  }

  return data;
}

   async function handleContinue() {
  try {
    // =========================
    // LOGIN POR E-MAIL
    // =========================
    if (method === "email") {
      const emailFormatado = email.trim();

      // Verifica na tabela Usuario
      const responseUsuario = await fetch(
        `http://127.0.0.1:8000/usuario/buscaremail?email=${encodeURIComponent(
          emailFormatado
        )}`
      );

      // Verifica na tabela ResponsavelRestaurante
      const responseResponsavel = await fetch(
        `http://127.0.0.1:8000/responsavel-restaurante/email/${encodeURIComponent(
          emailFormatado
        )}`
      );

      console.log(
        "Status Usuario:",
        responseUsuario.status
      );

      console.log(
        "Status Responsável:",
        responseResponsavel.status
      );

      const usuarioExiste =
        responseUsuario.status === 200;

      const responsavelExiste =
        responseResponsavel.status === 200;

      // =========================
      // NÃO EXISTE EM NENHUMA
      // =========================

      if (!usuarioExiste && !responsavelExiste) {
        router.push(
          `/cadastro?email=${encodeURIComponent(
            emailFormatado
          )}`
        );

        return;
      }

      // =========================
      // EXISTE SOMENTE USUÁRIO
      // =========================

      if (usuarioExiste && !responsavelExiste) {
        await enviarCodigoEmail(emailFormatado);

  router.push(
    `/login/verificar-email?email=${encodeURIComponent(
      emailFormatado
    )}&tipo=usuario`
  );

  return;
}

      // =========================
      // EXISTE SOMENTE RESPONSÁVEL
      // =========================

      if (!usuarioExiste && responsavelExiste) {
  await enviarCodigoEmail(emailFormatado);

  router.push(
    `/login/verificar-email?email=${encodeURIComponent(
      emailFormatado
    )}&tipo=responsavel`
  );

  return;
}

      // =========================
      // EXISTE NAS DUAS TABELAS
      // =========================

      if (usuarioExiste && responsavelExiste) {
        router.push(
          `/login/selecionar-tipo?email=${encodeURIComponent(
            emailFormatado
          )}`
        );

        return;
      }
    }

    // =========================
    // LOGIN POR CELULAR
    // =========================
    if (method === "phone") {
      const celularFormatado = phone.replace(/\D/g, "");

      console.log(
        "Celular enviado:",
        celularFormatado
      );

      // Verifica na tabela Usuario
      const responseUsuario = await fetch(
        `http://127.0.0.1:8000/usuario/buscarcelular?celular=${encodeURIComponent(
          celularFormatado
        )}`
      );

      // Verifica na tabela ResponsavelRestaurante
      const responseResponsavel = await fetch(
        `http://127.0.0.1:8000/responsavel-restaurante/celular/${encodeURIComponent(
          celularFormatado
        )}`
      );

      console.log(
        "Status Usuario:",
        responseUsuario.status
      );

      console.log(
        "Status Responsável:",
        responseResponsavel.status
      );

      const usuarioExiste =
        responseUsuario.status === 200;

      const responsavelExiste =
        responseResponsavel.status === 200;

      // =========================
      // NÃO EXISTE EM NENHUMA
      // =========================

      if (!usuarioExiste && !responsavelExiste) {
        router.push(
          `/cadastro?celular=${encodeURIComponent(
            celularFormatado
          )}`
        );

        return;
      }

      // =========================
      // EXISTE SOMENTE USUÁRIO
      // =========================

      if (usuarioExiste && !responsavelExiste) {
        await enviarCodigoTelefone(celularFormatado);
        router.push(
          `/login/verificar-telefone?celular=${encodeURIComponent(
            celularFormatado
          )}&tipo=usuario`
        );

        return;
      }

      // =========================
      // EXISTE SOMENTE RESPONSÁVEL
      // =========================

      if (!usuarioExiste && responsavelExiste) {
        await enviarCodigoTelefone(celularFormatado);
        router.push(
          `/login/verificar-telefone?celular=${encodeURIComponent(
            celularFormatado
          )}&tipo=responsavel`
        );

        return;
      }

      // =========================
      // EXISTE NAS DUAS TABELAS
      // =========================

      if (usuarioExiste && responsavelExiste) {
        router.push(
          `/login/selecionar-tipo?celular=${encodeURIComponent(
            celularFormatado
          )}`
        );

        return;
      }
    }
  } catch (error) {
    console.error(
      "Erro ao verificar login:",
      error
    );
  }
}

  
  async function handleGoogleLogin() {
    await signIn("google", {
      callbackUrl: "/login/google",
    });
  }
  

  function handleBack() {
    setMethod(null);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">

      <div className="w-full max-w-md">

        {/* VOLTAR PARA HOME */}

        <Link
          href="/"
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

          Voltar para o início
        </Link>


        {/* CARD */}

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">


          {/* =================================================
              TELA PRINCIPAL
          ================================================== */}

          {method === null && (

            <>

              {/* LOGO */}

              <div className="mb-8 text-center">

                <div className="mb-4 flex justify-center">

                  <div
                    className="
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-red-50
                      text-4xl
                    "
                  >
                    🍔
                  </div>

                </div>

                <h1 className="text-2xl font-bold text-gray-900">
                O seu momento mais gostoso do dia está chegando.
                </h1>

                <h2 className="mt-2 text-2xl text-gray-500">
                Como deseja continuar?
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                Entre ou crie sua conta para continuar
                </p>

                </div>


              {/* GOOGLE */}

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  text-sm
                  font-semibold
                  text-gray-800
                  transition
                  hover:border-gray-400
                  hover:bg-gray-50
                "
              >

                <span className="text-lg font-bold">
                  G
                </span>

                Continuar com Google

              </button>


              {/* DIVISOR */}

              <div className="my-5 flex items-center gap-3">

                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-xs text-gray-400">
                  ou
                </span>

                <div className="h-px flex-1 bg-gray-200" />

              </div>


              {/* E-MAIL */}

              <button
                type="button"
                onClick={() => setMethod("email")}
                className="
                  mb-3
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  text-sm
                  font-semibold
                  text-gray-800
                  transition
                  hover:border-gray-400
                  hover:bg-gray-50
                "
              >

                <Mail
                  size={19}
                  className="text-gray-600"
                />

                Continuar com e-mail

              </button>


              {/* CELULAR */}

              <button
                type="button"
                onClick={() => setMethod("phone")}
                className="
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  text-sm
                  font-semibold
                  text-gray-800
                  transition
                  hover:border-gray-400
                  hover:bg-gray-50
                "
              >

                <Smartphone
                  size={19}
                  className="text-gray-600"
                />

                Continuar com celular

              </button>

            </>

          )}


          {/* =================================================
              LOGIN COM E-MAIL
          ================================================== */}

          {method === "email" && (

            <div>

              {/* VOLTAR */}

              <button
                type="button"
                onClick={handleBack}
                className="
                  mb-6
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-gray-500
                  transition
                  hover:text-red-600
                "
              >

                <ArrowLeft size={18} />

                Voltar

              </button>


              {/* TÍTULO */}

              <div className="mb-7">

                
                <h1 className="text-2xl text-center font-bold text-gray-900">
                  Entre com seu e-mail
                </h1>

                <p className="mt-2 text-center text-sm text-gray-500">
                  Digite seu e-mail para continuar.
                </p>

              </div>


              {/* INPUT */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  E-mail
                </label>

                <div
                  className="
                    flex
                    h-12
                    items-center
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    transition
                    focus-within:border-red-500
                    focus-within:ring-2
                    focus-within:ring-red-100
                  "
                >

                  <Mail
                    size={19}
                    className="ml-3 text-gray-500"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seuemail@email.com"
                    className="
                      h-full
                      flex-1
                      bg-transparent
                      px-3
                      text-gray-900
                      outline-none
                    "
                  />

                </div>

              </div>


              {/* CONTINUAR */}

              <button
                type="button"
                onClick={handleContinue}
                disabled={!email}
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

                Continuar

                <ArrowRight size={18} />

              </button>

            </div>

          )}


          {/* =================================================
              LOGIN COM CELULAR
          ================================================== */}

          {method === "phone" && (

            <div>

              {/* VOLTAR */}

              <button
                type="button"
                onClick={handleBack}
                className="
                  mb-6
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-gray-500
                  transition
                  hover:text-red-600
                "
              >

                <ArrowLeft size={18} />

                Voltar

              </button>


              {/* TÍTULO */}

              <div className="mb-7">

                

                <h1 className="text-2xl text-center font-bold text-gray-900">
                  Entre com seu celular
                </h1>

                <p className="mt-2 text-center text-sm text-gray-500">
                  Digite seu número para receber um código.
                </p>

              </div>


              {/* INPUT */}

              <div>

                <label
                  htmlFor="phone"
                  className="mb-2 block  text-sm font-medium text-gray-700"
                >
                  Celular
                </label>

                <div
                  className="
                    flex
                    h-12
                    items-center
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    transition
                    focus-within:border-red-500
                    focus-within:ring-2
                    focus-within:ring-red-100
                  "
                >

                  

                  <Smartphone
                    size={19}
                    className="ml-3 text-gray-400"
                  />

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="(11) 99999-9999"
                    className="
                      h-full
                      flex-1
                      bg-transparent
                      px-3
                      text-gray-900
                      outline-none
                    "
                  />

                </div>

              </div>


              {/* CONTINUAR */}

              <button
                type="button"
                onClick={handleContinue}
                disabled={!phone}
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

                Continuar

                <ArrowRight size={18} />

              </button>

            </div>

          )}

        </div>


        {/* TERMOS */}

        <p className="mt-6 text-center text-xs leading-5 text-gray-400">

          Ao continuar, você concorda com os

          <span className="mx-1 text-gray-500 underline">
            Termos de Uso
          </span>

          e a

          <span className="mx-1 text-gray-500 underline">
            Política de Privacidade
          </span>

          do iComida.

        </p>

      </div>

    </main>
  );
}