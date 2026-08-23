import { Mode, Language } from '../types';

export type PromptCategory = 
  | 'Storyteller'
  | 'Marketing Copywriter'
  | 'Image Prompting'
  | 'Sci-Fi & Cyberpunk' 
  | 'Fantasy & Mythical' 
  | 'Cozy & Whimsical' 
  | 'Cinematic & Surreal' 
  | 'Anime & Concept Art' 
  | 'Architecture & Spaces' 
  | 'Narrative & Mystery' 
  | 'Nature & Worldbuilding';

export interface PromptTemplate {
  id: string;
  label: string;
  category: PromptCategory;
  prompt: string;
  mode: Mode;
  icon: string;
  tags: string[];
}

export const CATEGORY_TRANSLATIONS: Record<Language, Record<PromptCategory, string>> = {
  en: {
    'Storyteller': 'Storyteller',
    'Marketing Copywriter': 'Marketing Copywriter',
    'Image Prompting': 'Image Prompting',
    'Sci-Fi & Cyberpunk': 'Sci-Fi & Cyberpunk',
    'Fantasy & Mythical': 'Fantasy & Mythical',
    'Cozy & Whimsical': 'Cozy & Whimsical',
    'Cinematic & Surreal': 'Cinematic & Surreal',
    'Anime & Concept Art': 'Anime & Concept Art',
    'Architecture & Spaces': 'Architecture & Spaces',
    'Narrative & Mystery': 'Narrative & Mystery',
    'Nature & Worldbuilding': 'Nature & Worldbuilding',
  },
  ms: {
    'Storyteller': 'Pencerita & Naratif',
    'Marketing Copywriter': 'Penulis Iklan Pemasaran',
    'Image Prompting': 'Prompt Visual Imej',
    'Sci-Fi & Cyberpunk': 'Sains Fiksyen & Siberpunk',
    'Fantasy & Mythical': 'Fantasi & Mitos',
    'Cozy & Whimsical': 'Selesa & Menawan',
    'Cinematic & Surreal': 'Sinematik & Surealis',
    'Anime & Concept Art': 'Anime & Seni Konsep',
    'Architecture & Spaces': 'Seni Bina & Ruang',
    'Narrative & Mystery': 'Naratif & Misteri',
    'Nature & Worldbuilding': 'Alam Semula Jadi & Dunia',
  }
};

export const translateCategory = (cat: string, lang: Language): string => {
  if (cat in CATEGORY_TRANSLATIONS[lang]) {
    return CATEGORY_TRANSLATIONS[lang][cat as PromptCategory];
  }
  return cat;
};

