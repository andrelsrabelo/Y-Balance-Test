import './globals.css';

export const metadata = {
  title: 'Y-Balance Test | YBT-LQ',
  description:
    'Avaliação clínica do Y-Balance Test para o quadrante inferior (YBT-LQ): coleta de alcances, escores normalizados, escore composto, análise de assimetria e laudo.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1d4ed8',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
