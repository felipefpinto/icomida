"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Clock,
  Plus,
  Trash2,
  Save,
  Copy,
  CheckCircle2,
} from "lucide-react";

import SidebarRestaurante from "@/app/components/restaurante/SidebarRestaurante";

const diasSemana = [
  { valor: "SEGUNDA", nome: "Segunda-feira" },
  { valor: "TERCA", nome: "Terça-feira" },
  { valor: "QUARTA", nome: "Quarta-feira" },
  { valor: "QUINTA", nome: "Quinta-feira" },
  { valor: "SEXTA", nome: "Sexta-feira" },
  { valor: "SABADO", nome: "Sábado" },
  { valor: "DOMINGO", nome: "Domingo" },
];

const horas = Array.from(
  { length: 24 },
  (_, i) => String(i).padStart(2, "0")
);

const minutos = ["00", "15", "30", "45"];

function criarIntervalo(
  abertura = "08:00",
  fechamento = "18:00",
  id = null
) {
  return {
    id_horario_funcionamento: id,
    hora_abertura: abertura,
    hora_fechamento: fechamento,
  };
}

export default function HorariosRestaurante() {
  const router = useRouter();

  const [idRestaurante, setIdRestaurante] =
    useState(null);

  const [horariosOriginais, setHorariosOriginais] =
    useState([]);

  const [horarios, setHorarios] = useState(
    diasSemana.map((dia) => ({
      dia_semana: dia.valor,
      ativo: false,
      intervalos: [
        criarIntervalo(),
      ],
    }))
  );

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [sucesso, setSucesso] =
    useState("");

  useEffect(() => {
    const restauranteSelecionadoId =
      localStorage.getItem(
        "restauranteSelecionadoId"
      );

    if (!restauranteSelecionadoId) {
      router.push("/restaurantes");
      return;
    }

    setIdRestaurante(
      restauranteSelecionadoId
    );

    buscarHorarios(
      restauranteSelecionadoId
    );
  }, [router]);

  async function buscarHorarios(
    restauranteId
  ) {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(
        `http://127.0.0.1:8000/restaurantes/${restauranteId}/horarios-funcionamento`
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar os horários."
        );
      }

      const dados = await response.json();

      setHorariosOriginais(dados);

      const horariosAgrupados =
        diasSemana.map((dia) => {
          const registrosDia =
            dados.filter(
              (horario) =>
                horario.dia_semana ===
                dia.valor
            );

          if (
            registrosDia.length === 0
          ) {
            return {
              dia_semana:
                dia.valor,
              ativo: false,
              intervalos: [
                criarIntervalo(),
              ],
            };
          }

          return {
            dia_semana:
              dia.valor,
            ativo: true,

            intervalos:
              registrosDia.map(
                (horario) =>
                  criarIntervalo(
                    horario.hora_abertura.slice(
                      0,
                      5
                    ),
                    horario.hora_fechamento.slice(
                      0,
                      5
                    ),
                    horario.id_horario_funcionamento
                  )
              ),
          };
        });

      setHorarios(
        horariosAgrupados
      );
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar os horários."
      );
    } finally {
      setCarregando(false);
    }
  }

  function alternarDia(
    diaSemana
  ) {
    setHorarios(
      (horariosAtuais) =>
        horariosAtuais.map(
          (dia) =>
            dia.dia_semana ===
            diaSemana
              ? {
                  ...dia,
                  ativo:
                    !dia.ativo,
                }
              : dia
        )
    );

    setErro("");
    setSucesso("");
  }

  function alterarIntervalo(
    diaSemana,
    indice,
    campo,
    valor
  ) {
    setHorarios(
      (horariosAtuais) =>
        horariosAtuais.map(
          (dia) => {
            if (
              dia.dia_semana !==
              diaSemana
            ) {
              return dia;
            }

            const novosIntervalos =
              [...dia.intervalos];

            novosIntervalos[
              indice
            ] = {
              ...novosIntervalos[
                indice
              ],
              [campo]: valor,
            };

            return {
              ...dia,
              intervalos:
                novosIntervalos,
            };
          }
        )
    );

    setErro("");
    setSucesso("");
  }

  function adicionarIntervalo(
    diaSemana
  ) {
    setHorarios(
      (horariosAtuais) =>
        horariosAtuais.map(
          (dia) =>
            dia.dia_semana ===
            diaSemana
              ? {
                  ...dia,

                  intervalos: [
                    ...dia.intervalos,

                    criarIntervalo(
                      "18:00",
                      "22:00"
                    ),
                  ],
                }
              : dia
        )
    );

    setErro("");
    setSucesso("");
  }

  function removerIntervalo(
    diaSemana,
    indice
  ) {
    setHorarios(
      (horariosAtuais) =>
        horariosAtuais.map(
          (dia) => {
            if (
              dia.dia_semana !==
              diaSemana
            ) {
              return dia;
            }

            if (
              dia.intervalos
                .length === 1
            ) {
              return dia;
            }

            return {
              ...dia,

              intervalos:
                dia.intervalos.filter(
                  (_, i) =>
                    i !== indice
                ),
            };
          }
        )
    );

    setErro("");
    setSucesso("");
  }

  function alterarParteHorario(
    diaSemana,
    indice,
    campo,
    parte,
    valor
  ) {
    const dia = horarios.find(
      (item) =>
        item.dia_semana ===
        diaSemana
    );

    const horario =
      dia.intervalos[
        indice
      ][campo];

    const [
      horaAtual,
      minutoAtual,
    ] = horario.split(":");

    const novoHorario =
      parte === "hora"
        ? `${valor}:${minutoAtual}`
        : `${horaAtual}:${valor}`;

    alterarIntervalo(
      diaSemana,
      indice,
      campo,
      novoHorario
    );
  }

  function converterParaMinutos(
    horario
  ) {
    const [hora, minuto] =
      horario
        .split(":")
        .map(Number);

    return hora * 60 + minuto;
  }

  function validarHorarios() {
    const diasAtivos =
      horarios.filter(
        (dia) => dia.ativo
      );

    if (
      diasAtivos.length === 0
    ) {
      setErro(
        "Selecione pelo menos um dia de funcionamento."
      );

      return false;
    }

    for (
      const dia of diasAtivos
    ) {
      const intervalos =
        dia.intervalos;

      for (
        const intervalo of intervalos
      ) {
        if (
          !intervalo.hora_abertura ||
          !intervalo.hora_fechamento
        ) {
          setErro(
            "Preencha todos os horários."
          );

          return false;
        }

        const abertura =
          converterParaMinutos(
            intervalo.hora_abertura
          );

        const fechamento =
          converterParaMinutos(
            intervalo.hora_fechamento
          );

        if (
          abertura >= fechamento
        ) {
          setErro(
            "O horário de abertura deve ser anterior ao horário de fechamento."
          );

          return false;
        }
      }

      const ordenados = [
        ...intervalos,
      ].sort(
        (a, b) =>
          converterParaMinutos(
            a.hora_abertura
          ) -
          converterParaMinutos(
            b.hora_abertura
          )
      );

      for (
        let i = 0;
        i <
        ordenados.length - 1;
        i++
      ) {
        const fechamentoAtual =
          converterParaMinutos(
            ordenados[i]
              .hora_fechamento
          );

        const proximaAbertura =
          converterParaMinutos(
            ordenados[i + 1]
              .hora_abertura
          );

        if (
          fechamentoAtual >
          proximaAbertura
        ) {
          setErro(
            "Existem horários sobrepostos no mesmo dia."
          );

          return false;
        }
      }
    }

    return true;
  }

  function aplicarHorariosAosSelecionados() {
    const primeiroDiaAtivo =
      horarios.find(
        (dia) => dia.ativo
      );

    if (!primeiroDiaAtivo) {
      setErro(
        "Selecione pelo menos um dia antes de copiar os horários."
      );

      return;
    }

    setHorarios(
      (horariosAtuais) =>
        horariosAtuais.map(
          (dia) => {
            if (!dia.ativo) {
              return dia;
            }

            return {
              ...dia,

              intervalos:
                primeiroDiaAtivo.intervalos.map(
                  (
                    intervalo
                  ) => ({
                    id_horario_funcionamento:
                      dia.dia_semana ===
                      primeiroDiaAtivo.dia_semana
                        ? intervalo.id_horario_funcionamento
                        : null,

                    hora_abertura:
                      intervalo.hora_abertura,

                    hora_fechamento:
                      intervalo.hora_fechamento,
                  })
                ),
            };
          }
        )
    );

    setErro("");
    setSucesso("");
  }

  async function criarHorario(
    diaSemana,
    intervalo
  ) {
    const response =
      await fetch(
        `http://127.0.0.1:8000/restaurantes/${idRestaurante}/horarios-funcionamento`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            dia_semana:
              diaSemana,

            hora_abertura:
              intervalo.hora_abertura,

            hora_fechamento:
              intervalo.hora_fechamento,
          }),
        }
      );

    const dados =
      await response.json();

    if (!response.ok) {
      console.error(dados);

      throw new Error(
        dados.detail ||
          "Não foi possível criar o horário."
      );
    }

    return dados;
  }

  async function atualizarHorario(
    intervalo
  ) {
    const response =
      await fetch(
        `http://127.0.0.1:8000/restaurantes/${idRestaurante}/horarios-funcionamento/${intervalo.id_horario_funcionamento}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            hora_abertura:
              intervalo.hora_abertura,

            hora_fechamento:
              intervalo.hora_fechamento,
          }),
        }
      );

    const dados =
      await response.json();

    if (!response.ok) {
      console.error(dados);

      throw new Error(
        dados.detail ||
          "Não foi possível atualizar o horário."
      );
    }

    return dados;
  }

  async function deletarHorario(
    idHorario
  ) {
    const response =
      await fetch(
        `http://127.0.0.1:8000/restaurantes/${idRestaurante}/horarios-funcionamento/${idHorario}`,
        {
          method: "DELETE",
        }
      );

    if (!response.ok) {
      const dados =
        await response.json();

      console.error(dados);

      throw new Error(
        dados.detail ||
          "Não foi possível excluir o horário."
      );
    }
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!validarHorarios()) {
      return;
    }

    try {
      setSalvando(true);

      const idsMantidos =
        [];

      // =========================
      // POST E PATCH
      // =========================

      for (
        const dia of horarios
      ) {
        if (!dia.ativo) {
          continue;
        }

        for (
          const intervalo of
            dia.intervalos
        ) {
          if (
            intervalo.id_horario_funcionamento
          ) {
            await atualizarHorario(
              intervalo
            );

            idsMantidos.push(
              intervalo.id_horario_funcionamento
            );
          } else {
            const novoHorario =
              await criarHorario(
                dia.dia_semana,
                intervalo
              );

            idsMantidos.push(
              novoHorario.id_horario_funcionamento
            );
          }
        }
      }

      // =========================
      // DELETE
      // =========================

      for (
        const horarioOriginal of
          horariosOriginais
      ) {
        if (
          !idsMantidos.includes(
            horarioOriginal.id_horario_funcionamento
          )
        ) {
          await deletarHorario(
            horarioOriginal.id_horario_funcionamento
          );
        }
      }

      await buscarHorarios(
        idRestaurante
      );

      setSucesso(
        "Horários de funcionamento atualizados com sucesso."
      );
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Não foi possível salvar os horários."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">

      <SidebarRestaurante />

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
              Horários de funcionamento
            </h1>

            <p className="text-xs text-gray-400">
              Defina quando o seu restaurante está aberto
            </p>
          </div>
        </header>

        <main className="p-6 lg:p-8">

          <div className="mx-auto max-w-5xl">

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>
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
                    <Clock size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Funcionamento semanal
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Você pode cadastrar mais de um horário no mesmo dia.
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {carregando ? (

              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                Carregando horários...
              </div>

            ) : (

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {erro && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {erro}
                  </div>
                )}

                {sucesso && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 size={18} />
                    {sucesso}
                  </div>
                )}

                {/* APLICAR */}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={
                      aplicarHorariosAosSelecionados
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-gray-700
                      transition
                      hover:bg-gray-50
                    "
                  >
                    <Copy size={17} />

                    Aplicar horário aos dias selecionados
                  </button>
                </div>

                {/* DIAS */}

                {horarios.map(
                  (dia) => {
                    const dadosDia =
                      diasSemana.find(
                        (item) =>
                          item.valor ===
                          dia.dia_semana
                      );

                    return (
                      <div
                        key={
                          dia.dia_semana
                        }
                        className="
                          rounded-2xl
                          border
                          border-gray-200
                          bg-white
                          p-5
                          shadow-sm
                        "
                      >

                        {/* DIA */}

                        <div className="flex items-center justify-between">

                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {
                                dadosDia?.nome
                              }
                            </h3>

                            <p className="mt-1 text-xs text-gray-400">
                              {dia.ativo
                                ? "Restaurante aberto neste dia"
                                : "Restaurante fechado neste dia"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              alternarDia(
                                dia.dia_semana
                              )
                            }
                            className={`
                              relative
                              h-7
                              w-12
                              rounded-full
                              transition

                              ${
                                dia.ativo
                                  ? "bg-red-600"
                                  : "bg-gray-300"
                              }
                            `}
                          >
                            <span
                              className={`
                                absolute
                                top-1
                                h-5
                                w-5
                                rounded-full
                                bg-white
                                transition

                                ${
                                  dia.ativo
                                    ? "left-6"
                                    : "left-1"
                                }
                              `}
                            />
                          </button>

                        </div>

                        {/* HORÁRIOS */}

                        {dia.ativo && (
                          <div className="mt-5 space-y-3">

                            {dia.intervalos.map(
                              (
                                intervalo,
                                indice
                              ) => (
                                <div
                                  key={
                                    intervalo.id_horario_funcionamento ??
                                    indice
                                  }
                                  className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    p-4
                                  "
                                >

                                  <HorarioSelect
                                    label="Abre"
                                    valor={
                                      intervalo.hora_abertura
                                    }
                                    onHoraChange={(
                                      valor
                                    ) =>
                                      alterarParteHorario(
                                        dia.dia_semana,
                                        indice,
                                        "hora_abertura",
                                        "hora",
                                        valor
                                      )
                                    }
                                    onMinutoChange={(
                                      valor
                                    ) =>
                                      alterarParteHorario(
                                        dia.dia_semana,
                                        indice,
                                        "hora_abertura",
                                        "minuto",
                                        valor
                                      )
                                    }
                                  />

                                  <span className="mt-5 text-sm text-gray-400">
                                    até
                                  </span>

                                  <HorarioSelect
                                    label="Fecha"
                                    valor={
                                      intervalo.hora_fechamento
                                    }
                                    onHoraChange={(
                                      valor
                                    ) =>
                                      alterarParteHorario(
                                        dia.dia_semana,
                                        indice,
                                        "hora_fechamento",
                                        "hora",
                                        valor
                                      )
                                    }
                                    onMinutoChange={(
                                      valor
                                    ) =>
                                      alterarParteHorario(
                                        dia.dia_semana,
                                        indice,
                                        "hora_fechamento",
                                        "minuto",
                                        valor
                                      )
                                    }
                                  />

                                  {dia.intervalos
                                    .length >
                                    1 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removerIntervalo(
                                          dia.dia_semana,
                                          indice
                                        )
                                      }
                                      className="
                                        mt-5
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-lg
                                        text-gray-400
                                        transition
                                        hover:bg-red-50
                                        hover:text-red-600
                                      "
                                    >
                                      <Trash2
                                        size={
                                          18
                                        }
                                      />
                                    </button>
                                  )}

                                </div>
                              )
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                adicionarIntervalo(
                                  dia.dia_semana
                                )
                              }
                              className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-red-600
                                transition
                                hover:text-red-700
                              "
                            >
                              <Plus
                                size={17}
                              />

                              Adicionar horário
                            </button>

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

                {/* SALVAR */}

                <div
                  className="
                    flex
                    justify-end
                    border-t
                    border-gray-200
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
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

function HorarioSelect({
  label,
  valor,
  onHoraChange,
  onMinutoChange,
}) {
  const [hora, minuto] =
    valor.split(":");

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">
        {label}
      </label>

      <div className="flex items-center gap-1">

        <select
          value={hora}
          onChange={(event) =>
            onHoraChange(
              event.target.value
            )
          }
          className="
            h-10
            rounded-lg
            border
            border-gray-300
            bg-white
            px-2
            text-sm
            text-gray-900
            outline-none
            focus:border-red-500
          "
        >
          {horas.map(
            (horaItem) => (
              <option
                key={horaItem}
                value={horaItem}
              >
                {horaItem}
              </option>
            )
          )}
        </select>

        <span className="text-gray-400">
          :
        </span>

        <select
          value={minuto}
          onChange={(event) =>
            onMinutoChange(
              event.target.value
            )
          }
          className="
            h-10
            rounded-lg
            border
            border-gray-300
            bg-white
            px-2
            text-sm
            text-gray-900
            outline-none
            focus:border-red-500
          "
        >
          {minutos.map(
            (minutoItem) => (
              <option
                key={minutoItem}
                value={minutoItem}
              >
                {minutoItem}
              </option>
            )
          )}
        </select>

      </div>
    </div>
  );
}