import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-heading font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-heading font-bold mb-6 uppercase tracking-tight">Página não encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      <Button asChild className="rounded-none font-heading uppercase tracking-wider">
        <Link to="/">Voltar para o Início</Link>
      </Button>
    </div>
  );
}
