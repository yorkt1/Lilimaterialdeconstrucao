import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function UserNotRegisteredError() {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <div className="max-w-md space-y-6">
        <h1 className="text-3xl font-heading font-extrabold uppercase tracking-tight">Acesso Restrito</h1>
        <p className="text-muted-foreground">
          Sua conta ainda não está registrada em nosso sistema ou aguarda aprovação administrativa.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.reload()} className="rounded-none font-heading uppercase tracking-wider">
            Tentar Novamente
          </Button>
          <Button variant="outline" onClick={logout} className="rounded-none font-heading uppercase tracking-wider">
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
