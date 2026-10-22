"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Building2,
  Save,
  Image,
} from "lucide-react";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

export default function DadosRestaurante() {
  const router = useRouter();

  const [restaurante, setRestaurante] =
    useState(null);

  const [razaoSocial, setRazaoSocial] =
    useState("");

  const [nomeFantasia, setNomeFantasia] =
    useState("");

  const [descricao, setDescricao] =
    useState("");
  
  const [arquivoLogo, setArquivoLogo] =
    useState(null);

  const [previewLogo, setPreviewLogo] =
    useState(null);

  const [enviandoLogo, setEnviandoLogo] =
    useState(false);

  const [arquivoBanner,setArquivoBanner,
    ] = useState(null);

  const [previewBanner,setPreviewBanner,
    ] = useState(null);

  const [enviandoBanner,setEnviandoBanner,
    ] = useState(false);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

    const [categorias, setCategorias] =
  useState([]);

    const [
  categoriasSelecionadas,
  setCategoriasSelecionadas,
    ] = useState([]);

    async function buscarCategorias() {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/categorias/"
    );

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar as categorias."
      );
    }

    const dados = await response.json();

    setCategorias(dados);
  } catch (error) {
    console.error(error);
  }
}

  useEffect(() => {
    const idRestaurante =
      localStorage.getItem(
        "restauranteSelecionadoId"
      );

    if (!idRestaurante) {
      router.push("/restaurantes");
      return;
    }

    buscarCategorias();

    buscarRestaurante(idRestaurante);
  }, [router]);

  async function buscarRestaurante(
    idRestaurante
  ) {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(
        `http://127.0.0.1:8000/restaurantes/${idRestaurante}`
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar os dados do restaurante."
        );
      }

      const dados = await response.json();

      setRestaurante(dados);

      setCategoriasSelecionadas(
    dados.categorias?.map(
    (categoria) => categoria.id
  ) || []
);

      setRazaoSocial(
        dados.razao_social || ""
      );

      setNomeFantasia(
        dados.nome_fantasia || ""
      );

      setDescricao(
        dados.descricao || ""
      );
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar os dados do restaurante."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!restaurante) return;

    setErro("");
    setSucesso("");

    if (!razaoSocial.trim()) {
      setErro(
        "Informe a razão social."
      );
      return;
    }

    if (!nomeFantasia.trim()) {
      setErro(
        "Informe o nome fantasia."
      );
      return;
    }

    if (
  categoriasSelecionadas.length === 0
) {
  setErro(
    "Selecione pelo menos uma categoria."
  );

  return;
}

    try {
      setSalvando(true);

      const response = await fetch(
        `http://127.0.0.1:8000/restaurantes/${restaurante.id_restaurante}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
  razao_social:
    razaoSocial.trim(),

  nome_fantasia:
    nomeFantasia.trim(),

  descricao:
    descricao.trim() || null,

  categoria_ids:
    categoriasSelecionadas,
}),
        }
      );

      const dados = await response.json();

      if (!response.ok) {
        console.error(dados);

        throw new Error(
          dados.detail ||
            "Não foi possível atualizar o restaurante."
        );
      }

      setRestaurante(dados);

      setSucesso(
        "Dados do restaurante atualizados com sucesso."
      );
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível atualizar o restaurante."
      );
    } finally {
      setSalvando(false);
    }
  }

  function selecionarLogo(event) {
  const arquivo =
    event.target.files?.[0];

  if (!arquivo) return;

  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !tiposPermitidos.includes(
      arquivo.type
    )
  ) {
    setErro(
      "Selecione uma imagem JPG, PNG ou WEBP."
    );

    event.target.value = "";
    return;
  }

  const tamanhoMaximo =
    5 * 1024 * 1024;

  if (
    arquivo.size >
    tamanhoMaximo
  ) {
    setErro(
      "A imagem deve ter no máximo 5 MB."
    );

    event.target.value = "";
    return;
  }

  if (previewLogo) {
    URL.revokeObjectURL(
      previewLogo
    );
  }

  const preview =
    URL.createObjectURL(
      arquivo
    );

  setArquivoLogo(arquivo);
  setPreviewLogo(preview);

  setErro("");
  setSucesso("");
}

async function enviarLogo() {
  if (
    !arquivoLogo ||
    !restaurante
  ) {
    return;
  }

  try {
    setEnviandoLogo(true);
    setErro("");
    setSucesso("");

    const formData =
      new FormData();

    formData.append(
      "arquivo",
      arquivoLogo
    );

    const response =
      await fetch(
        `http://127.0.0.1:8000/restaurantes/${restaurante.id_restaurante}/logo`,
        {
          method: "POST",
          body: formData,
        }
      );

    const dados =
      await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível enviar a logo."
      );
    }

    setRestaurante(
      (restauranteAtual) => ({
        ...restauranteAtual,
        logo_url:
          dados.logo_url,
      })
    );

    if (previewLogo) {
      URL.revokeObjectURL(
        previewLogo
      );
    }

    setArquivoLogo(null);
    setPreviewLogo(null);

    setSucesso(
      "Logo atualizada com sucesso."
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível atualizar a logo."
    );
  } finally {
    setEnviandoLogo(false);
  }
}