export const PROMPT_BANK: PromptTemplate[] = [

  // --- Storyteller ---
  {
    id: 'storyteller-fantasy-chronicle',
    label: 'Chronicles of the Broken Relic',
    category: 'Storyteller',
    prompt: 'In a shattered realm where magic is harvested like fossil fuel, a young runaway cartographer unearths an ancient living relic that communicates through visions of forgotten celestial empires.',
    mode: 'story',
    icon: '📖',
    tags: ['Storytelling', 'Fantasy', 'Worldbuilding', 'Adventure']
  },
  {
    id: 'storyteller-noir-detective',
    label: 'The Neon Rain Murders',
    category: 'Storyteller',
    prompt: 'A weary cybernetic detective operating in the lower tiers of a dystopian mega-city accepts an anonymous case involving a synthetic memory that nobody claims to have experienced.',
    mode: 'story',
    icon: '🕵️',
    tags: ['Storytelling', 'Noir', 'Mystery', 'Cyberpunk']
  },
  {
    id: 'storyteller-interstellar-odyssey',
    label: 'Signals from the Void Archive',
    category: 'Storyteller',
    prompt: 'The lone archivist aboard a deep-space interstellar listening beacon intercepts a harmonious acoustic broadcast coming from inside a supposedly dead star.',
    mode: 'story',
    icon: '🚀',
    tags: ['Storytelling', 'Sci-Fi', 'Cosmic', 'Suspense']
  },
  {
    id: 'storyteller-mythic-fable',
    label: 'The Weaver of Autumn Winds',
    category: 'Storyteller',
    prompt: 'A gentle folkloric tale of an elder spirit who weaves the tapestry of seasonal changes, and a mortal child who accidentally unravels a golden thread of endless spring.',
    mode: 'story',
    icon: '🍂',
    tags: ['Storytelling', 'Folklore', 'Cozy', 'Mythical']
  },
  {
    id: 'storyteller-historical-intrigue',
    label: 'The Secret Clockmaker of Prague',
    category: 'Storyteller',
    prompt: 'During the 18th century alchemy resurgence, an apprentice clockmaker discovers their master’s grand astronomical clock is secretly encoding predictions of political revolutions across Europe.',
    mode: 'story',
    icon: '⏳',
    tags: ['Storytelling', 'Historical', 'Mystery', 'Drama']
  },

  // --- Marketing Copywriter ---
  {
    id: 'marketing-saas-launch',
    label: 'High-Converting SaaS Product Pitch',
    category: 'Marketing Copywriter',
    prompt: 'Craft a punchy, high-converting product launch copy for an AI-powered creative collaboration platform. Include an attention-grabbing hook, 3 compelling core benefits with emotional payoff, social proof framing, and an irresistible call-to-action.',
    mode: 'story',
    icon: '💡',
    tags: ['Marketing', 'Copywriting', 'SaaS', 'Launch']
  },
  {
    id: 'marketing-viral-social-hook',
    label: 'Viral Social Media Thought Leadership',
    category: 'Marketing Copywriter',
    prompt: 'Write an engaging, insightful LinkedIn/Twitter thread opener breaking down how modern creatives can 10x their workflow using proactive AI co-creation. Use bold contrarian insights, punchy line breaks, and relatable storytelling.',
    mode: 'story',
    icon: '📱',
    tags: ['Marketing', 'Social Media', 'Growth', 'Hook']
  },
  {
    id: 'marketing-brand-storytelling',
    label: 'Authentic Brand Origin Story',
    category: 'Marketing Copywriter',
    prompt: 'Write an emotive, inspiring brand origin story for an artisanal sustainable lifestyle brand. Focus on the founder\'s moment of epiphany, dedication to natural craftsmanship, and a compelling mission that resonates with conscious consumers.',
    mode: 'story',
    icon: '🌱',
    tags: ['Marketing', 'Brand Story', 'Narrative', 'Ecommerce']
  },
  {
    id: 'marketing-email-newsletter',
    label: 'High-Engagement Creator Newsletter',
    category: 'Marketing Copywriter',
    prompt: 'Compose an engaging weekly creator newsletter issue sharing actionable insights on overcoming creative blocks, featuring a conversational personal anecdote, 3 practical frameworks, and an inspiring quote.',
    mode: 'story',
    icon: '💌',
    tags: ['Marketing', 'Email', 'Newsletter', 'Retention']
  },
  {
    id: 'marketing-luxury-taglines',
    label: 'Luxury Brand Positioning & Taglines',
    category: 'Marketing Copywriter',
    prompt: 'Develop 5 sophisticated brand positioning concepts and evocative taglines for an ultra-premium boutique fragrance house combining botanical heritage with futuristic synthetic biology.',
    mode: 'story',
    icon: '💎',
    tags: ['Marketing', 'Branding', 'Luxury', 'Taglines']
  },

  // --- Image Prompting ---
  {
    id: 'image-prompting-cinematic-portrait',
    label: 'Cinematic 35mm Character Portrait',
    category: 'Image Prompting',
    prompt: 'Masterpiece 35mm cinematic character portrait of an enigmatic visionary astronomer in a vintage brass observatory, soft volumetric golden hour sunbeams, subtle lens dust, Hasselblad aesthetic, ultra-sharp 8k',
    mode: 'image',
    icon: '📸',
    tags: ['Image Prompting', 'Portrait', 'Cinematic', 'Photography']
  },
  {
    id: 'image-prompting-studio-product',
    label: 'Ultra-Minimalist Studio Product Shoot',
    category: 'Image Prompting',
    prompt: 'High-end commercial studio product photography of a sleek matte ceramic perfume bottle resting on raw travertine stone, delicate water ripple reflections, warm diffused studio strobe lighting, hyperrealistic, 8k',
    mode: 'image',
    icon: '🏺',
    tags: ['Image Prompting', 'Product', 'Studio', 'Minimalist']
  },
  {
    id: 'image-prompting-isometric-diorama',
    label: '3D Isometric Floating World Diorama',
    category: 'Image Prompting',
    prompt: 'An intricate 3D isometric floating island diorama of a cozy mountainside ramen shop in autumn, miniature glowing paper lanterns, falling maple leaves, tiny claymation characters, Octane Render style, soft tilt-shift blur',
    mode: 'image',
    icon: '🏮',
    tags: ['Image Prompting', '3D', 'Isometric', 'Diorama']
  },
  {
    id: 'image-prompting-concept-landscape',
    label: 'Epic Sci-Fi Concept Landscape',
    category: 'Image Prompting',
    prompt: 'Breathtaking concept art of a sprawling crystal metropolis nestled inside an extraterrestrial canyon under colossal planetary rings, dramatic scale, volumetric fog, matte painting, ArtStation trending',
    mode: 'image',
    icon: '🪐',
    tags: ['Image Prompting', 'Sci-Fi', 'Concept Art', 'Landscape']
  },
  {
    id: 'image-prompting-surreal-oil',
    label: 'Surrealist Impressionist Masterpiece',
    category: 'Image Prompting',
    prompt: 'A dreamlike surrealist oil painting of a clockwork hummingbird sipping nectar from a glowing star-blossom in a midnight garden, textured impasto brushstrokes, vibrant ultraviolet and gold pigments',
    mode: 'image',
    icon: '🎨',
    tags: ['Image Prompting', 'Artistic', 'Oil Painting', 'Surreal']
  },

  // --- Sci-Fi & Cyberpunk ---
  {
    id: 'cyberpunk-teahouse',
    label: 'Cyberpunk Teahouse',
    category: 'Sci-Fi & Cyberpunk',
    prompt: 'A serene cyberpunk teahouse in a rainy neo-Tokyo alley, neon lights reflecting in puddles, steam rising from ceramic cups, holographic lanterns, cinematic photorealistic, 8k',
    mode: 'image',
    icon: '🍵',
    tags: ['Cyberpunk', 'Neon', 'Rain', 'Atmospheric']
  },
  {
    id: 'orbital-solarium',
    label: 'Orbital Solarium Oasis',
    category: 'Sci-Fi & Cyberpunk',
    prompt: 'A lush botanical greenhouse solarium orbiting Saturn, giant glass dome revealing the rings and deep cosmic stars, automated tending drones, solar flare glow, cinematic lighting',
    mode: 'image',
    icon: '🪐',
    tags: ['Sci-Fi', 'Space', 'Botanical', 'Futuristic']
  },
  {
    id: 'solarpunk-sanctuary',
    label: 'Solarpunk Rooftop City',
    category: 'Sci-Fi & Cyberpunk',
    prompt: 'A vibrant solarpunk metropolis with cascading vertical rooftop gardens, spiraling wind turbines, transparent solar glass bridges, warm golden afternoon sunlight, hopeful utopian architecture',
    mode: 'image',
    icon: '🌱',
    tags: ['Solarpunk', 'Utopian', 'Architecture', 'Eco']
  },
  {
    id: 'android-artisan',
    label: 'Android Clockwork Artisan',
    category: 'Sci-Fi & Cyberpunk',
    prompt: 'An elegant vintage android artisan with porcelain face plates and exposed brass gearwork, meticulously assembling an intricate miniature galaxy inside a pocket watch, macro depth of field',
    mode: 'image',
    icon: '⚙️',
    tags: ['Android', 'Steampunk', 'Craft', 'Intricate']
  },
  {
    id: 'deep-space-mining',
    label: 'Asteroid Station Nebula',
    category: 'Sci-Fi & Cyberpunk',
    prompt: 'An industrial deep-space mining platform anchored inside a hollow crystalline asteroid, dazzling purple and cyan nebula reflections, heavy freight vessels docking with plasma thrusters',
    mode: 'image',
    icon: '🚀',
    tags: ['Sci-Fi', 'Space', 'Industrial', 'Nebula']
  },
  {
    id: 'cybernetic-geisha',
    label: 'Neo-Tokyo Cyber Geisha',
    category: 'Sci-Fi & Cyberpunk',
    prompt: 'A close-up cinematic portrait of an android geisha with iridescent ceramic skin, luminescent fiber-optic hair ornaments, traditional embroidered silk kimono with glowing circuitry, atmospheric fog',
    mode: 'image',
    icon: '👘',
    tags: ['Cyberpunk', 'Portrait', 'Lighting', 'Cinematic']
  },
  {
    id: 'cosmic-lighthouse-story',
    label: 'Cosmic Lighthouse Signal',
    category: 'Sci-Fi & Cyberpunk',
    prompt: 'The lone keeper of an ancient lighthouse on a barren planet at the edge of the galaxy detects a strange, rhythmic light signal coming from the depths of an uncharted cosmic rift.',
    mode: 'story',
    icon: '🌌',
    tags: ['Sci-Fi', 'Space', 'Mystery', 'Lighthouse']
  },
  {
    id: 'neon-detective-story',
    label: 'City of Shadowed Lies',
    category: 'Sci-Fi & Cyberpunk',
    prompt: 'In a neon-drenched metropolis where speaking an untruth causes physical chromatic shadows to bleed onto the speaker\'s skin, a cynical detective investigates a murder where no shadows were cast.',
    mode: 'story',
    icon: '🕵️',
    tags: ['Noir', 'Cyberpunk', 'Mystery', 'Detective']
  },
  {
    id: 'ai-archaeologist-story',
    label: 'The Analog Excavation',
    category: 'Sci-Fi & Cyberpunk',
    prompt: 'Two thousand years after humanity migrated fully into digital consciousness, a rogue research AI discovers a sealed underground bunker containing the world\'s last physical vinyl record and a turntable.',
    mode: 'story',
    icon: '💾',
    tags: ['Sci-Fi', 'AI', 'Archaeology', 'Music']
  },

  // --- Fantasy & Mythical ---
  {
    id: 'enchanted-greenhouse',
    label: 'Enchanted Crystalline Flora',
    category: 'Fantasy & Mythical',
    prompt: 'An overgrown Victorian glass greenhouse filled with glowing crystalline flora and luminescent spores, gentle morning mist filtering through ivy-covered panes, hyper-detailed fantasy landscape',
    mode: 'image',
    icon: '🌿',
    tags: ['Fantasy', 'Greenhouse', 'Glow', 'Ethereal']
  },
  {
    id: 'floating-alchemist-library',
    label: 'Floating Alchemist Library',
    category: 'Fantasy & Mythical',
    prompt: 'A majestic floating island library with spiraling ivory towers, books hovering and migrating like flocks of golden birds, waterfalls spilling into cloudbanks below, sunbeam raytraced lighting',
    mode: 'image',
    icon: '📚',
    tags: ['Fantasy', 'Library', 'Floating Island', 'Magic']
  },
  {
    id: 'celestial-dragon',
    label: 'Celestial Moon Dragon',
    category: 'Fantasy & Mythical',
    prompt: 'A serpentine celestial dragon composed of shimmering star-matter and aurora ribbons, resting atop a sacred snow-capped mountain peak beneath a giant glowing crescent moon',
    mode: 'image',
    icon: '🐉',
    tags: ['Mythology', 'Dragon', 'Aurora', 'Celestial']
  },
  {
    id: 'sunken-atlantis-temple',
    label: 'Sunken Atlantis Cathedral',
    category: 'Fantasy & Mythical',
    prompt: 'A breathtaking underwater cathedral made of bioluminescent mother-of-pearl and turquoise marble, schools of glowing sea manta rays gliding through towering gothic arches',
    mode: 'image',
    icon: '🏛️',
    tags: ['Underwater', 'Cathedral', 'Bioluminescence', 'Mythical']
  },
  {
    id: 'phoenix-volcanic-nest',
    label: 'Golden Phoenix of the Crater',
    category: 'Fantasy & Mythical',
    prompt: 'A magnificent golden phoenix with trailing solar embers and plumage made of liquid flame, perched above an obsidian caldera surrounded by sparkling obsidian crystals',
    mode: 'image',
    icon: '🔥',
    tags: ['Phoenix', 'Fantasy', 'Flame', 'Mythical']
  },
  {
    id: 'bird-song-scroll',
    label: 'Bird-Song Alchemy Scroll',
    category: 'Fantasy & Mythical',
    prompt: 'An old scholar studying in a dusty archive discovers an ancient scroll that contains the precise, lyrical recipe for a potion allowing humans to understand the conversations and melodies of birds.',
    mode: 'story',
    icon: '📜',
    tags: ['Fantasy', 'Scholar', 'Alchemy', 'Magic']
  },
  {
    id: 'star-weaver-story',
    label: 'The Loom of Orion',
    category: 'Fantasy & Mythical',
    prompt: 'High in the northern peaks, a silent guild of star-weavers tends to celestial silk looms, repairing tears in the night sky before daylight breaks and mortal realms notice the missing constellations.',
    mode: 'story',
    icon: '✨',
    tags: ['Mythology', 'Stars', 'Poetic', 'Fantasy']
  },
  {
    id: 'clockwork-monarch-story',
    label: 'The Mechanical Heart',
    category: 'Fantasy & Mythical',
    prompt: 'A gifted kingdom clockmaker is secretly commissioned by the dying monarch to forge a spring-wound heart that can feel every human virtue—except grief.',
    mode: 'story',
    icon: '👑',
    tags: ['Fantasy', 'Steampunk', 'Royal', 'Emotion']
  },

  // --- Cozy & Whimsical ---
  {
    id: 'aviator-retriever',
    label: 'Aviator Golden Retriever',
    category: 'Cozy & Whimsical',
    prompt: 'A majestic golden retriever wearing leather pilot goggles and a wool scarf, sitting in the open cockpit of a vintage yellow biplane flying through fluffy sunlit clouds, whimsical oil painting style',
    mode: 'image',
    icon: '🐶',
    tags: ['Animals', 'Cozy', 'Vintage', 'Painting']
  },
  {
    id: 'galaxy-bottle',
    label: 'Galaxy in a Bottle',
    category: 'Cozy & Whimsical',
    prompt: 'A whimsical hand-blown glass bottle floating in a calm starry ocean, containing a swirling, glowing spiral galaxy and nebula dust, surrealism, vibrant celestial purple and teal colors',
    mode: 'image',
    icon: '🔮',
    tags: ['Surreal', 'Galaxy', 'Whimsical', 'Glowing']
  },
  {
    id: 'mushroom-cottage',
    label: 'Rainy Mushroom Cottage',
    category: 'Cozy & Whimsical',
    prompt: 'A charming tiny fairytale cottage nestled under a giant glowing red mushroom cap, warm lantern light glowing from round windows, gentle autumn rain shower, mossy cobblestone path',
    mode: 'image',
    icon: '🍄',
    tags: ['Fairytale', 'Cozy', 'Rain', 'Cottage']
  },
  {
    id: 'train-car-cat-cafe',
    label: 'Orient Express Cat Haven',
    category: 'Cozy & Whimsical',
    prompt: 'A warm and inviting vintage dining train car converted into a cozy cafe, calico cats dozing on velvet armchairs, steam rising from pastry baskets, snowy mountain forest outside window',
    mode: 'image',
    icon: '🐱',
    tags: ['Cats', 'Cozy', 'Cafe', 'Winter']
  },
  {
    id: 'fox-apothecary',
    label: 'The Red Fox Herbalist',
    category: 'Cozy & Whimsical',
    prompt: 'An intelligent red fox wearing small round spectacles and a linen apron, grinding dried chamomile and lavender in a stone mortar inside a cozy hollow-oak tree apothecary, warm firelight',
    mode: 'image',
    icon: '🦊',
    tags: ['Animals', 'Apothecary', 'Cozy', 'Herbal']
  },
  {
    id: 'hedgehog-boat',
    label: 'Hedgehog Teacup Mariner',
    category: 'Cozy & Whimsical',
    prompt: 'A tiny cute hedgehog sailing down a sunlit creek inside a porcelain floral teacup, using a maple leaf as a sail and a wooden spoon as an oar, macro photography, warm sunlight',
    mode: 'image',
    icon: '🦔',
    tags: ['Animals', 'Cute', 'Macro', 'Whimsical']
  },
  {
    id: 'lost-time-shop',
    label: 'The Lost Time Emporium',
    category: 'Cozy & Whimsical',
    prompt: 'A mysterious antique clock shop tucked away in a cobblestone lane where the shopkeeper doesn\'t sell timepieces, but instead sells bottles of forgotten and lost hours to nostalgic customers.',
    mode: 'story',
    icon: '⏳',
    tags: ['Cozy', 'Time', 'Nostalgia', 'Whimsical']
  },
  {
    id: 'woodland-baker-story',
    label: 'Midnight Forest Bakery',
    category: 'Cozy & Whimsical',
    prompt: 'Deep within the Whispering Woods, a baker opens shop only when the third owl calls, baking pastries flavored with forgotten childhood laughter and sweet autumn dreams for woodland travelers.',
    mode: 'story',
    icon: '🥐',
    tags: ['Cozy', 'Bakery', 'Forest', 'Fable']
  },
  {
    id: 'cloud-shepherd-story',
    label: 'The Cloud Shepherd',
    category: 'Cozy & Whimsical',
    prompt: 'An elderly shepherd living atop Mount Cumulus tends a flock of playful sentient storm clouds, teaching young thunderheads how to rain gently over farmers\' fields instead of causing squalls.',
    mode: 'story',
    icon: '☁️',
    tags: ['Cozy', 'Clouds', 'Shepherd', 'Fable']
  },

  // --- Anime & Concept Art ---
  {
    id: 'ghibli-bathhouse-lake',
    label: 'Spirits Bathhouse by the Lake',
    category: 'Anime & Concept Art',
    prompt: 'A magnificent ornate Japanese bathhouse on stilts over a tranquil misty lake at sunset, glowing red paper lanterns, wooden footbridge, cherry blossom petals drifting across water, Studio Ghibli anime aesthetic',
    mode: 'image',
    icon: '🏮',
    tags: ['Anime', 'Ghibli', 'Atmospheric', 'Japanese']
  },
  {
    id: 'ancient-forest-guardian',
    label: 'Moss Golem Guardian',
    category: 'Anime & Concept Art',
    prompt: 'A colossal stone and moss guardian golem sitting peacefully in an ancient enchanted forest, tiny glowing spirit birds nesting in its stone hand, sunbeams piercing through emerald canopy, anime background art',
    mode: 'image',
    icon: '🗿',
    tags: ['Anime', 'Golem', 'Forest', 'Concept Art']
  },
  {
    id: 'floating-market-bazaar',
    label: 'Flying Skyship Bazaar',
    category: 'Anime & Concept Art',
    prompt: 'A bustling floating market held on wooden airships tethered between towering stone pillars in the sky, colorful vendor canopies, wind chimes, airship gliders soaring in the distance, anime landscape',
    mode: 'image',
    icon: '🎈',
    tags: ['Anime', 'Steampunk', 'Airship', 'Sky']
  },
  {
    id: 'rooftop-stargazing',
    label: 'Tokyo Rooftop Stargazing',
    category: 'Anime & Concept Art',
    prompt: 'Two friends sitting on the edge of a Tokyo apartment rooftop under a breathtaking twilight sky with the Milky Way visible above city skylines, train passing on elevated tracks, Makoto Shinkai aesthetic',
    mode: 'image',
    icon: '🌠',
    tags: ['Anime', 'Twilight', 'Tokyo', 'Emotional']
  },

  // --- Architecture & Spaces ---
  {
    id: 'brutalist-cliffside-villa',
    label: 'Brutalist Cliffside Villa',
    category: 'Architecture & Spaces',
    prompt: 'A minimalist raw concrete architectural villa cantilevered over dramatic crashing ocean cliffs at golden hour sunset, infinity pool reflecting the sky, floor-to-ceiling glass, architectural photography',
    mode: 'image',
    icon: '🏠',
    tags: ['Architecture', 'Brutalism', 'Ocean', 'Sunset']
  },
  {
    id: 'bamboo-onsen-pavilion',
    label: 'Kyoto Bamboo Onsen Pavilion',
    category: 'Architecture & Spaces',
    prompt: 'A serene natural hot spring stone bath surrounded by a dense green bamboo grove, steaming thermal water, minimalist cedar wood platform, soft warm lanterns, Japanese Zen architecture',
    mode: 'image',
    icon: '🎋',
    tags: ['Architecture', 'Zen', 'Japan', 'Onsen']
  },
  {
    id: 'gothic-cathedral-storm',
    label: 'Obsidian Cathedral in Storm',
    category: 'Architecture & Spaces',
    prompt: 'An imposing gothic cathedral carved from pitch-black obsidian stone on a jagged coastal cliff, illuminated by dramatic purple lightning strikes in a turbulent storm sky, epic moody atmosphere',
    mode: 'image',
    icon: '⚡',
    tags: ['Architecture', 'Gothic', 'Storm', 'Dark Fantasy']
  },

  // --- Cinematic & Surreal ---
  {
    id: 'cloud-ocean-whale',
    label: 'Bioluminescent Sky Whale',
    category: 'Cinematic & Surreal',
    prompt: 'A colossal bioluminescent whale swimming through a sea of sunset cumulus clouds, trails of stardust floating in its wake, miniature airships cruising alongside, epic cinematic wide-angle',
    mode: 'image',
    icon: '🐋',
    tags: ['Surreal', 'Clouds', 'Whale', 'Cinematic']
  },
  {
    id: 'desert-mirrors',
    label: 'Desert of Endless Mirrors',
    category: 'Cinematic & Surreal',
    prompt: 'A surreal golden sand desert scattered with towering, floating reflective geometric mirrors reflecting alternate twilight worlds and distant purple constellations, Salvador Dali aesthetic',
    mode: 'image',
    icon: '🪞',
    tags: ['Surreal', 'Desert', 'Reflections', 'Dreamscape']
  },
  {
    id: 'nebula-flower-bloom',
    label: 'Blooming Nebula Flora',
    category: 'Cinematic & Surreal',
    prompt: 'A hyper-detailed macro photograph of a lotus flower whose petals are swirling cosmic galaxies and stardust filaments, glowing ultraviolet and gold pollen floating into deep space',
    mode: 'image',
    icon: '🌸',
    tags: ['Macro', 'Cosmic', 'Floral', 'Hyperdetailed']
  },
  {
    id: 'chessboard-island',
    label: 'Surrealist Chess Ocean',
    category: 'Cinematic & Surreal',
    prompt: 'An infinite chessboard marble ocean at twilight with giant alabaster and obsidian chess pieces rising out of the water, a crescent moon dripping liquid light, surrealist art',
    mode: 'image',
    icon: '♟️',
    tags: ['Surrealism', 'Chess', 'Twilight', 'Dali']
  },

  // --- Narrative & Mystery ---
  {
    id: 'memory-cartographer',
    label: 'The Memory Cartographer',
    category: 'Narrative & Mystery',
    prompt: 'In a world where memories can be physically explored like landscapes, an apprentice cartographer is tasked with mapping a dying elder\'s most precious and elusive childhood recollection before it fades forever.',
    mode: 'story',
    icon: '🗺️',
    tags: ['Memory', 'Emotional', 'Adventure', 'Mystery']
  },
  {
    id: 'ghost-express-story',
    label: 'The Midnight Ghost Express',
    category: 'Narrative & Mystery',
    prompt: 'A remote railroad switchman discovers a phantom train that runs every leap year on rails that were dismantled forty years ago, carrying passengers looking to settle unfinished business.',
    mode: 'story',
    icon: '🚂',
    tags: ['Mystery', 'Supernatural', 'Train', 'Folklore']
  },
  {
    id: 'dream-auctioneer-story',
    label: 'The Subconscious Auctioneer',
    category: 'Narrative & Mystery',
    prompt: 'In an underground speakeasy accessible only during lucid sleep, an enigmatic broker auctions off rare recurring dreams, forgotten musical melodies, and secondhand inspiration to struggling artists.',
    mode: 'story',
    icon: '🎭',
    tags: ['Dreams', 'Mystery', 'Surreal', 'Art']
  },
  {
    id: 'architect-of-destiny-story',
    label: 'The City Draftsman',
    category: 'Narrative & Mystery',
    prompt: 'A municipal cartographer in 19th-century Prague realizes that every new street, fountain, or alleyway he draws on the official city blueprint spontaneously manifests in reality overnight.',
    mode: 'story',
    icon: '📐',
    tags: ['Mystery', 'Magic Realism', 'History', 'City']
  },

  // --- Nature & Worldbuilding ---
  {
    id: 'whispering-tree-story',
    label: 'The Tree of Stolen Secrets',
    category: 'Nature & Worldbuilding',
    prompt: 'An isolated botanist discovers a rare elder willow whose leaves whisper secrets muttered by people hundreds of miles away—until one morning, the tree whispers the botanist\'s own true origin.',
    mode: 'story',
    icon: '🌳',
    tags: ['Nature', 'Mystery', 'Secrets', 'Worldbuilding']
  },
  {
    id: 'underwater-postman-story',
    label: 'The Abyssal Mail Courier',
    category: 'Nature & Worldbuilding',
    prompt: 'Equipped with a pressurized diving suit and an enchanted waterproof satchel, the world\'s last deep-sea postman delivers heartfelt letters between surface dwellers and the reclusive trench civilizations.',
    mode: 'story',
    icon: '✉️',
    tags: ['Ocean', 'Adventure', 'Letters', 'Worldbuilding']
  },
  {
    id: 'glacier-archive-story',
    label: 'The Voice in the Permafrost',
    category: 'Nature & Worldbuilding',
    prompt: 'An Arctic glaciologist discovers ancient ice core samples that trap prehistoric sound waves, and begins reconstructing the long-lost lullabies sung by human ancestors fifty thousand years ago.',
    mode: 'story',
    icon: '🧊',
    tags: ['Arctic', 'History', 'Discovery', 'Worldbuilding']
  },
  {
    id: 'terrarium-storm-image',
    label: 'Pocket Tempest Terrarium',
    category: 'Cinematic & Surreal',
    prompt: 'Macro studio photography of a delicate glass bell jar terrarium containing a swirling miniature thundercloud with crackling violet lightning, mossy base with tiny raindrops, dramatic chiaroscuro lighting, 8k',
    mode: 'image',
    icon: '⚡',
    tags: ['Macro', 'Surreal', 'Lighting', 'Studio']
  },
  {
    id: 'obsidian-samurai-image',
    label: 'Obsidian Spirit Samurai',
    category: 'Anime & Concept Art',
    prompt: 'Full body concept art of an ancient samurai in gleaming black obsidian armor with gold kintsugi cracks, glowing azure spirit wisps floating around the katana blade, misty bamboo grove at midnight, cinematic atmosphere',
    mode: 'image',
    icon: '⚔️',
    tags: ['Samurai', 'Armor', 'Concept Art', 'Japanese']
  },
  {
    id: 'floating-cloud-cafe-image',
    label: 'Aero Cloud Coffeehouse',
    category: 'Architecture & Spaces',
    prompt: 'An enchanting floating Victorian cafe perched atop fluffy cumulus clouds, brass airship docking mooring posts, warm copper espresso bar, panoramic floor-to-ceiling glass windows, radiant morning sunrise glow',
    mode: 'image',
    icon: '☕',
    tags: ['Architecture', 'Steampunk', 'Clouds', 'Cozy']
  },
  {
    id: 'fibonacci-library-image',
    label: 'Infinite Fibonacci Library',
    category: 'Architecture & Spaces',
    prompt: 'A breathtaking labyrinthine library where dark mahogany bookshelves curve upwards in infinite golden ratio Fibonacci spirals toward an open ceiling of deep stellar galaxies and nebulae, warm candlelight illumination',
    mode: 'image',
    icon: '📚',
    tags: ['Library', 'Surreal', 'Architecture', 'Spirals']
  },
  {
    id: 'clockwork-dragon-image',
    label: 'Clocktower Gilded Dragon',
    category: 'Fantasy & Mythical',
    prompt: 'An intricate clockwork dragon forged from tarnished brass and silver filigree curled asleep inside an abandoned cathedral bell tower, purple wisteria vines draping over gears, soft dusty sunbeams',
    mode: 'image',
    icon: '🐉',
    tags: ['Dragon', 'Steampunk', 'Fantasy', 'Intricate']
  },
  {
    id: 'desert-manta-caravan-image',
    label: 'Emerald Dune Manta Caravan',
    category: 'Cinematic & Surreal',
    prompt: 'A cinematic wide landscape of silk-draped nomadic merchants leading enormous glowing bioluminescent manta rays swimming gracefully through undulating jade sand dunes under twin moons',
    mode: 'image',
    icon: '🌙',
    tags: ['Cinematic', 'Surreal', 'Desert', 'Bioluminescent']
  },
  {
    id: 'midnight-cartographer-story',
    label: 'The Intercalary Islands',
    category: 'Narrative & Mystery',
    prompt: 'A solitary cartographer maps archipelago islands that only exist physically during the fraction of a second between the ticks of a grandfather clock, uncovering an uncharted civilization trapped inside the pauses of time.',
    mode: 'story',
    icon: '🧭',
    tags: ['Time', 'Mystery', 'Cartography', 'Adventure']
  },
  {
    id: 'culinary-memories-story',
    label: 'The Memory Gastronomist',
    category: 'Narrative & Mystery',
    prompt: 'A chef in an unmarked alleyway bistro crafts dishes infused with the lost memories of strangers. When a grief-stricken stranger arrives asking to taste the laughter of his lost childhood, the recipe requires a dangerous spice.',
    mode: 'story',
    icon: '🍲',
    tags: ['Culinary', 'Emotion', 'Magic Realism', 'Memory']
  },
  {
    id: 'celestial-florist-story',
    label: 'The Constellation Florist',
    category: 'Nature & Worldbuilding',
    prompt: 'In a mountain observatory garden, a quiet botanist cultivates night-blooming orchids that emit faint radio frequencies and miniature constellations, predicting celestial collisions decades before astronomers detect them.',
    mode: 'story',
    icon: '🌸',
    tags: ['Stars', 'Botanical', 'Astronomy', 'Worldbuilding']
  }
];

