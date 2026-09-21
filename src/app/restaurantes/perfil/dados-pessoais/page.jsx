"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
  User,
  Mail,
  Smartphone,
  Save,
  Trash2,
} from "lucide-react";

export default function DadosPessoaisResponsavel() {
  const router = useRouter();

  const [idResponsavel, setIdResponsavel] =
    useState(null);

  const [nome, setNome] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [celular, setCelular] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [excluindoConta, setExcluindoConta] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  useEffect(() => {
    async function carregarDados() {
      const responsavelSalvo =
        localStorage.getItem(
          "responsavelLogado"
        );

      if (!responsavelSalvo) {
        router.push("/login");
        return;
      }

      try {
        const responsavel =
          JSON.parse(
            responsavelSalvo
          );

        if (
          !responsavel.id_responsavel
        ) {
          throw new Error(
            "ID do responsável não encontrado."
          );
        }

        setIdResponsavel(
          responsavel.id_responsavel
        );

        const response =
          await fetch(
            `http://127.0.0.1:8000/responsavel-restaurante/${responsavel.id_responsavel}`
          );

        if (!response.ok) {
          throw new Error(
            "Não foi possível carregar os dados."
          );
        }

        const dados =
          await response.json();

        setNome(
          dados.nome || ""
        );

        setEmail(
          dados.email || ""
        );

        setCelular(
          dados.celular || ""
        );

      } catch (error) {
        console.error(
          "Erro ao carregar responsável:",
          error
        );

        setErro(
          "Não foi possível carregar seus dados."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [router]);

  async function excluirConta() {
  const confirmou = window.confirm(
  "Deseja realmente excluir sua conta? " +
  "Todos os seus restaurantes e os dados vinculados a eles serão excluídos permanentemente. " +
  "Essa ação não poderá ser desfeita."
);

  if (!confirmou) {
    return;
  }

  try {
    setExcluindoConta(true);
    setErro("");
    setSucesso("");

    const response = await fetch(
      `http://127.0.0.1:8000/responsavel-restaurante/${idResponsavel}`,
      {
        method: "DELETE",
      }
    );

    const dados =
      await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível excluir sua conta."
      );
    }

    localStorage.removeItem(
      "responsavelLogado"
    );

    localStorage.removeItem(
      "restauranteSelecionadoId"
    );

    router.push("/login");

  } catch (error) {
    console.error(
      "Erro ao excluir conta:",
      error
    );

    setErro(
      error.message
    );
  } finally {
    setExcluindoConta(false);
  }
}

  function formatarCelular(value) {
    const numeros =
      value.replace(/\D/g, "");

    if (numeros.length <= 2) {
      return `(${numeros}`;
    }

    if (numeros.length <= 7) {
      return `(${numeros.slice(
        0,
        2
      )}) ${numeros.slice(2)}`;
    }

    return `(${numeros.slice(
      0,
      2
    )}) ${numeros.slice(
      2,
      7
    )}-${numeros.slice(
      7,
      11
    )}`;
  }

  async function salvarAlteracoes(
    event
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!nome.trim()) {
      setErro(
        "Informe o nome."
      );
      return;
    }

    if (!email.trim()) {
      setErro(
        "Informe o e-mail."
      );
      return;
    }

    const celularNumeros =
      celular.replace(/\D/g, "");

    if (
      celularNumeros.length !== 11
    ) {
      setErro(
        "Informe um celular válido com 11 dígitos."
      );
      return;
    }

    try {
      setSalvando(true);

      const response =
        await fetch(
          `http://127.0.0.1:8000/responsavel-restaurante/${idResponsavel}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              nome: nome.trim(),
              email: email.trim(),
              celular:
                celularNumeros,
            }),
          }
        );

      if (!response.ok) {
        const dadosErro =
          await response.json();

        throw new Error(
          dadosErro.detail ||
            "Não foi possível atualizar os dados."
        );
      }

      const dados =
        await response.json();

      localStorage.setItem(
        "responsavelLogado",
        JSON.stringify({
          id_responsavel:
            dados.id_responsavel,
          nome: dados.nome,
          email: dados.email,
          celular: dados.celular,
        })
      );

      setNome(
        dados.nome
      );

      setEmail(
        dados.email
      );

      setCelular(
        dados.celular
      );

      setSucesso(
        "Dados atualizados com sucesso."
      );

    } catch (error) {
      console.error(
        "Erro ao atualizar responsável:",
        error
      );

      setErro(
        error.message
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-gray-50
        "
      >
        <p className="text-sm text-gray-500">
          Carregando...
        </p>
      </main>
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-gray-50
        px-4
        py-10
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-3xl
        "
      >

        {/* CABEÇALHO */}

        <div className="mb-8">
          <Link
            href="/restaurantes/perfil"
            className="
              mb-5
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

          <h1
            className="
              text-3xl
              font-bold
              text-gray-900
            "
          >
            Dados pessoais
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            Atualize os dados da sua conta de responsável.
          </p>
        </div>


        {/* FORMULÁRIO */}

        <form
          onSubmit={
            salvarAlteracoes
          }
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
          "
        >

          {/* NOME */}

          <div className="mb-5">
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              "
            >
              Nome
            </label>

            <div className="relative">
              <User
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="text"
                value={nome}
                onChange={(event) =>
                  setNome(
                    event.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  pl-10
                  pr-4
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-100
                "
              />
            </div>
          </div>


          {/* EMAIL */}

          <div className="mb-5">
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              "
            >
              E-mail
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  pl-10
                  pr-4
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-100
                "
              />
            </div>
          </div>


          {/* CELULAR */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              "
            >
              Celular
            </label>

            <div className="relative">
              <Smartphone
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="text"
                value={
                  formatarCelular(
                    celular
                  )
                }
                onChange={(event) =>
                  setCelular(
                    event.target.value
                      .replace(
                        /\D/g,
                        ""
                      )
                      .slice(0, 11)
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  pl-10
                  pr-4
                  text-sm
                  text-gray-900
                  outline-none
                  transition
                  focus:border-red-500
                  focus:ring-2
                  focus:ring-red-100
                "
              />
            </div>
          </div>


          {/* ERRO */}

          {erro && (
            <div
              className="
                mt-6
                rounded-lg
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {erro}
            </div>
          )}


          {/* SUCESSO */}

          {sucesso && (
            <div
              className="
                mt-6
                rounded-lg
                bg-green-50
                px-4
                py-3
                text-sm
                text-green-700
              "
            >
              {sucesso}
            </div>
          )}


          {/* SALVAR */}

          <button
            type="submit"
            disabled={salvando}
            className="
              mt-7
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
              disabled:opacity-60
            "
          >
            <Save size={18} />

            {salvando
              ? "Salvando..."
              : "Salvar alterações"}
          </button>

          {/* EXCLUIR CONTA */}

<div
  className="
    mt-6
    rounded-2xl
    border
    border-red-200
    bg-white
    p-6
    shadow-sm
  "
>
  <div
    className="
      flex
      items-start
      justify-between
      gap-6
    "
  >
    <div>
      <h2
        className="
          text-base
          font-semibold
          text-gray-900
        "
      >
        Excluir conta
      </h2>

      <p
        className="
          mt-2
          max-w-xl
          text-sm
          leading-relaxed
          text-gray-500
        "
      >
        Sua conta só poderá ser excluída
        quando todos os restaurantes
        vinculados a ela estiverem inativos.
      </p>
    </div>

    <button
      type="button"
      onClick={excluirConta}
      disabled={excluindoConta}
      className="
        flex
        h-11
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-lg
        border
        border-red-200
        px-4
        text-sm
        font-semibold
        text-red-600
        transition
        hover:bg-red-50
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      <Trash2 size={18} />

      {excluindoConta
        ? "Excluindo..."
        : "Excluir conta"}
    </button>
  </div>
</div>

        </form>
      </div>
    </main>
  );
}