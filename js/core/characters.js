/**
 * LumiKids Animated Career Mascots
 * 4 Full Vector Animated Characters: Cô giáo, Bác sĩ, Kĩ sư, Vận động viên
 */

export const CAREER_CHARACTERS = {
  teacher: {
    id: 'teacher',
    name: 'Cô giáo',
    bubble: 'HỌC THÔI! ⭐',
    praise: 'Cô khen bé rất giỏi! 🌟',
    renderSvg: (customClass = '') => `
      <svg class="animated-mascot char-teacher ${customClass}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Educational Sparkles -->
        <g class="char-prop-float">
          <text x="14" y="28" font-size="13">⭐</text>
        </g>
        <!-- Hair Back & Ponytail -->
        <circle cx="68" cy="28" r="7" fill="#FF4B4B" />
        <ellipse cx="76" cy="36" rx="8" ry="14" fill="#4A2810" transform="rotate(25 76 36)" />
        <path d="M26 44 C24 18, 76 18, 74 44 C74 54, 70 60, 68 62 C68 45, 60 28, 50 28 C40 28, 32 45, 32 62 Z" fill="#4A2810"/>
        
        <!-- Character Body & Teacher Outfit -->
        <g class="char-body">
          <path d="M34 64 Q50 61 66 64 L70 90 L30 90 Z" fill="#0D9488" />
          <path d="M43 64 L50 75 L57 64 Z" fill="#FFFFFF" />
          <polygon points="48,74 52,74 51,84 49,84" fill="#E11D48" />
          
          <!-- Animated Pointer Stick Arm -->
          <g class="char-arm-teacher">
            <line x1="64" y1="68" x2="84" y2="44" stroke="#D97706" stroke-width="3" stroke-linecap="round" />
            <polygon points="84,40 86,43 89,44 86,45 84,48 82,45 79,44 82,43" fill="#FBBF24" />
          </g>
        </g>

        <!-- Chibi Head -->
        <g class="char-head">
          <circle cx="50" cy="42" r="22" fill="#FFDFBA" />
          <!-- Hair Bangs -->
          <path d="M28 38 C35 24, 65 24, 72 38 C68 32, 58 30, 50 32 C42 30, 32 32, 28 38 Z" fill="#4A2810" />
          
          <!-- Cheeks Blush -->
          <circle cx="33" cy="48" r="3.5" fill="#FFAAA6" opacity="0.65" />
          <circle cx="67" cy="48" r="3.5" fill="#FFAAA6" opacity="0.65" />
          
          <!-- Glasses -->
          <rect x="34" y="37" width="13" height="10" rx="3" fill="none" stroke="#E11D48" stroke-width="2.4" />
          <rect x="53" y="37" width="13" height="10" rx="3" fill="none" stroke="#E11D48" stroke-width="2.4" />
          <line x1="47" y1="42" x2="53" y2="42" stroke="#E11D48" stroke-width="2.4" />
          
          <!-- Eyes with Natural Blink Animation -->
          <g class="char-eyes">
            <circle cx="40.5" cy="42" r="2.5" fill="#1E293B" class="char-eye" />
            <circle cx="59.5" cy="42" r="2.5" fill="#1E293B" class="char-eye" />
            <circle cx="41.5" cy="41" r="0.9" fill="#FFFFFF" />
            <circle cx="60.5" cy="41" r="0.9" fill="#FFFFFF" />
          </g>

          <!-- Cute Smile -->
          <path d="M46 50 Q50 54 54 50" fill="none" stroke="#A0522D" stroke-width="2" stroke-linecap="round" />
        </g>
      </svg>
    `
  },

  doctor: {
    id: 'doctor',
    name: 'Bác sĩ',
    bubble: 'KHỎE MẠNH! ❤️',
    praise: 'Bác sĩ chúc mừng bé! 🩺',
    renderSvg: (customClass = '') => `
      <svg class="animated-mascot char-doctor ${customClass}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Floating Pulsing Heart -->
        <g class="char-heart-pulse">
          <text x="68" y="28" font-size="14">❤️</text>
        </g>
        
        <!-- Hair Back -->
        <path d="M26 44 C24 18, 76 18, 74 44 C70 30, 58 26, 50 26 C42 26, 30 30, 26 44 Z" fill="#1E293B"/>

        <!-- Character Body & Doctor Lab Coat -->
        <g class="char-body">
          <path d="M34 64 Q50 61 66 64 L70 90 L30 90 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.8" />
          <!-- Cyan Scrub Collar -->
          <path d="M43 64 L50 74 L57 64 Z" fill="#06B6D4" />
          <!-- Stethoscope Tube & Resonator -->
          <path d="M38 66 Q40 80 50 80 Q60 80 62 66" fill="none" stroke="#64748B" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="50" cy="80" r="4.2" fill="#0284C7" class="char-stethoscope-bounce" />
          <circle cx="50" cy="80" r="1.8" fill="#E0F2FE" />
          
          <!-- Friendly Waving Hand -->
          <g class="char-arm-doctor">
            <circle cx="28" cy="74" r="5" fill="#FFDFBA" />
            <circle cx="26" cy="70" r="2.5" fill="#FFDFBA" />
          </g>
        </g>

        <!-- Chibi Head -->
        <g class="char-head">
          <circle cx="50" cy="42" r="22" fill="#FFDFBA" />
          <!-- Doctor Headband Mirror -->
          <path d="M28 32 Q50 28 72 32" fill="none" stroke="#94A3B8" stroke-width="2.8" />
          <circle cx="50" cy="29" r="5.5" fill="#E2E8F0" stroke="#0284C7" stroke-width="1.8"/>
          <circle cx="50" cy="29" r="2.2" fill="#38BDF8" class="char-mirror-glint" />

          <!-- Hair Bangs -->
          <path d="M28 38 C36 28, 64 28, 72 38 C66 32, 58 30, 50 32 C42 30, 34 32, 28 38 Z" fill="#1E293B" />

          <!-- Cheeks Blush -->
          <circle cx="34" cy="48" r="3.5" fill="#FFAAA6" opacity="0.65" />
          <circle cx="66" cy="48" r="3.5" fill="#FFAAA6" opacity="0.65" />

          <!-- Eyes with Natural Blink Animation -->
          <g class="char-eyes">
            <circle cx="41" cy="42" r="2.7" fill="#1E293B" class="char-eye" />
            <circle cx="59" cy="42" r="2.7" fill="#1E293B" class="char-eye" />
            <circle cx="42" cy="41" r="1" fill="#FFFFFF" />
            <circle cx="60" cy="41" r="1" fill="#FFFFFF" />
          </g>

          <!-- Cute Smile -->
          <path d="M45 50 Q50 55 55 50" fill="none" stroke="#A0522D" stroke-width="2.2" stroke-linecap="round" />
        </g>
      </svg>
    `
  },

  engineer: {
    id: 'engineer',
    name: 'Kĩ sư',
    bubble: 'SÁNG TẠO! 🚀',
    praise: 'Kĩ sư nhí cừ khôi! 🏗️',
    renderSvg: (customClass = '') => `
      <svg class="animated-mascot char-engineer ${customClass}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Spinning Gear Floating Prop -->
        <g class="char-gear-spin">
          <text x="12" y="28" font-size="14">⚙️</text>
        </g>

        <!-- Character Body & Overalls with Safety Reflective Vest -->
        <g class="char-body">
          <path d="M34 66 L66 66 L70 90 L30 90 Z" fill="#2563EB" />
          <!-- Orange Safety Vest Straps -->
          <path d="M40 66 L42 90 L46 90 L44 66 Z" fill="#EA580C" />
          <path d="M56 66 L54 90 L50 90 L52 66 Z" fill="#EA580C" />
          <!-- Neon Reflective Stripe -->
          <line x1="32" y1="78" x2="68" y2="78" stroke="#FEF08A" stroke-width="2.8" />

          <!-- Animated Wrench in Hand -->
          <g class="char-arm-engineer">
            <rect x="66" y="60" width="5" height="18" rx="2" fill="#94A3B8" transform="rotate(-35 66 60)" />
            <path d="M75 50 C71 47, 78 41, 83 45 C86 48, 81 54, 77 53" fill="#64748B" />
          </g>
        </g>

        <!-- Chibi Head -->
        <g class="char-head">
          <circle cx="50" cy="44" r="22" fill="#FFDFBA" />
          
          <!-- Yellow Hardhat Safety Helmet -->
          <g class="char-helmet">
            <path d="M26 38 C26 16, 74 16, 74 38 L78 41 L22 41 Z" fill="#F59E0B" />
            <rect x="22" y="38" width="56" height="5" rx="2" fill="#D97706" />
            <circle cx="50" cy="24" r="3.2" fill="#FEF08A" class="char-light-glow" />
          </g>

          <!-- Cute Grease Smudge on Cheek -->
          <ellipse cx="64" cy="51" rx="2.8" ry="1.4" fill="#78716C" opacity="0.45" />

          <!-- Cheeks Blush -->
          <circle cx="34" cy="52" r="3.5" fill="#FFAAA6" opacity="0.65" />

          <!-- Eyes with Natural Blink Animation -->
          <g class="char-eyes">
            <circle cx="41" cy="46" r="2.7" fill="#1E293B" class="char-eye" />
            <circle cx="59" cy="46" r="2.7" fill="#1E293B" class="char-eye" />
            <circle cx="42" cy="45" r="1" fill="#FFFFFF" />
            <circle cx="60" cy="45" r="1" fill="#FFFFFF" />
          </g>

          <!-- Confident Smile -->
          <path d="M45 54 Q50 58 55 54" fill="none" stroke="#A0522D" stroke-width="2.2" stroke-linecap="round" />
        </g>
      </svg>
    `
  },

  athlete: {
    id: 'athlete',
    name: 'Vận động viên',
    bubble: 'TIẾN LÊN! 🏆',
    praise: 'Về đích xuất sắc! 🥇',
    renderSvg: (customClass = '') => `
      <svg class="animated-mascot char-athlete ${customClass}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Floating Energy Lightning Sparkle -->
        <g class="char-sparkle-fast">
          <text x="14" y="28" font-size="14">⚡</text>
        </g>

        <!-- Sporty Spiky Hair Back -->
        <path d="M26 42 C24 18, 76 18, 74 42 Z" fill="#3B1D08" />

        <!-- Athletic Jersey Body -->
        <g class="char-body">
          <path d="M34 64 L66 64 L70 90 L30 90 Z" fill="#DC2626" />
          <!-- White Collar & Number 1 -->
          <polygon points="45,64 50,71 55,64" fill="#FFFFFF" />
          <text x="50" y="82" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle" font-family="'Nunito', sans-serif">1</text>

          <!-- Animated Trophy Arm Pump -->
          <g class="char-arm-athlete">
            <path d="M66 68 Q78 62 76 48" fill="none" stroke="#FFDFBA" stroke-width="5" stroke-linecap="round" />
            <text x="70" y="48" font-size="16" class="char-trophy-gleam">🏆</text>
          </g>
        </g>

        <!-- Chibi Head -->
        <g class="char-head">
          <circle cx="50" cy="42" r="22" fill="#FFDFBA" />
          
          <!-- Red Sweatband on Forehead -->
          <rect x="27" y="28" width="46" height="7" rx="2" fill="#EF4444" />
          <circle cx="50" cy="31.5" r="2.2" fill="#FFFFFF" />

          <!-- Cheeks Blush -->
          <circle cx="34" cy="48" r="3.5" fill="#FFAAA6" opacity="0.65" />
          <circle cx="66" cy="48" r="3.5" fill="#FFAAA6" opacity="0.65" />

          <!-- Energetic Eyes with Natural Blink Animation -->
          <g class="char-eyes">
            <circle cx="41" cy="43" r="2.7" fill="#1E293B" class="char-eye" />
            <circle cx="59" cy="43" r="2.7" fill="#1E293B" class="char-eye" />
            <circle cx="42" cy="42" r="1" fill="#FFFFFF" />
            <circle cx="60" cy="42" r="1" fill="#FFFFFF" />
          </g>

          <!-- Joyful Big Grin -->
          <path d="M44 50 Q50 57 56 50" fill="#FFFFFF" stroke="#A0522D" stroke-width="2.2" stroke-linecap="round" />
        </g>
      </svg>
    `
  }
};

export const CAREER_LIST = Object.values(CAREER_CHARACTERS);

const levelMascotMap = new Map();

/**
 * Returns a randomized career mascot for a given lesson level
 */
export function getLevelMascot(levelId) {
  if (!levelMascotMap.has(levelId)) {
    const randIdx = Math.floor(Math.random() * CAREER_LIST.length);
    levelMascotMap.set(levelId, CAREER_LIST[randIdx]);
  }
  return levelMascotMap.get(levelId);
}
