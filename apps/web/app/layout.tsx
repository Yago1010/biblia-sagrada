import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { AppProvider } from '../lib/store';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bíblia Sagrada',
  description:
    'Bíblia Sagrada completa — todos os 66 livros, NVI e outras traduções, português e inglês, modo claro e escuro. Sem cadastro.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
