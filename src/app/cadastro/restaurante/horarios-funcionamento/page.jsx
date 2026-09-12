"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";

export default function HorariosFuncionamento() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idRestaurante = searchParams.get("id_restaurante");

  const diasSemana = [
    {
      valor: "SEGUNDA",
      nome: "Segunda-feira",
    },
    {
      valor: "TERCA",
      nome: "Terça-feira",
    },
    {
      valor: "QUARTA",
      nome: "Quarta-feira",
    },
    {
      valor: "QUINTA",
      nome: "Quinta-feira",
    },
    {
      valor: "SEXTA",
      nome: "Sexta-feira",
    },
    {
      valor: "SABADO",
      nome: "Sábado",
    },
    {
      valor: "DOMINGO",
      nome: "Domingo",
    },
  ];

  const horasDisponiveis = Array.from(
  { length: 24 },
  (_, indice) =>
    String(indice).padStart(2, "0")
);

const minutosDisponiveis = [
  "00",
  "15",
  "30",
  "45",
];

  const [horarios, setHorarios] = useState(
    diasSemana.map((dia) => ({
      dia_semana: dia.valor,
      ativo: false,
      intervalos: [
        {
          hora_abertura: "08:00",
          hora_fechamento: "18:00",
        },
      ],
    }))
  );

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] =
    useState(false);

    function separarHorario(horario) {
  const [hora, minuto] =
    horario.split(":");

  return {
    hora,
    minuto,
  };
}

  function alternarDia(diaSemana) {
    setHorarios((atuais) =>
      atuais.map((dia) =>
        dia.dia_semana === diaSemana
          ? {
              ...dia,
              ativo: !dia.ativo,
            }
          : dia
      )
    );

    setErro("");
  }

  function alterarIntervalo(
    diaSemana,
    indice,
    campo,
    valor
  ) {
    setHorarios((atuais) =>
      atuais.map((dia) => {
        if (
          dia.dia_semana !== diaSemana
        ) {
          return dia;
        }

        const novosIntervalos =
          dia.intervalos.map(
            (intervalo, index) =>
              index === indice
                ? {
                    ...intervalo,
                    [campo]: valor,
                  }
                : intervalo
          );

        return {
          ...dia,
          intervalos: novosIntervalos,
        };
      })
    );

    setErro("");
  }

  function adicionarIntervalo(
    diaSemana
  ) {
    setHorarios((atuais) =>
      atuais.map((dia) => {
        if (
          dia.dia_semana !== diaSemana
        ) {
          return dia;
        }

        return {
          ...dia,
          intervalos: [
            ...dia.intervalos,
            {
              hora_abertura: "18:00",
              hora_fechamento: "22:00",
            },
          ],
        };
      })
    );

    setErro("");
  }

  function removerIntervalo(
    diaSemana,
    indice
  ) {
    setHorarios((atuais) =>
      atuais.map((dia) => {
        if (
          dia.dia_semana !== diaSemana
        ) {
          return dia;
        }

        if (
          dia.intervalos.length === 1
        ) {
          return dia;
        }

        return {
          ...dia,
          intervalos:
            dia.intervalos.filter(
              (_, index) =>
                index !== indice
            ),
        };
      })
    );

    setErro("");
  }

  function horarioValido15Minutos(
    horario
  ) {
    if (!horario) {
      return false;
    }

    const partes = horario.split(":");

    if (partes.length !== 2) {
      return false;
    }

    const minutos = Number(
      partes[1]
    );

    return [
      0,
      15,
      30,
      45,
    ].includes(minutos);
  }

  function converterParaMinutos(
    horario
  ) {
    const [hora, minutos] =
      horario
        .split(":")
        .map(Number);

    return hora * 60 + minutos;
  }

  function aplicarHorariosAosSelecionados() {
    const primeiroDiaAtivo =
      horarios.find(
        (dia) => dia.ativo
      );

    if (!primeiroDiaAtivo) {
      setErro(
        "Selecione pelo menos um dia."
      );
      return;
    }

    const intervalosReferencia =
      primeiroDiaAtivo.intervalos.map(
        (intervalo) => ({
          ...intervalo,
        })
      );

    setHorarios((atuais) =>
      atuais.map((dia) => {
        if (!dia.ativo) {
          return dia;
        }

        return {
          ...dia,
          intervalos:
            intervalosReferencia.map(
              (intervalo) => ({
                ...intervalo,
              })
            ),
        };
      })
    );

    setErro("");
  }

  function nomeDoDia(diaSemana) {
    return diasSemana.find(
      (dia) =>
        dia.valor === diaSemana
    )?.nome;
  }

  function validarHorarios(
    diasAtivos
  ) {
    for (const dia of diasAtivos) {
      if (
        dia.intervalos.length === 0
      ) {
        setErro(
          `Informe pelo menos um horário para ${nomeDoDia(
            dia.dia_semana
          )}.`
        );

        return false;
      }

      for (
        const intervalo of
        dia.intervalos
      ) {
        if (
          !intervalo.hora_abertura ||
          !intervalo.hora_fechamento
        ) {
          setErro(
            `Preencha todos os horários de ${nomeDoDia(
              dia.dia_semana
            )}.`
          );

          return false;
        }

        if (
          !horarioValido15Minutos(
            intervalo.hora_abertura
          ) ||
          !horarioValido15Minutos(
            intervalo.hora_fechamento
          )
        ) {
          setErro(
            "Os horários devem utilizar intervalos de 15 minutos."
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
            `Em ${nomeDoDia(
              dia.dia_semana
            )}, o horário de fechamento deve ser posterior ao horário de abertura.`
          );

          return false;
        }
      }

      const intervalosOrdenados = [
        ...dia.intervalos,
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
        let indice = 0;
        indice <
        intervalosOrdenados.length -
          1;
        indice++
      ) {
        const atual =
          intervalosOrdenados[
            indice
          ];

        const proximo =
          intervalosOrdenados[
            indice + 1
          ];

        const fechamentoAtual =
          converterParaMinutos(
            atual.hora_fechamento
          );

        const aberturaProximo =
          converterParaMinutos(
            proximo.hora_abertura
          );

        if (
          fechamentoAtual >
          aberturaProximo
        ) {
          setErro(
            `Existem horários sobrepostos em ${nomeDoDia(
              dia.dia_semana
            )}.`
          );

          return false;
        }
      }
    }

    return true;
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setErro("");

    if (!idRestaurante) {
      setErro(
        "Restaurante não identificado."
      );
      return;
    }

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
      return;
    }

    if (
      !validarHorarios(
        diasAtivos
      )
    ) {
      return;
    }

    try {
      setCarregando(true);

      for (const dia of diasAtivos) {
        for (
          const intervalo of
          dia.intervalos
        ) {
          const response =
            await fetch(
              `http://127.0.0.1:8000/restaurantes/${encodeURIComponent(
                idRestaurante
              )}/horarios-funcionamento`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify(
                  {
                    dia_semana:
                      dia.dia_semana,

                    hora_abertura:
                      intervalo.hora_abertura,

                    hora_fechamento:
                      intervalo.hora_fechamento,
                  }
                ),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            console.error(
              "Erro retornado pela API:",
              data
            );

            if (
              typeof data.detail ===
              "string"
            ) {
              throw new Error(
                data.detail
              );
            }

            if (
              Array.isArray(
                data.detail
              )
            ) {
              throw new Error(
                data.detail[0]
                  ?.msg ||
                  "Dados inválidos."
              );
            }

            throw new Error(
              "Não foi possível cadastrar o horário."
            );
          }
        }
      }

      router.push(
        `/cadastro/restaurante/concluido?id_restaurante=${encodeURIComponent(
          idRestaurante
        )}`
      );
    } catch (error) {
      console.error(
        "Erro ao cadastrar horários:",
        error
      );

      setErro(
        error.message ||
          "Não foi possível conectar com o servidor."
      );
    } finally {
      setCarregando(false);
    }
  }

  const quantidadeDiasAtivos =
    horarios.filter(
      (dia) => dia.ativo
    ).length;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-xl">
        {/* VOLTAR */}
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          disabled={carregando}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={18} />

          Voltar
        </button>

        {/* CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* ÍCONE */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Clock3 size={30} />
            </div>
          </div>

          {/* TÍTULO */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Horários de funcionamento
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Selecione os dias em que
              o restaurante funciona e
              configure seus horários.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            {/* DIAS */}
            <div className="space-y-3">
              {diasSemana.map(
                (dia) => {
                  const horario =
                    horarios.find(
                      (item) =>
                        item.dia_semana ===
                        dia.valor
                    );

                  const ativo =
                    horario?.ativo;

                  return (
                    <div
                      key={dia.valor}
                      className={`
                        rounded-xl border
                        p-4 transition
                        ${
                          ativo
                            ? "border-red-300 bg-red-50/40"
                            : "border-gray-200 bg-white"
                        }
                      `}
                    >
                      {/* CABEÇALHO DO DIA */}
                      <div className="flex items-center justify-between gap-4">
                        <button
                          type="button"
                          disabled={
                            carregando
                          }
                          onClick={() =>
                            alternarDia(
                              dia.valor
                            )
                          }
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          <div
                            className={`
                              flex h-6 w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-md
                              border
                              transition
                              ${
                                ativo
                                  ? "border-red-600 bg-red-600 text-white"
                                  : "border-gray-300 bg-white"
                              }
                            `}
                          >
                            {ativo && (
                              <Check
                                size={15}
                              />
                            )}
                          </div>

                          <span
                            className={`
                              text-sm font-medium
                              ${
                                ativo
                                  ? "text-red-700"
                                  : "text-gray-800"
                              }
                            `}
                          >
                            {dia.nome}
                          </span>
                        </button>

                        {!ativo && (
                          <span className="text-xs text-gray-400">
                            Fechado
                          </span>
                        )}

                        {ativo && (
                          <span className="text-xs text-gray-500">
                            {
                              horario
                                .intervalos
                                .length
                            }{" "}
                            {horario
                              .intervalos
                              .length ===
                            1
                              ? "horário"
                              : "horários"}
                          </span>
                        )}
                      </div>

                      {/* INTERVALOS */}
                      {ativo && (
                        <div className="mt-4 space-y-3">
                          {horario.intervalos.map(
                            (
                              intervalo,
                              indice
                            ) => (
                              <div
                                key={
                                  indice
                                }
                                className="rounded-lg border border-gray-200 bg-white p-3"
                              >
                                <div className="flex items-end gap-3">
                                  {/* ABERTURA */}
{/* ABERTURA */}
<div className="flex-1">
  <label className="mb-1 block text-xs text-gray-500">
    Abre
  </label>

  <div className="flex items-center gap-2">
    <select
      value={intervalo.hora_abertura.split(":")[0]}
      disabled={carregando}
      onChange={(event) => {
        const minuto =
          intervalo.hora_abertura.split(":")[1];

        alterarIntervalo(
          dia.valor,
          indice,
          "hora_abertura",
          `${event.target.value}:${minuto}`
        );
      }}
      className="h-11 w-full rounded-lg border border-gray-300 px-2 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
    >
      {Array.from({ length: 24 }, (_, index) => {
        const hora = String(index).padStart(2, "0");

        return (
          <option key={hora} value={hora}>
            {hora}
          </option>
        );
      })}
    </select>

    <span className="text-gray-400">:</span>

    <select
      value={intervalo.hora_abertura.split(":")[1]}
      disabled={carregando}
      onChange={(event) => {
        const hora =
          intervalo.hora_abertura.split(":")[0];

        alterarIntervalo(
          dia.valor,
          indice,
          "hora_abertura",
          `${hora}:${event.target.value}`
        );
      }}
      className="h-11 w-full rounded-lg border border-gray-300 px-2 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
    >
      {["00", "15", "30", "45"].map((minuto) => (
        <option key={minuto} value={minuto}>
          {minuto}
        </option>
      ))}
    </select>
  </div>
</div>

<span className="mb-3 text-gray-400">
  →
</span>

{/* FECHAMENTO */}
<div className="flex-1">
  <label className="mb-1 block text-xs text-gray-500">
    Fecha
  </label>

  <div className="flex items-center gap-2">
    <select
      value={intervalo.hora_fechamento.split(":")[0]}
      disabled={carregando}
      onChange={(event) => {
        const minuto =
          intervalo.hora_fechamento.split(":")[1];

        alterarIntervalo(
          dia.valor,
          indice,
          "hora_fechamento",
          `${event.target.value}:${minuto}`
        );
      }}
      className="h-11 w-full rounded-lg border border-gray-300 px-2 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
    >
      {Array.from({ length: 24 }, (_, index) => {
        const hora = String(index).padStart(2, "0");

        return (
          <option key={hora} value={hora}>
            {hora}
          </option>
        );
      })}
    </select>

    <span className="text-gray-400">:</span>

    <select
      value={intervalo.hora_fechamento.split(":")[1]}
      disabled={carregando}
      onChange={(event) => {
        const hora =
          intervalo.hora_fechamento.split(":")[0];

        alterarIntervalo(
          dia.valor,
          indice,
          "hora_fechamento",
          `${hora}:${event.target.value}`
        );
      }}
      className="h-11 w-full rounded-lg border border-gray-300 px-2 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
    >
      {["00", "15", "30", "45"].map((minuto) => (
        <option key={minuto} value={minuto}>
          {minuto}
        </option>
      ))}
    </select>
  </div>
</div>

                                  {/* EXCLUIR */}
                                  {horario
                                    .intervalos
                                    .length >
                                    1 && (
                                    <button
                                      type="button"
                                      disabled={
                                        carregando
                                      }
                                      onClick={() =>
                                        removerIntervalo(
                                          dia.valor,
                                          indice
                                        )
                                      }
                                      title="Remover horário"
                                      className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <Trash2
                                        size={
                                          18
                                        }
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          )}

                          {/* ADICIONAR INTERVALO */}
                          <button
                            type="button"
                            disabled={
                              carregando
                            }
                            onClick={() =>
                              adicionarIntervalo(
                                dia.valor
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>

            {/* COPIAR HORÁRIOS */}
            {quantidadeDiasAtivos >
              1 && (
              <button
                type="button"
                disabled={carregando}
                onClick={
                  aplicarHorariosAosSelecionados
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Copy size={17} />

                Aplicar horários do primeiro dia aos selecionados
              </button>
            )}

            

            {/* ERRO */}
            {erro && (
              <p className="mt-4 text-center text-sm text-red-600">
                {erro}
              </p>
            )}

            {/* CONTINUAR */}
            <button
              type="submit"
              disabled={carregando}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {carregando
                ? "Salvando..."
                : "Continuar"}

              {!carregando && (
                <ArrowRight
                  size={18}
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}