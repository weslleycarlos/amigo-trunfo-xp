import React, { useState } from 'react';
import { Star, Sparkles, Crown, Camera, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateCardStats } from '../services/geminiService';
import { HoloCard } from './HoloCard';
import { ImageCropper } from './ImageCropper';
import type { CardStats, FormData } from '../types';

interface OnboardingScreenProps {
    userId: string;
    userEmail: string;
    onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ userId, userEmail, onComplete }) => {
    const [step, setStep] = useState<'intro' | 'form' | 'generating' | 'preview'>('intro');
    const [formData, setFormData] = useState<FormData>({
        name: '',
        age: 25,
        profession: '',
        maritalStatus: 'Solteiro(a)',
        imageUrl: ''
    });
    const [stats, setStats] = useState<CardStats | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' ? parseInt(value) || 0 : value
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setTempImage(e.target?.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (croppedImage: string) => {
        setFormData(prev => ({ ...prev, imageUrl: croppedImage }));
        setShowCropper(false);
        setTempImage(null);
    };

    const handleGenerate = async () => {
        setStep('generating');
        try {
            const generatedStats = await generateCardStats(
                formData.age,
                formData.profession,
                formData.maritalStatus,
                formData.name
            );
            setStats(generatedStats);
            setStep('preview');
        } catch (error) {
            console.error('Error generating stats:', error);
            alert('Erro ao gerar atributos. Tente novamente.');
            setStep('form');
        }
    };

    const handleSaveCard = async () => {
        if (!stats) return;
        setSaving(true);

        try {
            // First, create/update the user profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    username: formData.name,
                    xp: 0,
                    level: 'Fundador',
                    packs_available: 5,
                    created_at: new Date().toISOString()
                });

            if (profileError) throw profileError;

            // Then, create the avatar card
            const { data: cardData, error: cardError } = await supabase
                .from('cards')
                .insert({
                    name: formData.name,
                    image_url: formData.imageUrl,
                    profession: formData.profession,
                    category: formData.age < 12 ? 'KID' : formData.age < 20 ? 'TEEN' : 'ADULT',
                    rarity: 'founder',
                    attr_0: stats.attributes[0]?.value || 50,
                    attr_1: stats.attributes[1]?.value || 50,
                    attr_2: stats.attributes[2]?.value || 50,
                    attr_3: stats.attributes[3]?.value || 50,
                    attr_4: stats.attributes[4]?.value || 50,
                    special_ability: stats.specialAbility,
                    is_npc: false
                })
                .select()
                .single();

            if (cardError) throw cardError;

            // Link card to user as avatar
            const { error: linkError } = await supabase
                .from('user_cards')
                .insert({
                    user_id: userId,
                    card_id: cardData.id,
                    is_avatar: true
                });

            if (linkError) throw linkError;

            onComplete();
        } catch (error) {
            console.error('Error saving card:', error);
            alert('Erro ao salvar carta. Verifique a configuração do banco de dados.');
        } finally {
            setSaving(false);
        }
    };

    const isFormValid = formData.name && formData.profession && formData.imageUrl;

    // Intro Step
    if (step === 'intro') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23] flex items-center justify-center p-4">
                <div className="text-center max-w-lg">
                    {/* Glowing effect */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 opacity-30 animate-pulse"></div>
                        <Crown className="w-24 h-24 mx-auto text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] relative z-10" />
                    </div>

                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 font-digital mb-4">
                        Bem-vindo, Fundador!
                    </h1>

                    <p className="text-gray-300 text-lg mb-6 font-digital">
                        Você é um dos primeiros a entrar no Amigo Trunfo.
                        Como recompensa, sua primeira carta terá o selo exclusivo de <span className="text-yellow-400 font-bold">FUNDADOR</span>.
                    </p>

                    <div className="bg-white/5 border border-yellow-500/30 rounded-lg p-4 mb-8">
                        <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-bold font-digital">Carta Mestre</span>
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <p className="text-gray-400 text-sm font-digital">
                            Esta será sua carta avatar - única e intransferível.
                        </p>
                    </div>

                    <button
                        onClick={() => setStep('form')}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold text-lg rounded-lg shadow-lg hover:scale-105 transition-transform font-digital"
                    >
                        Criar Minha Carta Mestre
                    </button>
                </div>
            </div>
        );
    }

    // Form Step
    if (step === 'form') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-yellow-400 font-digital">Crie sua Carta Mestre</h2>
                        <p className="text-gray-400 text-sm font-digital">Preencha os dados para gerar seus atributos</p>
                    </div>

                    <div className="bg-[#ECE9D8] p-1 rounded-lg shadow-2xl border-2 border-yellow-500">
                        <div className="bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 px-4 py-2 rounded-t flex items-center gap-2">
                            <Crown className="w-4 h-4 text-white" />
                            <span className="text-white font-bold text-sm drop-shadow font-digital">Carta Fundador</span>
                        </div>

                        <div className="bg-white p-4 space-y-4">
                            {/* Photo Upload */}
                            <div className="flex justify-center">
                                <label className="cursor-pointer">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#6CA0DC] to-[#4B8BD4] p-1 shadow-lg hover:scale-105 transition-transform">
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {formData.imageUrl ? (
                                                <img src={formData.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-center text-xs text-gray-500">Clique para adicionar foto</p>

                            {/* Name */}
                            <div>
                                <label className="block text-xs text-gray-600 mb-1 font-bold">Nick / Nome (máx. 12)</label>
                                <input
                                    type="text"
                                    name="name"
                                    maxLength={12}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#7F9DB9] px-3 py-2 rounded focus:outline-none focus:border-yellow-500 text-sm text-black"
                                    placeholder="Seu nome"
                                />
                            </div>

                            {/* Age */}
                            <div>
                                <label className="block text-xs text-gray-600 mb-1 font-bold">Idade</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#7F9DB9] px-3 py-2 rounded focus:outline-none focus:border-yellow-500 text-sm text-black"
                                    min={1}
                                    max={120}
                                />
                            </div>

                            {/* Profession */}
                            <div>
                                <label className="block text-xs text-gray-600 mb-1 font-bold">Profissão / Hobby</label>
                                <input
                                    type="text"
                                    name="profession"
                                    value={formData.profession}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#7F9DB9] px-3 py-2 rounded focus:outline-none focus:border-yellow-500 text-sm text-black"
                                    placeholder="Ex: Programador, Estudante"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs text-gray-600 mb-1 font-bold">Status</label>
                                <select
                                    name="maritalStatus"
                                    value={formData.maritalStatus}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#7F9DB9] px-3 py-2 rounded focus:outline-none focus:border-yellow-500 text-sm text-black bg-white"
                                >
                                    <option>Solteiro(a)</option>
                                    <option>Casado(a)</option>
                                    <option>Namorando</option>
                                    <option>Complicado</option>
                                </select>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleGenerate}
                                disabled={!isFormValid}
                                className="w-full py-3 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold rounded shadow-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed font-digital"
                            >
                                Gerar Atributos com IA
                            </button>
                        </div>
                    </div>
                </div>

                {showCropper && tempImage && (
                    <ImageCropper
                        imageSrc={tempImage}
                        onCancel={() => { setShowCropper(false); setTempImage(null); }}
                        onCropComplete={handleCropComplete}
                    />
                )}
            </div>
        );
    }

    // Generating Step
    if (step === 'generating') {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="relative mb-8">
                        <Star className="w-16 h-16 mx-auto text-yellow-400 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-yellow-400 font-digital mb-2">Gerando sua carta...</h2>
                    <p className="text-gray-400 font-digital">A IA está analisando seu perfil</p>
                </div>
            </div>
        );
    }

    // Preview Step
    if (step === 'preview' && stats) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0f0f23] via-[#1a1a3e] to-[#0f0f23] flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-yellow-400 font-digital mb-6">Sua Carta Mestre!</h2>

                <div className="mb-6">
                    <HoloCard data={formData} stats={stats} rarity="founder" />
                </div>

                <button
                    onClick={handleSaveCard}
                    disabled={saving}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white font-bold text-lg rounded-lg shadow-lg hover:scale-105 transition-transform font-digital disabled:opacity-50"
                >
                    {saving ? 'Salvando...' : 'Confirmar e Entrar no Jogo'}
                </button>
            </div>
        );
    }

    return null;
};