async function removerLogo() {
  if (
    !restaurante?.logo_url
  ) {
    return;
  }

  const confirmar =
    window.confirm(
      "Deseja realmente remover a logo do restaurante?"
    );

  if (!confirmar) return;

  try {
    setErro("");
    setSucesso("");

    const response =
      await fetch(
        `http://127.0.0.1:8000/restaurantes/${restaurante.id_restaurante}/logo`,
        {
          method: "DELETE",
        }
      );

    const dados =
      await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível remover a logo."
      );
    }

    setRestaurante(
      (restauranteAtual) => ({
        ...restauranteAtual,
        logo_url: null,
      })
    );

    setArquivoLogo(null);
    setPreviewLogo(null);

    setSucesso(
      "Logo removida com sucesso."
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível remover a logo."
    );
  }
}

function selecionarBanner(event) {
  const arquivo =
    event.target.files?.[0];

  if (!arquivo) return;

  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (
    !tiposPermitidos.includes(
      arquivo.type
    )
  ) {
    setErro(
      "Selecione uma imagem JPG, PNG ou WEBP."
    );

    event.target.value = "";
    return;
  }

  const tamanhoMaximo =
    8 * 1024 * 1024;

  if (
    arquivo.size >
    tamanhoMaximo
  ) {
    setErro(
      "O banner deve ter no máximo 8 MB."
    );

    event.target.value = "";
    return;
  }

  if (previewBanner) {
    URL.revokeObjectURL(
      previewBanner
    );
  }

  const preview =
    URL.createObjectURL(
      arquivo
    );

  setArquivoBanner(arquivo);
  setPreviewBanner(preview);

  setErro("");
  setSucesso("");
}

async function enviarBanner() {
  if (
    !arquivoBanner ||
    !restaurante
  ) {
    return;
  }

  try {
    setEnviandoBanner(true);
    setErro("");
    setSucesso("");

    const formData =
      new FormData();

    formData.append(
      "arquivo",
      arquivoBanner
    );

    const response =
      await fetch(
        `http://127.0.0.1:8000/restaurantes/${restaurante.id_restaurante}/banner`,
        {
          method: "POST",
          body: formData,
        }
      );

    const dados =
      await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível enviar o banner."
      );
    }

    setRestaurante(
      (restauranteAtual) => ({
        ...restauranteAtual,
        banner_url:
          dados.banner_url,
      })
    );

    if (previewBanner) {
      URL.revokeObjectURL(
        previewBanner
      );
    }

    setArquivoBanner(null);
    setPreviewBanner(null);

    setSucesso(
      "Banner atualizado com sucesso."
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível atualizar o banner."
    );
  } finally {
    setEnviandoBanner(false);
  }
}

