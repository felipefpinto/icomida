"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  MapPin,
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
  Store,
} from "lucide-react";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

export default function EnderecoRestaurante() {
  const router = useRouter();

  const [idRestaurante, setIdRestaurante] = useState(null);

  const [endereco, setEndereco] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [formulario, setFormulario] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    ponto_referencia: "",
  });

  /*
   * FORMATAR CEP
   */
  function formatarCep(valor) {
    const numeros = String(valor || "")
      .replace(/\D/g, "")
      .slice(0, 8);

    if (numeros.length <= 5) {
      return numeros;
    }

    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
  }

  /*
   * LIMPAR FORMULÁRIO
   */
  function limparFormulario() {
    setFormulario({
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      ponto_referencia: "",
    });
  }

  /*
   * CARREGAR ENDEREÇO DO RESTAURANTE
   */
  useEffect(() => {
    async function carregarEndereco() {
      const restauranteSalvo = localStorage.getItem(
        "restauranteSelecionadoId"
      );

      if (!restauranteSalvo) {
        setErro("Nenhum restaurante selecionado.");
        setCarregando(false);
        return;
      }

      setIdRestaurante(restauranteSalvo);

      try {
        const response = await fetch(
          `http://localhost:8000/restaurantes/${restauranteSalvo}/endereco/`
        );

        /*
         * 404 significa apenas que o restaurante
         * ainda não possui endereço.
         */
        if (response.status === 404) {
          setEndereco(null);
          return;
        }

        const dados = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            dados.detail ||
              "Não foi possível carregar o endereço do restaurante."
          );
        }

        setEndereco(dados);
      } catch (error) {
        console.error(
          "Erro ao carregar endereço do restaurante:",
          error
        );

        setErro(
          error.message ||
            "Não foi possível carregar o endereço do restaurante."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarEndereco();
  }, []);

  /*
   * ALTERAR CAMPOS
   */
  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  /*
   * CONSULTAR CEP
   */
  async function handleCepChange(event) {
    const cepFormatado = formatarCep(
      event.target.value
    );

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      cep: cepFormatado,
    }));

    const cepNumeros = cepFormatado.replace(
      /\D/g,
      ""
    );

    if (cepNumeros.length !== 8) {
      return;
    }

    setBuscandoCep(true);
    setErro("");

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepNumeros}/json/`
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível consultar o CEP."
        );
      }

      const dados = await response.json();

      if (dados.erro) {
        throw new Error(
          "CEP não encontrado."
        );
      }

      setFormulario((estadoAnterior) => ({
        ...estadoAnterior,
        logradouro: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidade: dados.localidade || "",
        uf: dados.uf || "",
      }));
    } catch (error) {
      console.error(
        "Erro ao consultar CEP:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível consultar o CEP."
      );
    } finally {
      setBuscandoCep(false);
    }
  }

  /*
   * NOVO ENDEREÇO
   */
  function novoEndereco() {
    limparFormulario();

    setErro("");
    setSucesso("");

    setEditando(true);
  }

  /*
   * EDITAR ENDEREÇO
   */
  function editarEndereco() {
    if (!endereco) {
      return;
    }

    setFormulario({
      cep: formatarCep(endereco.cep),
      logradouro: endereco.logradouro || "",
      numero: endereco.numero || "",
      complemento: endereco.complemento || "",
      bairro: endereco.bairro || "",
      cidade: endereco.cidade || "",
      uf: endereco.uf || "",
      ponto_referencia:
        endereco.ponto_referencia || "",
    });

    setErro("");
    setSucesso("");

    setEditando(true);
  }

  /*
   * CANCELAR
   */
  function cancelarEdicao() {
    limparFormulario();

    setErro("");
    setSucesso("");

    setEditando(false);
  }

  /*
   * SALVAR ENDEREÇO
   */
  async function salvarEndereco(event) {
    event.preventDefault();

    if (!idRestaurante) {
      setErro(
        "Nenhum restaurante selecionado."
      );
      return;
    }

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      const cepNormalizado =
        formulario.cep.replace(/\D/g, "");

      const dadosEndereco = {
        cep: cepNormalizado,
        logradouro:
          formulario.logradouro.trim(),
        numero:
          formulario.numero.trim(),

        complemento:
          formulario.complemento.trim() ||
          null,

        bairro:
          formulario.bairro.trim(),

        cidade:
          formulario.cidade.trim(),

        uf:
          formulario.uf
            .trim()
            .toUpperCase(),

        ponto_referencia:
          formulario.ponto_referencia.trim() ||
          null,
      };

      let response;

      /*
       * EDITAR
       */
      if (endereco) {
        response = await fetch(
          `http://localhost:8000/restaurantes/${idRestaurante}/endereco/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              dadosEndereco
            ),
          }
        );
      }

      /*
       * CRIAR
       */
      else {
        response = await fetch(
          `http://localhost:8000/restaurantes/${idRestaurante}/endereco/`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              dadosEndereco
            ),
          }
        );
      }

      const dados =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        throw new Error(
          dados.detail ||
            "Não foi possível salvar o endereço."
        );
      }

      setEndereco(dados);

      if (endereco) {
        setSucesso(
          "Endereço atualizado com sucesso."
        );
      } else {
        setSucesso(
          "Endereço cadastrado com sucesso."
        );
      }

      limparFormulario();
      setEditando(false);
    } catch (error) {
      console.error(
        "Erro ao salvar endereço:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível salvar o endereço."
      );
    } finally {
      setSalvando(false);
    }
  }

  /*
   * EXCLUIR ENDEREÇO
   */
  async function excluirEndereco() {
    if (!idRestaurante || !endereco) {
      return;
    }

    const confirmar = window.confirm(
      "Tem certeza que deseja excluir o endereço deste restaurante?"
    );

    if (!confirmar) {
      return;
    }

    setErro("");
    setSucesso("");

    try {
      const response = await fetch(
        `http://localhost:8000/restaurantes/${idRestaurante}/endereco/`,
        {
          method: "DELETE",
        }
      );

      const dados =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        throw new Error(
          dados.detail ||
            "Não foi possível excluir o endereço."
        );
      }

      setEndereco(null);

      setSucesso(
        "Endereço excluído com sucesso."
      );
    } catch (error) {
      console.error(
        "Erro ao excluir endereço:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível excluir o endereço."
      );
    }
  }

  /*
   * CARREGAMENTO
   */
  if (carregando) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarRestaurante />

        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">
            Carregando endereço...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarRestaurante />

      <main className="flex-1 px-4 py-10 lg:px-10">
        <div className="mx-auto w-full max-w-3xl">

          {/* TÍTULO */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Endereço do restaurante
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Consulte e gerencie o endereço físico do restaurante.
            </p>
          </div>

          {/* SUCESSO */}
          {sucesso && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {sucesso}
            </div>
          )}

          {/* ERRO */}
          {erro && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {erro}
            </div>
          )}

          {/* CONTEÚDO */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

            {!editando ? (
              <>
                {/* SEM ENDEREÇO */}
                {!endereco ? (
                  <div className="py-8 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <MapPin
                        size={26}
                        className="text-gray-600"
                      />
                    </div>

                    <h2 className="mt-4 text-base font-bold text-gray-900">
                      Nenhum endereço cadastrado
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Cadastre o endereço do seu restaurante.
                    </p>

                    <button
                      type="button"
                      onClick={novoEndereco}
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
                      Cadastrar endereço
                    </button>
                  </div>
                ) : (
                  /* ENDEREÇO CADASTRADO */
                  <div className="rounded-xl border border-gray-200 p-5">

                    <div className="flex items-start gap-4">

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          bg-gray-100
                        "
                      >
                        <Store
                          size={20}
                          className="text-gray-600"
                        />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-xs text-gray-500">
                          Endereço do restaurante
                        </p>

                        <p className="mt-2 text-sm font-semibold text-gray-900">
                          {endereco.logradouro},{" "}
                          {endereco.numero}
                        </p>

                        {endereco.complemento && (
                          <p className="mt-1 text-sm text-gray-500">
                            {endereco.complemento}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-gray-500">
                          {endereco.bairro}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {endereco.cidade} -{" "}
                          {endereco.uf}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          CEP:{" "}
                          {formatarCep(
                            endereco.cep
                          )}
                        </p>

                        {endereco.ponto_referencia && (
                          <p className="mt-2 text-sm text-gray-500">
                            <span className="font-medium">
                              Ponto de referência:
                            </span>{" "}
                            {
                              endereco.ponto_referencia
                            }
                          </p>
                        )}

                      </div>
                    </div>

                    {/* BOTÕES */}
                    <div className="mt-5 flex gap-3">

                      <button
                        type="button"
                        onClick={editarEndereco}
                        className="
                          flex
                          h-10
                          flex-1
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-gray-300
                          bg-white
                          text-sm
                          font-semibold
                          text-gray-700
                          transition
                          hover:bg-gray-50
                        "
                      >
                        <Pencil size={17} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={excluirEndereco}
                        className="
                          flex
                          h-10
                          flex-1
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-red-200
                          bg-white
                          text-sm
                          font-semibold
                          text-red-600
                          transition
                          hover:bg-red-50
                        "
                      >
                        <Trash2 size={17} />
                        Excluir
                      </button>

                    </div>
                  </div>
                )}
              </>
            ) : (
              /* FORMULÁRIO */
              <form onSubmit={salvarEndereco}>

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900">
                    {endereco
                      ? "Editar endereço"
                      : "Cadastrar endereço"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Informe onde o restaurante está localizado.
                  </p>
                </div>

                <div className="space-y-5">

                  {/* CEP */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      CEP
                    </label>

                    <input
                      type="text"
                      name="cep"
                      value={formulario.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-4
                        text-sm
                        text-gray-900
                        outline-none
                        transition
                        focus:border-red-500
                        focus:ring-2
                        focus:ring-red-100
                      "
                    />

                    {buscandoCep && (
                      <p className="mt-2 text-xs text-gray-500">
                        Buscando endereço pelo CEP...
                      </p>
                    )}
                  </div>

                  {/* LOGRADOURO */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Logradouro
                    </label>

                    <input
                      type="text"
                      name="logradouro"
                      value={formulario.logradouro}
                      onChange={handleChange}
                      placeholder="Rua, Avenida..."
                      maxLength={50}
                      required
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-4
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

                  {/* NÚMERO + COMPLEMENTO */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Número
                      </label>

                      <input
                        type="text"
                        name="numero"
                        value={formulario.numero}
                        onChange={handleChange}
                        placeholder="Ex.: 123"
                        maxLength={20}
                        required
                        className="
                          h-11
                          w-full
                          rounded-lg
                          border
                          border-gray-300
                          bg-white
                          px-4
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

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Complemento
                      </label>

                      <input
                        type="text"
                        name="complemento"
                        value={
                          formulario.complemento
                        }
                        onChange={handleChange}
                        placeholder="Sala, bloco..."
                        maxLength={50}
                        className="
                          h-11
                          w-full
                          rounded-lg
                          border
                          border-gray-300
                          bg-white
                          px-4
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

                  {/* BAIRRO */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Bairro
                    </label>

                    <input
                      type="text"
                      name="bairro"
                      value={formulario.bairro}
                      onChange={handleChange}
                      maxLength={50}
                      required
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-4
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

                  {/* CIDADE + UF */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Cidade
                      </label>

                      <input
                        type="text"
                        name="cidade"
                        value={formulario.cidade}
                        onChange={handleChange}
                        maxLength={50}
                        required
                        className="
                          h-11
                          w-full
                          rounded-lg
                          border
                          border-gray-300
                          bg-white
                          px-4
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

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        UF
                      </label>

                      <input
                        type="text"
                        name="uf"
                        value={formulario.uf}
                        onChange={handleChange}
                        maxLength={2}
                        required
                        className="
                          h-11
                          w-full
                          rounded-lg
                          border
                          border-gray-300
                          bg-white
                          px-4
                          text-sm
                          uppercase
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

                  {/* PONTO DE REFERÊNCIA */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Ponto de referência
                    </label>

                    <input
                      type="text"
                      name="ponto_referencia"
                      value={
                        formulario.ponto_referencia
                      }
                      onChange={handleChange}
                      placeholder="Ex.: Próximo ao mercado..."
                      maxLength={70}
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        bg-white
                        px-4
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

                {/* BOTÕES */}
                <div className="mt-8 flex gap-3">

                  <button
                    type="button"
                    onClick={cancelarEdicao}
                    disabled={salvando}
                    className="
                      flex
                      h-12
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      text-sm
                      font-semibold
                      text-gray-700
                      transition
                      hover:bg-gray-50
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <X size={18} />
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={
                      salvando ||
                      buscandoCep
                    }
                    className="
                      flex
                      h-12
                      flex-1
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
                      disabled:opacity-50
                    "
                  >
                    <Save size={18} />

                    {salvando
                      ? "Salvando..."
                      : endereco
                      ? "Salvar alterações"
                      : "Cadastrar endereço"}
                  </button>

                </div>

              </form>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}