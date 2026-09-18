import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Santa MPS - Gestão e Monitoramento de Outsourcing de Impressão',
  description: 'Sistema completo de gestão, monitoramento, contadores, suprimentos, contratos, faturamento, chamados e ordens de serviço para outsourcing de impressão.',
  openGraph: {
    title: 'Santa MPS - Gestão e Monitoramento de Outsourcing de Impressão',
    description: 'Sistema completo de gestão, monitoramento, contadores, suprimentos, contratos, faturamento, chamados e ordens de serviço para outsourcing de impressão.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Santa MPS - Gestão e Monitoramento de Outsourcing de Impressão',
    description: 'Sistema completo de gestão, monitoramento, contadores, suprimentos, contratos, faturamento, chamados e ordens de serviço para outsourcing de impressão.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
