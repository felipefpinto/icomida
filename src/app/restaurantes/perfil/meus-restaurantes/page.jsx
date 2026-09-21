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
  Store,
  Pencil,
  Trash2,
  Plus,
  ChevronRight,
} from "lucide-react";

export default function MeusRestaurantes() {
  const router = useRouter();

  const [
    restaurantes,
    setRestaurantes,
  ] = useState([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    excluindo,
    setExcluindo,
  ] = useState(null);

  const [erro, setErro] =
    useState("");

  const [
    idResponsavel,
    setIdResponsavel,
  ] = useState(null);

  useEffect(() => {
    async function carregarRestaurantes() {
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

        const id =
          Number(
            responsavel.id_responsavel
          );

        setIdResponsavel(id);

        const response =
          await fetch(
            "http://127.0.0.1:8000/restaurantes/"
          );

        if (!response.ok) {
          throw new Error(
            "Não foi possível buscar os restaurantes."
          );
        }

        const dados =
          await response.json();

        const restaurantesResponsavel =
          dados.filter(
            (restaurante) =>
              Number(
                restaurante.responsavel_id
              ) === id
          );

        setRestaurantes(
          restaurantesResponsavel
        );

      } catch (error) {
        console.error(
          "Erro ao carregar restaurantes:",
          error
        );

        setErro(
          "Não foi possível carregar seus restaurantes."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarRestaurantes();
  }, [router]);

  function formatarCnpj(cnpj) {
    if (!cnpj) {
      return "";
    }

    const numeros =
      cnpj.replace(/\D/g, "");

    if (
      numeros.length !== 14
    ) {
      return cnpj;
    }

    return numeros.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }

  function selecionarRestaurante(
    restaurante
  ) {
    localStorage.setItem(
      "restauranteSelecionadoId",
      restaurante.id_restaurante.toString()
    );

    router.push(
      "/restaurantes"
    );
  }

  function acessarDados(
    restaurante
  ) {
    localStorage.setItem(
      "restauranteSelecionadoId",
      restaurante.id_restaurante.toString()
    );

    router.push(
      "/restaurantes/dados"
    );
  }

  async function excluirRestaurante(
    restaurante
  ) {
    const confirmou =
      window.confirm(
        `Deseja realmente excluir "${restaurante.nome_fantasia}"? Essa ação não poderá ser desfeita.`
      );

    if (!confirmou) {
      return;
    }

    try {
      setExcluindo(
        restaurante.id_restaurante
      );

      setErro("");

      const response =
        await fetch(
          `http://127.0.0.1:8000/restaurantes/${restaurante.id_restaurante}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {
        const dadosErro =
          await response.json();

        throw new Error(
          dadosErro.detail ||
            "Não foi possível excluir o restaurante."
        );
      }

      setRestaurantes(
        (restaurantesAtuais) =>
          restaurantesAtuais.filter(
            (item) =>
              item.id_restaurante !==
              restaurante.id_restaurante
          )
      );

      const selecionado =
        localStorage.getItem(
          "restauranteSelecionadoId"
        );

      if (
        selecionado ===
        restaurante.id_restaurante.toString()
      ) {
        localStorage.removeItem(
          "restauranteSelecionadoId"
        );
      }

    } catch (error) {
      console.error(
        "Erro ao excluir restaurante:",
        error
      );

      setErro(
        error.message
      );
    } finally {
      setExcluindo(null);
    }
  }

  function novoRestaurante() {
    if (!idResponsavel) {
      return;
    }

    router.push(
      `/cadastro/restaurante/dados-restaurante?id_responsavel=${idResponsavel}`
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
          max-w-4xl
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

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h1
                className="
                  text-3xl
                  font-bold
                  text-gray-900
                "
              >
                Meus restaurantes
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500
                "
              >
                Acesse e gerencie os restaurantes vinculados à sua conta.
              </p>
            </div>

            <button
              type="button"
              onClick={
                novoRestaurante
              }
              className="
                flex
                h-11
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-red-600
                px-4
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-700
              "
            >
              <Plus size={18} />

              Novo restaurante
            </button>
          </div>
        </div>


        {/* ERRO */}

        {erro && (
          <div
            className="
              mb-6
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


        {/* CARREGANDO */}

        {carregando && (
          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-8
              text-center
              shadow-sm
            "
          >
            <p className="text-sm text-gray-500">
              Carregando restaurantes...
            </p>
          </div>
        )}


        {/* NENHUM RESTAURANTE */}

        {!carregando &&
          restaurantes.length === 0 && (
            <div
              className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-10
                text-center
                shadow-sm
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-red-50
                  text-red-600
                "
              >
                <Store size={30} />
              </div>

              <h2
                className="
                  mt-5
                  text-lg
                  font-bold
                  text-gray-900
                "
              >
                Nenhum restaurante cadastrado
              </h2>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-sm
                  text-sm
                  text-gray-500
                "
              >
                Cadastre seu primeiro restaurante para começar a utilizar a plataforma.
              </p>

              <button
                type="button"
                onClick={
                  novoRestaurante
                }
                className="
                  mt-6
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-red-600
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                <Plus size={18} />

                Cadastrar restaurante
              </button>
            </div>
          )}


        {/* RESTAURANTES */}

        {!carregando &&
          restaurantes.length > 0 && (
            <div className="space-y-4">

              {restaurantes.map(
                (restaurante) => (
                  <div
                    key={
                      restaurante.id_restaurante
                    }
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      shadow-sm
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-4
                        p-6
                      "
                    >
                      {/* ÍCONE */}

                      <div
                        className="
                          flex
                          h-14
                          w-14
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-red-50
                          text-red-600
                        "
                      >
                        <Store
                          size={26}
                        />
                      </div>


                      {/* DADOS */}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                          "
                        >
                          <h2
                            className="
                              truncate
                              text-lg
                              font-bold
                              text-gray-900
                            "
                          >
                            {
                              restaurante.nome_fantasia
                            }
                          </h2>

                          <span
                            className={`
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${
                                restaurante.status ===
                                "DISPONIVEL"
                                  ? "bg-green-50 text-green-700"
                                  : restaurante.status ===
                                      "PENDENTE"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                              }
                            `}
                          >
                            {
                              restaurante.status
                            }
                          </span>
                        </div>

                        <p
                          className="
                            mt-1
                            text-sm
                            text-gray-500
                          "
                        >
                          {
                            restaurante.razao_social
                          }
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-400
                          "
                        >
                          CNPJ:{" "}
                          {formatarCnpj(
                            restaurante.cnpj
                          )}
                        </p>
                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          selecionarRestaurante(
                            restaurante
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-1
                          text-sm
                          font-semibold
                          text-red-600
                          transition
                          hover:text-red-700
                        "
                      >
                        Gerenciar

                        <ChevronRight
                          size={18}
                        />
                      </button>
                    </div>


                    {/* AÇÕES */}

                    <div
                      className="
                        flex
                        items-center
                        justify-end
                        gap-3
                        border-t
                        border-gray-100
                        bg-gray-50
                        px-6
                        py-3
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          acessarDados(
                            restaurante
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-lg
                          px-3
                          py-2
                          text-sm
                          font-medium
                          text-gray-700
                          transition
                          hover:bg-white
                        "
                      >
                        <Pencil
                          size={17}
                        />

                        Dados
                      </button>

                      <button
                        type="button"
                        disabled={
                          excluindo ===
                          restaurante.id_restaurante
                        }
                        onClick={() =>
                          excluirRestaurante(
                            restaurante
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-lg
                          px-3
                          py-2
                          text-sm
                          font-medium
                          text-red-600
                          transition
                          hover:bg-red-50
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <Trash2
                          size={17}
                        />

                        {excluindo ===
                        restaurante.id_restaurante
                          ? "Excluindo..."
                          : "Excluir"}
                      </button>
                    </div>
                  </div>
                )
              )}

            </div>
          )}

      </div>
    </main>
  );
}