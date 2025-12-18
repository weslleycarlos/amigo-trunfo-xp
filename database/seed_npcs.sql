-- =============================================
-- EXPANSÃO DE NPCs - Amigo Trunfo XP
-- Execute este SQL no Supabase SQL Editor
-- =============================================
-- Categorias válidas: 'KID', 'TEEN', 'ADULT'
-- Raridades válidas: 'common', 'uncommon', 'rare', 'ultra_rare', 'secret_rare', 'founder'

-- Categoria: Música (Brasil)
INSERT INTO cards (name, image_url, profession, category, rarity, is_npc, attr_0, attr_1, attr_2, attr_3, attr_4, special_ability) VALUES
('Anitta', 'https://i.imgur.com/5TZqKwO.jpg', 'Cantora', 'ADULT', 'secret_rare', true, 95, 99, 90, 95, 85, 'Envenenada: dobra carisma'),
('Ivete Sangalo', 'https://i.imgur.com/qKZmvYn.jpg', 'Cantora', 'ADULT', 'ultra_rare', true, 98, 90, 85, 99, 80, 'Axé Ilimitado'),
('Seu Jorge', 'https://i.imgur.com/0RvKcLw.jpg', 'Cantor/Ator', 'ADULT', 'ultra_rare', true, 75, 95, 70, 85, 90, 'Vida de Pescador'),
('Tim Maia', 'https://i.imgur.com/YvK0R8a.jpg', 'Cantor', 'ADULT', 'secret_rare', true, 90, 99, 95, 80, 75, 'Síndico do Groove'),
('Marisa Monte', 'https://i.imgur.com/JLcK9Zs.jpg', 'Cantora', 'ADULT', 'ultra_rare', true, 70, 95, 65, 85, 95, 'Amor I Love You'),
('Zeca Pagodinho', 'https://i.imgur.com/qR8mKZa.jpg', 'Cantor', 'ADULT', 'rare', true, 85, 80, 70, 95, 60, 'Samba na veia');

-- Categoria: Música (Internacional)
INSERT INTO cards (name, image_url, profession, category, rarity, is_npc, attr_0, attr_1, attr_2, attr_3, attr_4, special_ability) VALUES
('Michael Jackson', 'https://i.imgur.com/ZvL1mKn.jpg', 'Rei do Pop', 'ADULT', 'secret_rare', true, 99, 99, 95, 90, 99, 'Moonwalk Infinito'),
('Freddie Mercury', 'https://i.imgur.com/K8mLqZn.jpg', 'Vocalista Queen', 'ADULT', 'secret_rare', true, 99, 98, 99, 85, 95, 'We Are The Champions'),
('Lady Gaga', 'https://i.imgur.com/RvL1qKn.jpg', 'Cantora/Atriz', 'ADULT', 'ultra_rare', true, 95, 99, 90, 88, 90, 'Born This Way'),
('Ed Sheeran', 'https://i.imgur.com/QvK8mRa.jpg', 'Cantor', 'ADULT', 'rare', true, 80, 75, 60, 90, 95, 'Shape of You'),
('Beyoncé', 'https://i.imgur.com/LvR1qKm.jpg', 'Cantora', 'ADULT', 'secret_rare', true, 95, 99, 88, 92, 95, 'Queen Bee');

