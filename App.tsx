import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, ChevronRight, ArrowLeft, Download, Share2, Lock, Eye, LogOut } from 'lucide-react';
import { generateCardStats } from './services/geminiService';
import { HoloCard } from './components/HoloCard';
import { ImageCropper } from './components/ImageCropper';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Dashboard } from './components/Dashboard';
import { FormData, CardStats, AppStep, MARITAL_STATUS_OPTIONS, Rarity } from './types';
import { toPng } from 'html-to-image';
import { supabase, signOut, getSession } from './lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// Auth states
type AuthState = 'loading' | 'unauthenticated' | 'onboarding' | 'authenticated';

function App() {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [hasAvatar, setHasAvatar] = useState(false);

  const [step, setStep] = useState<AppStep>(AppStep.FORM);
  const [loading, setLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Status bar animation state
  const [cpuUsage, setCpuUsage] = useState(2);
  const [memUsage, setMemUsage] = useState(64);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    image: null,
    age: 30,
    maritalStatus: MARITAL_STATUS_OPTIONS[0],
    profession: ''
  });

  const [rarity, setRarity] = useState<Rarity>('common');

  const [cardStats, setCardStats] = useState<CardStats>({
    attributes: [
      { label: "???", value: 0, icon: 'skull' },
      { label: "???", value: 0, icon: 'skull' },
      { label: "???", value: 0, icon: 'skull' },
      { label: "???", value: 0, icon: 'skull' },
      { label: "???", value: 0, icon: 'skull' }
    ],
    specialAbility: 'Aguardando dados...'
  });

  // Check auth state on mount
  useEffect(() => {
    let mounted = true;
    let authChecked = false; // Prevent duplicate checks

    const checkAuthAndAvatar = async (userId: string): Promise<boolean> => {
      console.log('Checking avatar for user:', userId);

      try {
        const { data: userCards, error } = await supabase
          .from('user_cards')
          .select('id')
          .eq('user_id', userId)
          .eq('is_avatar', true)
          .maybeSingle();

        console.log('Avatar check result:', { userCards, error });

        if (error) {
          console.error('Error checking avatar:', error);
          return false;
        }

        return !!userCards;
      } catch (err) {
        console.error('Avatar check error:', err);
        return false;
      }
    };

    const initAuth = async () => {
      if (authChecked) return; // Prevent duplicate calls
      authChecked = true;

      try {
        console.log('Checking auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session?.user) {
          console.log('No valid session');
          setAuthState('unauthenticated');
          return;
        }

        console.log('Session found for user:', session.user.email);
        setUser(session.user);

        const hasAvatarCard = await checkAuthAndAvatar(session.user.id);

        if (!mounted) return;

        if (hasAvatarCard) {
          console.log('Avatar found, setting authenticated');
          setHasAvatar(true);
          setAuthState('authenticated');
        } else {
          console.log('No avatar, setting onboarding');
          setAuthState('onboarding');
        }
      } catch (err) {
        console.error('Init auth error:', err);
        if (mounted) setAuthState('unauthenticated');
      }
    };

    // Listen for auth changes FIRST (before initAuth to catch INITIAL_SESSION)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (!mounted) return;

      // Only handle specific events
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setHasAvatar(false);
        setAuthState('unauthenticated');
        authChecked = false; // Allow re-check on next sign in
      } else if (event === 'SIGNED_IN' && session?.user && !authChecked) {
        // Only process SIGNED_IN if we haven't checked yet
        setUser(session.user);
        const hasAvatarCard = await checkAuthAndAvatar(session.user.id);
        if (mounted) {
          setHasAvatar(hasAvatarCard);
          setAuthState(hasAvatarCard ? 'authenticated' : 'onboarding');
        }
        authChecked = true;
      }
      // Ignore INITIAL_SESSION, TOKEN_REFRESHED - let initAuth handle initial state
    });

    // Small delay to let subscription be ready
    setTimeout(() => {
      if (mounted) initAuth();
    }, 100);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setHasAvatar(false);
    setAuthState('unauthenticated');
  };

  const handleOnboardingComplete = () => {
    setHasAvatar(true);
    setAuthState('authenticated');
  };

  // Effect to simulate system activity
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 15) + 1);
      // Occasionally fluctuate memory slightly
      if (Math.random() > 0.7) {
        setMemUsage(prev => {
          const change = Math.floor(Math.random() * 5) - 2;
          return Math.max(60, Math.min(70, prev + change));
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempImage(event.target.result as string);
          setShowCropper(true);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = (croppedImg: string) => {
    setFormData(prev => ({ ...prev, image: croppedImg }));
    setShowCropper(false);
    setTempImage(null);
  };

  const rollRarity = (): Rarity => {
    const r = Math.random();
    // Secret Rare: 1% (0.99 - 1.00)
    if (r >= 0.99) return 'secret_rare';
    // Ultra Rare: 4% (0.95 - 0.99)
    if (r >= 0.95) return 'ultra_rare';
    // Rare: 10% (0.85 - 0.95)
    if (r >= 0.85) return 'rare';
    // Uncommon: 25% (0.60 - 0.85)
    if (r >= 0.60) return 'uncommon';
    // Common: 60% (0 - 0.60)
    return 'common';
  };

  const generateCard = async () => {
    if (!formData.name || !formData.profession) {
      alert("Preencha todos os campos obrigatórios, parça!");
      return;
    }

    setLoading(true);
    try {
      // 1. Roll Rarity
      const rolledRarity = rollRarity();
      setRarity(rolledRarity);

      // 2. Fetch Base Stats from AI
      const stats = await generateCardStats(
        formData.age,
        formData.profession,
        formData.maritalStatus,
        formData.name
      );

      // 3. Apply Rarity Bonus (+20 for Rare+)
      // Note: We modify the stats directly here before setting state
      if (['rare', 'ultra_rare', 'secret_rare'].includes(rolledRarity)) {
        stats.attributes = stats.attributes.map(attr => ({
          ...attr,
          value: Math.min(100, attr.value + 20) // Cap at 100 or let it break limits? Let's cap at 100 for now.
        }));
      }

      setCardStats(stats);
      setStep(AppStep.CARD);
    } catch (error) {
      alert("Erro ao conectar com a Matrix. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('holo-card');
    if (!element) return;

    const innerCard = element.firstElementChild as HTMLElement;
    if (!innerCard) return;

    // Temporarily flatten card for capture
    const originalTransform = innerCard.style.transform;
    innerCard.style.transform = 'none';

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `amigo-trunfo-${formData.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao salvar imagem:", err);
      alert("Erro ao salvar imagem. Tente printar a tela, é mais roots.");
    } finally {
      innerCard.style.transform = originalTransform;
    }
  };

  const handleShareStories = async () => {
    const element = document.getElementById('holo-card');
    if (!element) return;

    const innerCard = element.firstElementChild as HTMLElement;
    if (!innerCard) return;

    // Flatten card
    const originalTransform = innerCard.style.transform;
    innerCard.style.transform = 'none';

    try {
      // Capture the card first
      const cardDataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      // Create stories canvas (9:16 ratio = 1080x1920)
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clean gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // Add subtle pattern overlay
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      for (let i = 0; i < 1920; i += 4) {
        ctx.fillRect(0, i, 1080, 1);
      }

      // Load and draw card image centered
      const cardImg = new Image();
      cardImg.src = cardDataUrl;
      await new Promise((resolve) => { cardImg.onload = resolve; });

      // Scale card to fit nicely (card is 320x480, scale up)
      const scale = 2.2;
      const cardWidth = 320 * scale;
      const cardHeight = 480 * scale;
      const cardX = (1080 - cardWidth) / 2;
      const cardY = (1920 - cardHeight) / 2 - 50;

      ctx.drawImage(cardImg, cardX, cardY, cardWidth, cardHeight);

      // Add title at top
      ctx.font = 'bold 48px Oxanium, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('AMIGO TRUNFO', 540, 120);

      // Add subtitle
      ctx.font = '24px Oxanium, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Geração XP', 540, 160);

      // Share using Web Share API or fallback to download
      const blob = await (await fetch(canvas.toDataURL('image/png'))).blob();
      const file = new File([blob], `amigo-trunfo-story-${formData.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Minha carta Amigo Trunfo',
            text: 'Confira minha carta do Amigo Trunfo! 🎴'
          });
        } catch (shareErr) {
          // User cancelled or error - fallback to download
          const link = document.createElement('a');
          link.download = file.name;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        const link = document.createElement('a');
        link.download = `amigo-trunfo-story-${formData.name.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (err) {
      console.error("Erro ao gerar stories:", err);
      alert("Erro ao gerar imagem para stories.");
    } finally {
      innerCard.style.transform = originalTransform;
    }
  };

  // Check for admin mode on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setShowPasswordPrompt(true);
    }
  }, []);

  const handleAdminLogin = () => {
    if (adminPassword === 'trunfo2024') {
      setShowPasswordPrompt(false);
      setStep(AppStep.ADMIN);
    } else {
      alert('Senha incorreta!');
    }
  };

  // Mock data for admin preview
  const mockFormData: FormData = {
    name: 'Preview Card',
    image: 'https://i.pravatar.cc/300',
    age: 25,
    maritalStatus: 'Solteiro(a)',
    profession: 'Developer'
  };

  const mockStats: CardStats = {
    attributes: [
      { label: "Cafeína", value: 95, icon: 'zap' },
      { label: "Debug", value: 80, icon: 'laptop' },
      { label: "Carisma", value: 70, icon: 'smile' },
      { label: "Criatividade", value: 85, icon: 'brain' },
      { label: "Procrastinação", value: 60, icon: 'ghost' }
    ],
    specialAbility: 'Compila na primeira tentativa'
  };

  return (
    <>
      {/* Loading State */}
      {authState === 'loading' && (
        <div className="min-h-screen bg-gradient-to-b from-[#245EDC] to-[#3B7DD8] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-digital">Carregando...</p>
          </div>
        </div>
      )}

      {/* Login Screen */}
      {authState === 'unauthenticated' && (
        <LoginScreen />
      )}

      {/* Onboarding Screen */}
      {authState === 'onboarding' && user && (
        <OnboardingScreen
          userId={user.id}
          userEmail={user.email || ''}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Main App (authenticated) - Dashboard */}
      {authState === 'authenticated' && user && (
        <Dashboard
          userId={user.id}
          userEmail={user.email || ''}
          onSignOut={handleSignOut}
        />
      )}
    </>
  );
}

export default App;
