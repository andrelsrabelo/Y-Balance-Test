'use client';

import { useState } from 'react';
import { Activity, AlertCircle, Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';

// Credenciais de acesso do app interno (autenticação simples, client-side).
const VALID_USER = 'andre luiz';
const VALID_PASSWORD = '153759';

/** Normaliza para comparação tolerante: minúsculas, sem acentos, espaços colapsados. */
function normalizeUser(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (normalizeUser(username) === VALID_USER && password === VALID_PASSWORD) {
      setError('');
      onLogin();
    } else {
      setError('Usuário ou senha incorretos.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-md">
              <Activity className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">Y-Balance Test</h1>
            <p className="mt-1 text-sm text-slate-500">
              YBT-LQ · Avaliação do Quadrante Inferior
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-user"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Usuário
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-user"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nome de usuário"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-11 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <LogIn className="h-4 w-4" />
              Entrar
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-blue-200/80">
          Acesso restrito à equipe de avaliação.
        </p>
      </div>
    </main>
  );
}
