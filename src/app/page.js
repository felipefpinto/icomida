"use client";

import Header from "./components/Header";

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <section className="mx-auto max-w-[1400px] px-6 py-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Encontre seu restaurante favorito
          </h1>

          <p className="mt-3 text-gray-500">
            Peça sua comida favorita onde estiver.
          </p>
        </section>
      </main>
    </div>
  );
}