import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import { getQueryFn } from "./lib/queryClient";

interface AuthUser {
  id: string;
  username: string;
  role: string;
  familyId: string;
}

function AppContent() {
  const [authUser, setAuthUser] = useState<AuthUser | null | undefined>(undefined);

  const { data: meData, isLoading } = useQuery<AuthUser>({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading) {
      setAuthUser(meData ?? null);
    }
  }, [meData, isLoading]);

  const handleAuthSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    const me = await queryClient.fetchQuery<AuthUser>({
      queryKey: ['/api/auth/me'],
      queryFn: getQueryFn({ on401: 'returnNull' }),
    });
    setAuthUser(me ?? null);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    queryClient.clear();
    setAuthUser(null);
  };

  if (authUser === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-xl font-bold font-display text-gray-800">Cargando Mascotas Felices...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return <Home authUser={authUser} onLogout={handleLogout} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
