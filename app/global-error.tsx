'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-800">
        <h2 className="text-xl font-bold text-slate-900">Erro Global na Aplicação</h2>
        <p className="mt-2 text-sm text-slate-500">Erro inesperado durante a execução do sistema Santa MPS.</p>
        <button
          onClick={() => reset()}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Recarregar Sistema
        </button>
      </body>
    </html>
  );
}
