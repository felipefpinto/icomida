"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function GoogleLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session?.user?.email) {
      router.replace("/login");
      return;
    }

    async function verificarUsuario() {
      try {
        const email = session.user.email;
        const nome = session.user.name || "";

        console.log("Verificando usuário Google:", email);

        const response = await fetch(
          `http://127.0.0.1:8000/usuario/dados-login?email=${encodeURIComponent(
            email
          )}`
        );

        console.log("Status da API:", response.status);

        // USUÁRIO JÁ EXISTE
        if (response.ok) {
          const dadosUsuario = await response.json();

          console.log("Usuário encontrado:", dadosUsuario);

          localStorage.setItem(
            "usuarioLogado",
            JSON.stringify(dadosUsuario)
          );

          router.replace("/");
          return;
        }

        // USUÁRIO NÃO EXISTE
        if (response.status === 404) {
          console.log(
            "Usuário Google não encontrado. Indo para cadastro."
          );

          router.replace(
            `/cadastro?email=${encodeURIComponent(
              email
            )}&nome=${encodeURIComponent(nome)}&origem=google`
          );

          return;
        }

        console.error(
          "Erro ao consultar usuário:",
          response.status
        );
      } catch (error) {
        console.error(
          "Erro ao verificar usuário Google:",
          error
        );
      }
    }

    verificarUsuario();
  }, [session, status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-800">
          Entrando...
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Verificando sua conta.
        </p>
      </div>
    </main>
  );
}