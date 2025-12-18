-- ================================================
-- AMIGO TRUNFO - Database Schema
-- Execute este SQL no editor SQL do Supabase
-- ================================================

-- Tabela de Perfis de Usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  xp INT DEFAULT 0,
  level TEXT DEFAULT 'Convidado',
  packs_available INT DEFAULT 5,
  last_pack_opened TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Cartas (Pool Global)
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  profession TEXT,
  category TEXT CHECK (category IN ('KID', 'TEEN', 'ADULT')),
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'ultra_rare', 'secret_rare', 'founder')),
  attr_0 INT DEFAULT 50, -- Energia/Resistência
  attr_1 INT DEFAULT 50, -- Estilo/Caos
  attr_2 INT DEFAULT 50, -- Audácia/Coragem
  attr_3 INT DEFAULT 50, -- Social/Fofura
  attr_4 INT DEFAULT 50, -- Skill/Tech
  special_ability TEXT,
  is_npc BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Cartas do Usuário (Coleção)
CREATE TABLE IF NOT EXISTS user_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  is_avatar BOOLEAN DEFAULT false,
  obtained_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para cards (leitura pública)
CREATE POLICY "Anyone can view cards" ON cards
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert cards" ON cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para user_cards
CREATE POLICY "Users can view their own cards" ON user_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards" ON user_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================
-- SEED: NPCs Famosos dos Anos 90/2000
-- ================================================

INSERT INTO cards (name, profession, category, rarity, attr_0, attr_1, attr_2, attr_3, attr_4, special_ability, is_npc, image_url) VALUES
  ('Eminem', 'Rapper', 'ADULT', 'rare', 85, 95, 90, 40, 75, 'Lose Yourself: +20 Audácia em batalhas', true, 'https://i.imgur.com/placeholder1.png'),
  ('Neo', 'The One', 'ADULT', 'ultra_rare', 100, 90, 95, 50, 100, 'Bullet Time: Esquiva garantida 1x', true, 'https://i.imgur.com/placeholder2.png'),
  ('Faustão', 'Apresentador', 'ADULT', 'rare', 70, 85, 80, 95, 60, 'Ê Loco Meu: +30 Social', true, 'https://i.imgur.com/placeholder3.png'),
  ('Pikachu', 'Pokémon', 'KID', 'uncommon', 60, 75, 70, 100, 55, 'Thunderbolt: +25 Energia', true, 'https://i.imgur.com/placeholder4.png'),
  ('Ash Ketchum', 'Treinador', 'TEEN', 'common', 55, 60, 80, 70, 50, 'Eu Escolho Você: Troca de carta', true, 'https://i.imgur.com/placeholder5.png'),
  ('Xuxa', 'Apresentadora', 'ADULT', 'rare', 65, 80, 75, 100, 70, 'Lua de Cristal: +35 Social', true, 'https://i.imgur.com/placeholder6.png'),
  ('Goku', 'Guerreiro', 'TEEN', 'ultra_rare', 100, 85, 100, 60, 80, 'Kamehameha: Dano dobrado', true, 'https://i.imgur.com/placeholder7.png'),
  ('Bob Esponja', 'Cozinheiro', 'KID', 'uncommon', 50, 90, 60, 95, 70, 'Estou Pronto: +20 Energia', true, 'https://i.imgur.com/placeholder8.png'),
  ('Naruto', 'Ninja', 'TEEN', 'rare', 85, 70, 95, 65, 75, 'Rasengan: +30 Skill', true, 'https://i.imgur.com/placeholder9.png'),
  ('Sandy Cheeks', 'Cientista', 'ADULT', 'common', 75, 55, 80, 60, 95, 'Karatê: +15 Audácia', true, 'https://i.imgur.com/placeholder10.png');

-- ================================================
-- FUNCÃO: Criar perfil automaticamente no signup
-- ================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, xp, level, packs_available)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', 0, 'Convidado', 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
