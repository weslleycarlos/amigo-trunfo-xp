import React, { useState } from 'react';
import { signInWithGoogle } from '../lib/supabase';
import { User, Monitor, Wifi } from 'lucide-react';

interface LoginScreenProps {
    onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleNostalgicClick = (service: string) => {
        // Create retro alert
        const year = service === 'Orkut' ? '2014' : '2013';
        alert(`⚠️ ${service} - Serviço temporariamente indisponível desde ${year}.\n\nTente novamente em alguns anos... ou use o Google.`);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                alert('Erro ao fazer login: ' + error.message);
            } else if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#245EDC] to-[#3B7DD8] flex items-center justify-center p-4">
            {/* Stars/clouds decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-20 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute top-40 right-32 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            </div>

            {/* Login Container - XP Style */}
            <div className="relative z-10 w-full max-w-md">
                {/* Windows XP Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Monitor className="w-10 h-10 text-white drop-shadow-lg" />
                        <h1 className="text-3xl font-bold text-white drop-shadow-lg font-digital tracking-wide">
                            Amigo Trunfo
                        </h1>
                    </div>
                    <p className="text-white/80 text-sm font-digital">Geração XP - Bem-vindo</p>
                </div>

                {/* User Card */}
                <div className="bg-gradient-to-b from-[#4B8BD4] to-[#245EDC] rounded-xl p-1 shadow-2xl">
                    <div className="bg-[#ECE9D8] rounded-lg overflow-hidden">
                        {/* Title bar */}
                        <div className="bg-gradient-to-r from-[#0058EE] via-[#2F82FF] to-[#0054E3] px-4 py-2 flex items-center gap-2">
                            <Wifi className="w-4 h-4 text-white" />
                            <span className="text-white font-bold text-sm drop-shadow">Fazer Logon no Sistema</span>
                        </div>

                        {/* User icon area */}
                        <div className="p-6 flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#6CA0DC] to-[#4B8BD4] p-1 shadow-lg mb-4">
                                <div className="w-full h-full rounded-full bg-[#ECE9D8] flex items-center justify-center">
                                    <User className="w-14 h-14 text-[#0054E3]" />
                                </div>
                            </div>

                            <h2 className="text-lg font-bold text-gray-800 font-digital mb-1">Novo Usuário</h2>
                            <p className="text-xs text-gray-500 mb-6">Escolha como deseja entrar</p>

                            {/* Login Buttons */}
                            <div className="w-full space-y-3">
                                {/* Orkut Button (nostalgic) */}
                                <button
                                    onClick={() => handleNostalgicClick('Orkut')}
                                    className="w-full px-4 py-3 bg-gradient-to-b from-[#EC5595] to-[#D93E7D] text-white font-digital font-bold text-sm rounded shadow-md hover:brightness-110 active:translate-y-0.5 flex items-center justify-center gap-3 border-2 border-[#C72E6D] transition-all"
                                >
                                    <img src="https://images.icon-icons.com/844/PNG/512/Orkut_icon-icons.com_67057.png" alt="Orkut" className="w-6 h-6" />
                                    Entrar com Orkut
                                </button>

                                {/* MSN Button (nostalgic) */}
                                <button
                                    onClick={() => handleNostalgicClick('MSN Messenger')}
                                    className="w-full px-4 py-3 bg-gradient-to-b from-[#5DC161] to-[#3EA643] text-white font-digital font-bold text-sm rounded shadow-md hover:brightness-110 active:translate-y-0.5 flex items-center justify-center gap-3 border-2 border-[#2E9431] transition-all"
                                >
                                    <img src="https://images.icon-icons.com/5/PNG/256/MSN_messenger_user_156.png" alt="MSN" className="w-6 h-6" />
                                    Entrar com MSN Messenger
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-2 my-4">
                                    <div className="flex-1 h-px bg-gray-300"></div>
                                    <span className="text-xs text-gray-400 font-digital">ou</span>
                                    <div className="flex-1 h-px bg-gray-300"></div>
                                </div>

                                {/* Google Button (functional) */}
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-white text-gray-700 font-digital font-bold text-sm rounded shadow-md hover:bg-gray-50 active:translate-y-0.5 flex items-center justify-center gap-3 border-2 border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Conectando...</span>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Entrar com Google
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-[#D4D0C8] px-4 py-2 border-t border-[#ACA899]">
                            <p className="text-[10px] text-gray-500 text-center font-digital">
                                Amigo Trunfo Corp. © 1999-2024 | Todos os direitos reservados
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom tip */}
                <p className="text-center text-white/60 text-xs mt-6 font-digital">
                    Após o login, você criará sua Carta Mestre exclusiva! 🎴
                </p>
            </div>
        </div>
    );
};