-- Categoria: Esportes
INSERT INTO cards (name, image_url, profession, category, rarity, is_npc, attr_0, attr_1, attr_2, attr_3, attr_4, special_ability) VALUES
('Pelé', 'https://i.imgur.com/MvK1qRn.jpg', 'Rei do Futebol', 'ADULT', 'secret_rare', true, 95, 90, 99, 95, 99, 'Gol de Placa'),
('Ronaldinho Gaúcho', 'https://i.imgur.com/NvL8mKa.jpg', 'Jogador', 'ADULT', 'secret_rare', true, 99, 99, 95, 98, 95, 'Pedalada Mágica'),
('Neymar Jr', 'https://i.imgur.com/OvR1qKn.jpg', 'Jogador', 'ADULT', 'ultra_rare', true, 95, 98, 85, 90, 90, 'Rolinho Provocador'),
('Marta', 'https://i.imgur.com/PvK8mRa.jpg', 'Jogadora', 'ADULT', 'secret_rare', true, 95, 85, 90, 88, 99, 'Rainha do Futebol'),
('Ayrton Senna', 'https://i.imgur.com/QvL1qKm.jpg', 'Piloto F1', 'ADULT', 'secret_rare', true, 99, 95, 99, 80, 99, 'Volta Impossível'),
('Guga', 'https://i.imgur.com/RvR8mKn.jpg', 'Tenista', 'ADULT', 'ultra_rare', true, 90, 80, 85, 85, 95, 'Saibro Master'),
('Gabriel Medina', 'https://i.imgur.com/SvK1qRa.jpg', 'Surfista', 'ADULT', 'rare', true, 95, 90, 95, 75, 90, 'Aéreo 360');

-- Categoria: Cinema/TV (Brasil)
INSERT INTO cards (name, image_url, profession, category, rarity, is_npc, attr_0, attr_1, attr_2, attr_3, attr_4, special_ability) VALUES
('Silvio Santos', 'https://i.imgur.com/TvL8mKn.jpg', 'Apresentador', 'ADULT', 'secret_rare', true, 85, 95, 90, 99, 95, 'Quem quer dinheiro?'),
('Renato Aragão', 'https://i.imgur.com/VvK8mRn.jpg', 'Humorista', 'ADULT', 'ultra_rare', true, 95, 85, 80, 95, 75, 'Trapalhada Épica'),
('Fernanda Montenegro', 'https://i.imgur.com/WvL1qKa.jpg', 'Atriz', 'ADULT', 'secret_rare', true, 70, 99, 75, 90, 99, 'Atuação Divina'),
('Wagner Moura', 'https://i.imgur.com/XvR8mKn.jpg', 'Ator', 'ADULT', 'ultra_rare', true, 85, 95, 90, 85, 95, 'Plata o Plomo');

-- Categoria: Cinema (Internacional)
INSERT INTO cards (name, image_url, profession, category, rarity, is_npc, attr_0, attr_1, attr_2, attr_3, attr_4, special_ability) VALUES
('Leonardo DiCaprio', 'https://i.imgur.com/YvK1qRa.jpg', 'Ator', 'ADULT', 'secret_rare', true, 80, 98, 85, 90, 99, 'Oscar Finalmente'),
('Morgan Freeman', 'https://i.imgur.com/ZvL8mKn.jpg', 'Ator/Narrador', 'ADULT', 'secret_rare', true, 65, 95, 70, 95, 99, 'Voz de Deus'),
('Keanu Reeves', 'https://i.imgur.com/AvR1qKa.jpg', 'Ator', 'ADULT', 'ultra_rare', true, 85, 90, 95, 75, 90, 'You Are Breathtaking'),
('Tom Hanks', 'https://i.imgur.com/BvK8mRn.jpg', 'Ator', 'ADULT', 'secret_rare', true, 75, 90, 70, 98, 99, 'Simplesmente Querido'),
('Margot Robbie', 'https://i.imgur.com/CvL1qKa.jpg', 'Atriz', 'ADULT', 'ultra_rare', true, 85, 99, 88, 85, 92, 'Barbie Energy');