const MALAY_OVERRIDES: Record<string, { label?: string; prompt?: string }> = {
  'storyteller-fantasy-chronicle': {
    label: 'Kronikel Relik Terkubur',
    prompt: 'Di alam di mana kuasa magis dituai seperti bahan api fosil, seorang pembuat peta muda menemui relik bernyawa purba yang berkomunikasi melalui visi empayar cakerawala yang telah lama dilupakan.'
  },
  'storyteller-noir-detective': {
    label: 'Pembunuhan Hujan Neon',
    prompt: 'Seorang detektif sibernetik di tingkat bawah metropolis distopia menerima kes tanpa nama berkenaan memori sintetik yang tiada siapa mengaku pernah mengalaminya.'
  },
  'storyteller-interstellar-odyssey': {
    label: 'Isyarat Arkib Lompang',
    prompt: 'Penjaga arkib tunggal di stesen pemancar jauh antara bintang memintas siaran akustik harmoni yang terpancar keluar dari dalam sebuah bintang yang disangka telah mati.'
  },
  'marketing-saas-launch': {
    label: 'Pitch Pelancaran Produk SaaS Berimpak',
    prompt: 'Hasilkan salinan iklan pelancaran produk yang memukau bagi platform kolaborasi kreatif AI. Sertakan tajuk utama yang menarik, 3 faedah utama beremosi, bukti sosial, dan seruan bertindak (CTA) yang berkesan.'
  },
  'marketing-viral-social-hook': {
    label: 'Pembuka Hantaran Media Sosial Viral',
    prompt: 'Tulis pembuka bebenang LinkedIn/Twitter yang padat dan menarik mengenai bagaimana pencipta moden boleh menggandakan produktiviti 10x menggunakan penciptaan bersama AI secara proaktif.'
  },
  'marketing-brand-storytelling': {
    label: 'Kisah Asal Usul Jenama Berjiwa',
    prompt: 'Tulis kisah asal usul jenama yang menyentuh hati dan memberi inspirasi untuk jenama gaya hidup lestari artisan, menekankan dedikasi kepada kraf semula jadi dan misi bermakna.'
  },
  'image-prompting-cinematic-portrait': {
    label: 'Potret Sinematik 35mm Watak',
    prompt: 'Potret watak sinematik 35mm ahli astronomi berwawasan di balai cerap tembaga antik, pancaran matahari petang lembut, habuk lensa halus, estetika kamera Hasselblad, 8k'
  },
  'image-prompting-studio-product': {
    label: 'Fotografi Studio Produk Minimalis',
    prompt: 'Fotografi studio komersial mewah bagi botol minyak wangi seramik matte di atas batu travertine, pantulan riak air halus, pencahayaan studio lembut, fotorealistik 8k'
  },
  'image-prompting-isometric-diorama': {
    label: 'Diorama Isometrik 3D Pulau Terapung',
    prompt: 'Diorama isometrik 3D pulau terapung dengan kedai ramen musim luruh di lereng gunung, tanglung kertas bercahaya, daun mapel berguguran, gaya Octane Render, kabur tilt-shift'
  },
  'cyberpunk-teahouse': {
    label: 'Kedai Teh Siberpunk',
    prompt: 'Sebuah kedai teh siberpunk yang damai di lorong neo-Tokyo sewaktu hujan lebat, pantulan lampu neon pada lopak air, wap naik dari cawan seramik, tanglung holografik, fotografi sinematik 8k'
  },
  'orbital-solarium': {
    label: 'Oasis Rumah Kaca Orbit Saturn',
    prompt: 'Rumah kaca botani subur yang mengorbit planet Zuhal, kubah kaca gergasi menampakkan cincin planet dan bintang kosmik yang memukau, dron penjaga automatik, pencahayaan sinematik'
  },
  'solarpunk-sanctuary': {
    label: 'Bandar Bumbung Solarpunk',
    prompt: 'Metropolis solarpunk bertenaga dengan taman bumbung bertingkat, turbin angin berpilin, jambatan kaca suria lutsinar, cahaya petang keemasan yang hangat, seni bina utopia'
  },
  'android-artisan': {
    label: 'Tukang Jam Android Antik',
    prompt: 'Tukang android antik yang anggun dengan wajah porselin dan gear tembaga, memasang galaksi miniatur yang rumit di dalam jam poket secara teliti, kedalaman fokus makro'
  },
  'cosmic-lighthouse-story': {
    label: 'Isyarat Rumah Api Kosmik',
    prompt: 'Penjaga tunggal sebuah rumah api purba di planet tandus di hujung galaksi mengesan isyarat cahaya beritma ganjil dari jurang kosmik yang belum diterokai.'
  },
  'neon-detective-story': {
    label: 'Bandar Bayangan Dusta',
    prompt: 'Di metropolis neon di mana setiap penipuan menyebabkan bayang kromatik berdarah pada kulit si penutur, seorang detektif menyiasat kes pembunuhan misteri tanpa sebarang bayang.'
  },
  'midnight-cartographer-story': {
    label: 'Kepulauan Waktu Terhenti',
    prompt: 'Seorang pembuat peta memetakan gugusan pulau yang hanya wujud secara fizikal dalam detik sesaat di antara detikan jam dinding purba, membongkar tamadun yang terperangkap dalam jeda masa.'
  },
  'culinary-memories-story': {
    label: 'Tukang Masak Memori',
    prompt: 'Seorang tukang masak di bistro lorong tersembunyi menghasilkan hidangan yang diselitkan memori silam pelanggan. Apabila seorang pelanggan meminta merasai semula tawa zaman kanak-kanaknya, resipi itu memerlukan rempah misteri.'
  }
};

export const getPromptBank = (language: Language = 'en'): PromptTemplate[] => {
  if (language === 'en') return PROMPT_BANK;

  return PROMPT_BANK.map(template => {
    const override = MALAY_OVERRIDES[template.id];
    return {
      ...template,
      label: override?.label || template.label,
      prompt: override?.prompt || template.prompt,
    };
  });
};

