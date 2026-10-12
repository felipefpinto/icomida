
"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";



import Link from "next/link";

import {
  ArrowLeft,
  MapPin,
  Home,
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
} from "lucide-react";

export default function Enderecos() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [enderecos, setEnderecos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [buscandoCep, setBuscandoCep] = useState(false);  

  const [formulario, setFormulario] = useState({
    apelido: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    ponto_referencia: "",
    latitude: "",
    longitude: "",
  });

  const [enderecoEditando, setEnderecoEditando] = useState(null);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  /*
   * BUSCAR ENDEREÇOS
   */
  useEffect(() => {
    async function carregarEnderecos() {
      const usuarioSalvo = localStorage.getItem("usuarioLogado");

      if (!usuarioSalvo) {
        router.push("/login");
        return;
      }

      try {
        const usuarioLogado = JSON.parse(usuarioSalvo);

        if (!usuarioLogado.id_usuario) {
          throw new Error("ID do usuário não encontrado.");
        }

        setUsuario(usuarioLogado);

        const response = await fetch(
          `http://127.0.0.1:8000/usuario/${usuarioLogado.id_usuario}/enderecos/`
        );

        if (!response.ok) {
          const dados = await response.json().catch(() => ({}));

          throw new Error(
            dados.detail || "Não foi possível buscar os endereços."
          );
        }

        const dadosEnderecos = await response.json();

        setEnderecos(dadosEnderecos);
      } catch (error) {
        console.error("Erro ao carregar endereços:", error);

        setErro(
          error.message || "Não foi possível carregar seus endereços."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarEnderecos();
  }, [router]);

  /*
   * ALTERAR CAMPOS DO FORMULÁRIO
   */
  function handleChange(event) {
    const { name, value } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  /*
   * FORMATAR CEP
   */
  function formatarCep(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 5) {
      return numeros;
    }

    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
  }

  /*
   * ALTERAR CEP
   */
  async function handleCepChange(event) {
  const cepFormatado = formatarCep(event.target.value);

  setFormulario((estadoAnterior) => ({
    ...estadoAnterior,
    cep: cepFormatado,
  }));

  const cepNumeros = cepFormatado.replace(/\D/g, "");

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
      throw new Error("Não foi possível consultar o CEP.");
    }

    const dados = await response.json();

    if (dados.erro) {
      throw new Error("CEP não encontrado.");
    }

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      logradouro: dados.logradouro || "",
      bairro: dados.bairro || "",
      cidade: dados.localidade || "",
      uf: dados.uf || "",
    }));
  } catch (error) {
    console.error("Erro ao consultar CEP:", error);

    setErro(
      error.message || "Não foi possível consultar o CEP."
    );
  } finally {
    setBuscandoCep(false);
  }
}

  /*
   * LIMPAR FORMULÁRIO
   */
  function limparFormulario() {
    setFormulario({
      apelido: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      ponto_referencia: "",
      latitude: "",
      longitude: "",
    });
  }

  /*
   * ADICIONAR NOVO ENDEREÇO
   */
  function novoEndereco() {
    limparFormulario();

    setEnderecoEditando(null);

    setErro("");
    setSucesso("");

    setEditando(true);
  }

  /*
   * EDITAR ENDEREÇO
   */
  function editarEndereco(endereco) {
    setFormulario({
      apelido: endereco.apelido || "",
      cep: formatarCep(endereco.cep || ""),
      logradouro: endereco.logradouro || "",
      numero: endereco.numero || "",
      complemento: endereco.complemento || "",
      bairro: endereco.bairro || "",
      cidade: endereco.cidade || "",
      uf: endereco.uf || "",
      ponto_referencia: endereco.ponto_referencia || "",
      latitude:
        endereco.latitude !== null && endereco.latitude !== undefined
          ? String(endereco.latitude)
          : "",
      longitude:
        endereco.longitude !== null && endereco.longitude !== undefined
          ? String(endereco.longitude)
          : "",
    });

    setEnderecoEditando(endereco);

    setErro("");
    setSucesso("");

    setEditando(true);
  }

 async function definirEnderecoPrincipal(endereco) {
  setErro("");
  setSucesso("");

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/usuario/${usuario.id_usuario}/enderecos/${endereco.id_endereco}/principal`,
      {
        method: "PATCH",
      }
    );

    const dados = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        dados.detail ||
          "Não foi possível definir o endereço principal."
      );
    }

    // Atualiza todos os endereços da tela.
    setEnderecos((estadoAnterior) =>
      estadoAnterior.map((item) => ({
        ...item,
        ativo:
          item.id_endereco === endereco.id_endereco,
      }))
    );

    setSucesso(
      "Endereço principal atualizado com sucesso."
    );

  } catch (error) {

    console.error(
      "Erro ao definir endereço principal:",
      error
    );

    setErro(
      error.message ||
        "Não foi possível definir o endereço principal."
    );
  }
}

  /*
   * CANCELAR EDIÇÃO
   */
  function cancelarEdicao() {
    limparFormulario();

    setEnderecoEditando(null);

    setErro("");
    setSucesso("");

    setEditando(false);
  }

  /*
   * SALVAR ENDEREÇO
   */
  async function salvarEndereco(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      /*
       * Remove a máscara do CEP antes de enviar
       */
      const cepNormalizado = formulario.cep.replace(/\D/g, "");

      /*
       * Monta os dados enviados para a API
       */
      const dadosEndereco = {
        apelido: formulario.apelido || null,
        cep: cepNormalizado,
        logradouro: formulario.logradouro,
        numero: formulario.numero,
        complemento: formulario.complemento || null,
        bairro: formulario.bairro,
        cidade: formulario.cidade,
        uf: formulario.uf.toUpperCase(),
        ponto_referencia: formulario.ponto_referencia || null,
        latitude:
          formulario.latitude !== ""
            ? Number(formulario.latitude)
            : null,
        longitude:
          formulario.longitude !== ""
            ? Number(formulario.longitude)
            : null,
      };

      let response;

      /*
       * EDITAR
       */
      if (enderecoEditando) {
        response = await fetch(
          `http://127.0.0.1:8000/usuario/${usuario.id_usuario}/enderecos/${enderecoEditando.id_endereco}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosEndereco),
          }
        );
      }

      /*
       * CRIAR
       */
      else {
        response = await fetch(
          `http://127.0.0.1:8000/usuario/${usuario.id_usuario}/enderecos/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosEndereco),
          }
        );
      }

      const dados = await response.json();

      if (!response.ok) {
        throw new Error(
          dados.detail || "Não foi possível salvar o endereço."
        );
      }

      /*
       * ATUALIZA A LISTA APÓS CRIAR
       */
      if (!enderecoEditando) {
        setEnderecos((estadoAnterior) => [
          ...estadoAnterior,
          dados,
        ]);

        setSucesso("Endereço cadastrado com sucesso.");
      }

      /*
       * ATUALIZA A LISTA APÓS EDITAR
       */
      else {
        setEnderecos((estadoAnterior) =>
          estadoAnterior.map((endereco) =>
            endereco.id_endereco === dados.id_endereco
              ? dados
              : endereco
          )
        );

        setSucesso("Endereço atualizado com sucesso.");
      }

      limparFormulario();

      setEnderecoEditando(null);

      setEditando(false);
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);

      setErro(
        error.message || "Erro ao salvar o endereço."
      );
    } finally {
      setSalvando(false);
    }
  }

  /*
   * EXCLUIR ENDEREÇO
   */
  async function excluirEndereco(endereco) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o endereço "${endereco.apelido || "Endereço"}"?`
    );

    if (!confirmar) {
      return;
    }

    setErro("");
    setSucesso("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/usuario/${usuario.id_usuario}/enderecos/${endereco.id_endereco}`,
        {
          method: "DELETE",
        }
      );

      const dados = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          dados.detail || "Não foi possível excluir o endereço."
        );
      }

      setEnderecos((estadoAnterior) =>
        estadoAnterior.filter(
          (item) => item.id_endereco !== endereco.id_endereco
        )
      );

      setSucesso("Endereço excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir endereço:", error);

      setErro(
        error.message || "Não foi possível excluir o endereço."
      );
    }
  }

  /*
   * CARREGAMENTO
   */
  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Carregando seus endereços...
        </p>
      </main>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">

        {/* VOLTAR */}
        <Link
          href="/perfil"
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
          Minha conta
        </Link>

        {/* TÍTULO */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Meus endereços
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Consulte e gerencie seus endereços de entrega.
          </p>
        </div>

        {/* MENSAGEM DE SUCESSO */}
        {sucesso && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {sucesso}
          </div>
        )}

        {/* MENSAGEM DE ERRO */}
        {erro && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {erro}
          </div>
        )}

        {/* CONTEÚDO */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          {!editando ? (
            <>
              {/* LISTA DE ENDEREÇOS */}

              {enderecos.length === 0 ? (
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
                    Cadastre um endereço para facilitar suas entregas.
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
                    Adicionar endereço
                  </button>

                </div>
              ) : (
                <div className="space-y-5">

                  {enderecos.map((endereco) => (
                    <div
                      key={endereco.id_endereco}
                      className="
                        rounded-xl
                        border
                        border-gray-200
                        p-5
                      "
                    >

                      {/* INFORMAÇÕES DO ENDEREÇO */}
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
                          <Home
                            size={20}
                            className="text-gray-600"
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="text-xs text-gray-500">
                            Apelido
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {endereco.apelido || "Endereço"}
                          </p>

                          <p className="mt-4 text-sm font-medium text-gray-900">
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
                            {endereco.cidade} - {endereco.uf}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            CEP: {formatarCep(endereco.cep)}
                          </p>

                          {endereco.ponto_referencia && (
                            <p className="mt-2 text-sm text-gray-500">
                              <span className="font-medium">
                                Ponto de referência:
                              </span>{" "}
                              {endereco.ponto_referencia}
                            </p>
                          )}

                        </div>
                      </div>

                      {/* BOTÕES */}
                      <div className="mt-5 flex gap-3">

                        {endereco.ativo ? (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                            <p className="text-sm font-semibold text-green-700">
                            ✓ Endereço principal
                            </p>
                        </div>
                        ) : (
                        <button
                            type="button"
                            onClick={() => definirEnderecoPrincipal(endereco)}
                            className="
                            flex
                            h-10
                            w-full
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
                            <MapPin size={17} />
                            Definir como principal
                        </button>
                        )}

                        <button
                          type="button"
                          onClick={() => editarEndereco(endereco)}
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
                          onClick={() => excluirEndereco(endereco)}
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
                  ))}

                  {/* ADICIONAR OUTRO */}
                  <button
                    type="button"
                    onClick={novoEndereco}
                    className="
                      flex
                      h-11
                      w-full
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
                    <Plus size={18} />
                    Adicionar outro endereço
                  </button>

                </div>
              )}

            </>
          ) : (

            /* FORMULÁRIO */
            <form onSubmit={salvarEndereco}>

              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  {enderecoEditando
                    ? "Editar endereço"
                    : "Adicionar endereço"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Preencha os dados do endereço de entrega.
                </p>
              </div>

              <div className="space-y-5">

                {/* APELIDO */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Apelido
                  </label>

                  <input
                    type="text"
                    name="apelido"
                    value={formulario.apelido}
                    onChange={handleChange}
                    placeholder="Ex.: Casa, Trabalho..."
                    maxLength={32}
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
                      value={formulario.complemento}
                      onChange={handleChange}
                      placeholder="Apto, bloco..."
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
                    value={formulario.ponto_referencia}
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
                  disabled={salvando}
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
                    : enderecoEditando
                    ? "Salvar alterações"
                    : "Cadastrar endereço"}
                </button>

              </div>

            </form>
          )}

        </div>
      </div>
    </main>
  );
}

