'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-800">
      <h2 className="text-xl font-bold text-slate-900">Algo deu errado!</h2>
      <p className="mt-2 text-sm text-slate-500">Ocorreu uma falha no carregamento do módulo Santa MPS.</p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
