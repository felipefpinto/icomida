"use client";

import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  Store,
  Truck,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function RestauranteCard({ restaurante }) {
  const router = useRouter();

  function abrirRestaurante() {
    router.push(
      `/restaurantes/${restaurante.id_restaurante}`
    );
  }

  return (
    <article
    onClick={abrirRestaurante}
    className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">

      {/* BANNER */}
      <div className="relative h-36 overflow-hidden bg-gray-100">
        {restaurante.banner_url ? (
          <img
            src={`${API_URL}${restaurante.banner_url}`}
            alt={restaurante.nome_fantasia}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Store
              size={40}
              className="text-gray-300"
            />
          </div>
        )}

        {/* LOGO */}
        <div className="absolute -bottom-0 left-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow">
            {restaurante.logo_url ? (
              <img
                src={`${API_URL}${restaurante.logo_url}`}
                alt={`Logo ${restaurante.nome_fantasia}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Store
                size={24}
                className="text-gray-400"
              />
            )}
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-4">
        <h3 className="truncate text-lg font-bold text-gray-900">
          {restaurante.nome_fantasia}
        </h3>

        {/* CATEGORIAS */}
        {restaurante.categorias?.length > 0 && (
          <p className="mt-1 truncate text-sm text-gray-500">
            {restaurante.categorias.join(" • ")}
          </p>
        )}

        {/* ENTREGA */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-600">
          {restaurante.distancia_km !== null && (
            <span className="flex items-center gap-1">
              <MapPin size={15} />

              {restaurante.distancia_km.toFixed(1)} km
            </span>
          )}

          {restaurante.entrega_disponivel === true && (
            <span className="flex items-center gap-1">
              <Truck size={15} />

              {restaurante.taxa_entrega === 0
                ? "Grátis"
                : `R$ ${restaurante.taxa_entrega
                    .toFixed(2)
                    .replace(".", ",")}`}
            </span>
          )}
        </div>

        {/* FUNCIONAMENTO */}
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          <Clock size={15} />

          <span
            className={
              restaurante.aberto
                ? "font-medium text-green-600"
                : "font-medium text-gray-500"
            }
          >
            {restaurante.status_funcionamento}
          </span>
        </div>

        {/* FORA DA ÁREA */}
        {restaurante.entrega_disponivel === false && (
          <div className="mt-3 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-500">
            Fora da área de entrega
          </div>
        )}
      </div>
    </article>
  );
}