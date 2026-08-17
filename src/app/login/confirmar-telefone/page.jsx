"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ConfirmarTelefoneLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [celular, setCelular] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  console.log("COMPONENTE CARREGADO");
  console.log("EMAIL DA URL:", email);

  useEffect(() => {
    console.log("USEEFFECT EXECUTADO");
    console.log("EMAIL:", email);

    async function buscarTelefone() {
      if (!email) {
        console.log("EMAIL NÃO FOI RECEBIDO");
        setErro("E-mail não informado.");
        setCarregando(false);
        return;
      }

      try {
        const url = `http://127.0.0.1:8000/usuario/telefone?email=${encodeURIComponent(email)}`;

        console.log("FAZENDO REQUISIÇÃO PARA:", url);

        const response = await fetch(url);

        console.log("STATUS DA RESPOSTA:", response.status);

        const data = await response.json();

        console.log("RESPOSTA DA API:", data);

        if (!response.ok) {
          throw new Error(data.detail || "Telefone não encontrado.");
        }

        console.log("CELULAR RECEBIDO:", data.celular);

        setCelular(data.celular);

      } catch (error) {
        console.error("ERRO NA REQUISIÇÃO:", error);
        setErro("Não foi possível encontrar o telefone cadastrado.");
      } finally {
        setCarregando(false);
      }
    }

    buscarTelefone();
  }, [email]);

  return (
    <main>
      <h1>Teste telefone</h1>

      <p>E-mail: {email || "Não informado"}</p>

      <p>Telefone: {celular || "Não carregado"}</p>

      <p>
        Status: {carregando ? "Carregando..." : "Finalizado"}
      </p>

      {erro && <p>Erro: {erro}</p>}
    </main>
  );
}