async function removerBanner() {
  if (
    !restaurante?.banner_url
  ) {
    return;
  }

  const confirmar =
    window.confirm(
      "Deseja realmente remover o banner do restaurante?"
    );

  if (!confirmar) return;

  try {
    setErro("");
    setSucesso("");

    const response =
      await fetch(
        `http://127.0.0.1:8000/restaurantes/${restaurante.id_restaurante}/banner`,
        {
          method: "DELETE",
        }
      );

    const dados =
      await response.json();

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível remover o banner."
      );
    }

    setRestaurante(
      (restauranteAtual) => ({
        ...restauranteAtual,
        banner_url: null,
      })
    );

    setArquivoBanner(null);
    setPreviewBanner(null);

    setSucesso(
      "Banner removido com sucesso."
    );
  } catch (error) {
    console.error(error);

    setErro(
      error.message ||
        "Não foi possível remover o banner."
    );
  }
}

  function alternarCategoria(idCategoria) {
  setCategoriasSelecionadas(
    (categoriasAtuais) => {
      if (
        categoriasAtuais.includes(
          idCategoria
        )
      ) {
        return categoriasAtuais.filter(
          (id) => id !== idCategoria
        );
      }

      return [
        ...categoriasAtuais,
        idCategoria,
      ];
    }
  );

  setErro("");
  setSucesso("");
}

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}

      <SidebarRestaurante />

      {/* CONTEÚDO */}

      <div className="min-w-0 flex-1">

        {/* HEADER */}

        <header
          className="
            flex
            h-20
            items-center
            border-b
            border-gray-200
            bg-white
            px-6
            lg:px-8
          "
        >
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Dados do restaurante
            </h1>

            <p className="text-xs text-gray-400">
              Gerencie as informações do seu restaurante
            </p>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}

        <main className="p-6 lg:p-8">

          <div className="mx-auto max-w-4xl">

            {/* TÍTULO */}

            <div className="mb-6">

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-50
                    text-red-600
                  "
                >
                  <Building2 size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Informações do restaurante
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Mantenha os dados do seu estabelecimento atualizados.
                  </p>
                </div>

              </div>

            </div>

            {/* CARREGANDO */}

            {carregando ? (
              <div
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-8
                  text-center
                  text-sm
                  text-gray-500
                "
              >
                Carregando dados do restaurante...
              </div>
            ) : restaurante ? (

              <form
                onSubmit={handleSubmit}
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-6
                  shadow-sm
                  md:p-8
                "
              >

                {/* MENSAGEM DE ERRO */}

                {erro && (
                  <div
                    className="
                      mb-6
                      rounded-lg
                      border
                      border-red-200
                      bg-red-50
                      px-4
                      py-3
                      text-sm
                      text-red-700
                    "
                  >
                    {erro}
                  </div>
                )}

                {/* SUCESSO */}

                {sucesso && (
                  <div
                    className="
                      mb-6
                      rounded-lg
                      border
                      border-green-200
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

                {/* LOGO DO RESTAURANTE */}

<div
  className="
    mb-8
    rounded-xl
    border
    border-gray-200
    bg-gray-50
    p-5
  "
>
  <div className="mb-4">
    <h3
      className="
        text-sm
        font-semibold
        text-gray-900
      "
    >
      Logo do restaurante
    </h3>

    <p
      className="
        mt-1
        text-xs
        text-gray-500
      "
    >
      Essa imagem será usada para
      identificar o seu restaurante.
    </p>
  </div>

  <div
    className="
      flex
      flex-col
      gap-5
      sm:flex-row
      sm:items-center
    "
  >
    {/* IMAGEM */}

    <div
      className="
        flex
        h-28
        w-28
        shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
      "
    >
      {previewLogo ? (
        <img
          src={previewLogo}
          alt="Pré-visualização da logo"
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : restaurante.logo_url ? (
        <img
          src={`http://127.0.0.1:8000${restaurante.logo_url}`}
          alt={`Logo de ${restaurante.nome_fantasia}`}
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : (
        <Image
          size={32}
          className="text-gray-300"
        />
      )}
    </div>

    {/* CONTROLES */}

    <div className="flex-1">

      <label
        className="
          inline-flex
          h-10
          cursor-pointer
          items-center
          justify-center
          rounded-lg
          border
          border-gray-300
          bg-white
          px-4
          text-sm
          font-medium
          text-gray-700
          transition
          hover:bg-gray-50
        "
      >
        {restaurante.logo_url
          ? "Alterar logo"
          : "Selecionar logo"}

        <input
          type="file"
          accept="
            image/jpeg,
            image/png,
            image/webp
          "
          onChange={
            selecionarLogo
          }
          className="hidden"
        />
      </label>

      {restaurante.logo_url && (
      <button
        type="button"
        onClick={removerLogo}
        className="
          ml-2
          h-10
          rounded-lg
          border
          border-red-200
          bg-white
          px-4
          text-sm
          font-medium
          text-red-600
          transition
          hover:bg-red-50
        "
      >
        Remover logo
      </button>
    )}

      <p
        className="
          mt-2
          text-xs
          text-gray-400
        "
      >
        JPG, PNG ou WEBP. Máximo
        de 5 MB.
      </p>

      {arquivoLogo && (
        <div className="mt-4">

          <p
            className="
              mb-3
              max-w-sm
              truncate
              text-xs
              text-gray-500
            "
          >
            {arquivoLogo.name}
          </p>



          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <button
              type="button"
              onClick={enviarLogo}
              disabled={
                enviandoLogo
              }
              className="
                rounded-lg
                bg-red-600
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {enviandoLogo
                ? "Enviando..."
                : "Salvar logo"}
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  previewLogo
                ) {
                  URL.revokeObjectURL(
                    previewLogo
                  );
                }

                setArquivoLogo(
                  null
                );

                setPreviewLogo(
                  null
                );
              }}
              disabled={
                enviandoLogo
              }
              className="
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-2
                text-sm
                font-medium
                text-gray-600
                transition
                hover:bg-gray-50
              "
            >
              Cancelar
            </button>

            

            

          </div>

        </div>
      )}

    </div>
  </div>
</div>

{/* BANNER DO RESTAURANTE */}

<div
  className="
    mb-8
    rounded-xl
    border
    border-gray-200
    bg-gray-50
    p-5
  "
>
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-gray-900">
      Banner do restaurante
    </h3>

    <p className="mt-1 text-xs text-gray-500">
      Essa imagem será exibida no topo
      da página do restaurante.
    </p>
  </div>

  <div
    className="
      overflow-hidden
      rounded-xl
      border
      border-gray-200
      bg-white
    "
  >
    <div
      className="
        flex
        aspect-[16/6]
        w-full
        items-center
        justify-center
        bg-gray-100
      "
    >
      {previewBanner ? (
        <img
          src={previewBanner}
          alt="Pré-visualização do banner"
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : restaurante.banner_url ? (
        <img
          src={`http://127.0.0.1:8000${restaurante.banner_url}`}
          alt={`Banner de ${restaurante.nome_fantasia}`}
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : (
        <span
          className="
            text-sm
            text-gray-400
          "
        >
          Nenhum banner cadastrado
        </span>
      )}
    </div>
  </div>

  <div
    className="
      mt-4
      flex
      flex-col
      gap-3
      sm:flex-row
      sm:items-center
      sm:justify-between
    "
  >
    <div>
      <label
        className="
          inline-flex
          h-10
          cursor-pointer
          items-center
          justify-center
          rounded-lg
          border
          border-gray-300
          bg-white
          px-4
          text-sm
          font-medium
          text-gray-700
          transition
          hover:bg-gray-50
        "
      >
        {restaurante.banner_url
          ? "Alterar banner"
          : "Selecionar banner"}

        <input
          type="file"
          accept="
            image/jpeg,
            image/png,
            image/webp
          "
          onChange={
            selecionarBanner
          }
          className="hidden"
        />
      </label>

      {restaurante.banner_url && (
  <button
    type="button"
    onClick={removerBanner}
    className="
      h-10
      rounded-lg
      border
      border-red-200
      bg-white
      px-4
      text-sm
      font-medium
      text-red-600
      transition
      hover:bg-red-50
    "
  >
    Remover banner
  </button>
)}

      <p
        className="
          mt-2
          text-xs
          text-gray-400
        "
      >
        JPG, PNG ou WEBP. Máximo
        de 8 MB.
      </p>
    </div>

    {arquivoBanner && (
      <div
        className="
          flex
          gap-2
        "
      >
        <button
          type="button"
          onClick={enviarBanner}
          disabled={
            enviandoBanner
          }
          className="
            rounded-lg
            bg-red-600
            px-4
            py-2
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-red-700
            disabled:opacity-60
          "
        >
          {enviandoBanner
            ? "Enviando..."
            : "Salvar banner"}
        </button>

        <button
          type="button"
          onClick={() => {
            if (
              previewBanner
            ) {
              URL.revokeObjectURL(
                previewBanner
              );
            }

            setArquivoBanner(null);
            setPreviewBanner(null);
          }}
          disabled={
            enviandoBanner
          }
          className="
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            text-gray-600
            hover:bg-gray-50
          "
        >
          Cancelar
        </button>
      </div>
    )}
  </div>
</div>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-6
                    md:grid-cols-2
                  "
                >

                  {/* RAZÃO SOCIAL */}

                  <div>
                    <label
                      htmlFor="razao_social"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-gray-700
                      "
                    >
                      Razão social
                    </label>

                    <input
                      id="razao_social"
                      type="text"
                      value={razaoSocial}
                      onChange={(event) => {
                        setRazaoSocial(
                          event.target.value
                        );

                        setErro("");
                        setSucesso("");
                      }}
                      maxLength={150}
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        px-3
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

                  {/* NOME FANTASIA */}

                  <div>
                    <label
                      htmlFor="nome_fantasia"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-gray-700
                      "
                    >
                      Nome fantasia
                    </label>

                    <input
                      id="nome_fantasia"
                      type="text"
                      value={nomeFantasia}
                      onChange={(event) => {
                        setNomeFantasia(
                          event.target.value
                        );

                        setErro("");
                        setSucesso("");
                      }}
                      maxLength={100}
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        px-3
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

                  {/* CNPJ */}

                  <div>
                    <label
                      htmlFor="cnpj"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-gray-700
                      "
                    >
                      CNPJ
                    </label>

                    <input
                      id="cnpj"
                      type="text"
                      value={
                        restaurante.cnpj || ""
                      }
                      disabled
                      className="
                        h-11
                        w-full
                        cursor-not-allowed
                        rounded-lg
                        border
                        border-gray-200
                        bg-gray-100
                        px-3
                        text-sm
                        text-gray-500
                      "
                    />

                    <p className="mt-1 text-xs text-gray-400">
                      O CNPJ não pode ser alterado.
                    </p>
                  </div>

                  {/* STATUS */}

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
                      Status
                    </label>

                    <div
                      className="
                        flex
                        h-11
                        items-center
                        rounded-lg
                        border
                        border-gray-200
                        bg-gray-50
                        px-3
                      "
                    >
                      {restaurante.status ===
                      "DISPONIVEL" ? (
                        <span
                          className="
                            rounded-full
                            bg-green-50
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-green-700
                          "
                        >
                          Disponível
                        </span>
                      ) : (
                        <span
                          className="
                            rounded-full
                            bg-amber-50
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-amber-700
                          "
                        >
                          Cadastro pendente
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* DESCRIÇÃO */}

                <div className="mt-6">

                  <label
                    htmlFor="descricao"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    Descrição
                  </label>

                  <textarea
                    id="descricao"
                    value={descricao}
                    onChange={(event) => {
                      setDescricao(
                        event.target.value
                      );

                      setErro("");
                      setSucesso("");
                    }}
                    rows={5}
                    maxLength={500}
                    placeholder="Conte um pouco sobre o seu restaurante..."
                    className="
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-gray-300
                      p-3
                      text-sm
                      text-gray-900
                      outline-none
                      transition
                      focus:border-red-500
                      focus:ring-2
                      focus:ring-red-100
                    "
                  />

                  <div className="mt-1 flex justify-end">
                    <span className="text-xs text-gray-400">
                      {descricao.length}/500
                    </span>
                  </div>

                </div>
                
                {/* CATEGORIAS */}

<div className="mt-6">

  <div className="mb-3">
    <p className="text-sm font-medium text-gray-700">
      Categorias
    </p>

    <p className="mt-1 text-xs text-gray-400">
      Selecione as categorias que melhor representam o seu restaurante.
    </p>
  </div>

  <div
    className="
      grid
      grid-cols-1
      gap-3
      sm:grid-cols-2
      md:grid-cols-3
    "
  >
    {categorias.map((categoria) => {

      const selecionada =
        categoriasSelecionadas.includes(
          categoria.id
        );

      return (
        <button
          key={categoria.id}
          type="button"
          onClick={() =>
            alternarCategoria(
              categoria.id
            )
          }
          className={`
            flex
            min-h-12
            items-center
            justify-between
            rounded-lg
            border
            px-4
            py-3
            text-left
            text-sm
            font-medium
            transition

            ${
              selecionada
                ? "border-red-500 bg-red-50 text-red-600"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }
          `}
        >
          <span>
            {categoria.nome}
          </span>

          <span
            className={`
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              border
              text-xs

              ${
                selecionada
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-gray-300"
              }
            `}
          >
            {selecionada ? "✓" : ""}
          </span>

        </button>
      );
    })}
  </div>

  <p className="mt-3 text-xs text-gray-400">
    {categoriasSelecionadas.length}{" "}
    {categoriasSelecionadas.length === 1
      ? "categoria selecionada"
      : "categorias selecionadas"}
  </p>

</div>

                {/* BOTÃO */}

                <div
                  className="
                    mt-8
                    flex
                    justify-end
                    border-t
                    border-gray-100
                    pt-6
                  "
                >
                  <button
                    type="submit"
                    disabled={salvando}
                    className="
                      flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-red-600
                      px-6
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
                </div>

              </form>

            ) : (
              <div
                className="
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-8
                  text-center
                "
              >
                <p className="text-sm text-gray-500">
                  Restaurante não encontrado.
                </p>
              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}