-- Categoria: Tecnologia/Games
INSERT INTO cards (name, image_url, profession, category, rarity, is_npc, attr_0, attr_1, attr_2, attr_3, attr_4, special_ability) VALUES
('Elon Musk', 'https://i.imgur.com/DvR8mKn.jpg', 'CEO Tesla/SpaceX', 'ADULT', 'secret_rare', true, 95, 60, 99, 70, 99, 'Tweet Polêmico'),
('Bill Gates', 'https://i.imgur.com/EvK1qRa.jpg', 'Fundador Microsoft', 'ADULT', 'secret_rare', true, 65, 50, 80, 85, 99, 'Blue Screen of Death'),
('Gaules', 'https://i.imgur.com/FvL8mKn.jpg', 'Streamer', 'ADULT', 'ultra_rare', true, 90, 75, 80, 95, 90, 'AEEEEHO'),
('Ninja', 'https://i.imgur.com/GvR1qKa.jpg', 'Streamer', 'ADULT', 'rare', true, 95, 80, 75, 85, 95, 'Victory Royale'),
('Hideo Kojima', 'https://i.imgur.com/HvK8mRn.jpg', 'Game Designer', 'ADULT', 'secret_rare', true, 70, 90, 95, 75, 99, 'Genius Incompreendido');

-- Categoria: Memes/Internet
INSERT INTO cards (name, image_url, profession, category, rarity, is_npc, attr_0, attr_1, attr_2, attr_3, attr_4, special_ability) VALUES
('Nazaré Tedesco', 'https://i.imgur.com/IvL1qKa.jpg', 'Meme Brasileiro', 'ADULT', 'ultra_rare', true, 80, 85, 90, 75, 60, 'Cálculos Confusos'),
('Chapolin Colorado', 'https://i.imgur.com/JvR8mKn.jpg', 'Herói Atrapalhado', 'ADULT', 'rare', true, 70, 80, 85, 90, 50, 'Não contavam com minha astúcia'),
('Mussum', 'https://i.imgur.com/KvK1qRa.jpg', 'Humorista', 'ADULT', 'ultra_rare', true, 90, 95, 85, 98, 60, 'Cacildis'),
('Chico Science', 'https://i.imgur.com/LvL8mKn.jpg', 'Músico', 'ADULT', 'secret_rare', true, 95, 98, 95, 85, 90, 'Manguebeat'),
('Cazuza', 'https://i.imgur.com/MvR1qKa.jpg', 'Cantor', 'ADULT', 'secret_rare', true, 90, 99, 99, 80, 85, 'Exagerado');

-- Categoria: Fictícios/Personagens (ajustados para categorias válidas)
INSERT INTO cards (name, image_url, profession, category, rarity, is_npc, attr_0, attr_1, attr_2, attr_3, attr_4, special_ability) VALUES
('Batman', 'https://i.imgur.com/NvK8mRn.jpg', 'Vigilante', 'ADULT', 'secret_rare', true, 90, 95, 99, 60, 98, 'Eu sou a noite'),
('Homem-Aranha', 'https://i.imgur.com/OvL1qKa.jpg', 'Herói', 'TEEN', 'ultra_rare', true, 95, 85, 90, 90, 85, 'Com grandes poderes...'),
('Darth Vader', 'https://i.imgur.com/PvR8mKn.jpg', 'Lord Sith', 'ADULT', 'secret_rare', true, 85, 95, 95, 40, 95, 'Eu sou seu pai'),
('Sonic', 'https://i.imgur.com/QvK1qRa.jpg', 'Ouriço Veloz', 'KID', 'rare', true, 99, 80, 85, 70, 75, 'Gotta Go Fast'),
('Mario', 'https://i.imgur.com/RvL8mKn.jpg', 'Encanador', 'KID', 'rare', true, 85, 75, 80, 85, 70, 'Its a me, Mario!'),
('Link', 'https://i.imgur.com/SvR1qKa.jpg', 'Herói de Hyrule', 'TEEN', 'ultra_rare', true, 90, 85, 95, 65, 90, 'HYAAAH!'),
('Lara Croft', 'https://i.imgur.com/TvK8mRn.jpg', 'Arqueóloga', 'ADULT', 'ultra_rare', true, 95, 90, 99, 70, 90, 'Tomb Raider');

-- =============================================
-- VERIFICAR TOTAL DE CARTAS
-- =============================================
-- SELECT COUNT(*) as total_npcs FROM cards WHERE is_npc = true;
