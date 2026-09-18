import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-800">
      <h1 className="text-4xl font-black text-slate-900">404</h1>
      <h2 className="mt-2 text-lg font-bold text-slate-700">Página Não Encontrada</h2>
      <p className="mt-1 text-sm text-slate-500">O recurso solicitado não está disponível no sistema Santa MPS.</p>
      <Link
        href="/"
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
      >
        Retornar ao Dashboard
      </Link>
    </div>
  );
}
