export type ResolvedMode = 'light' | 'dark';

export interface Palette {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  line: string;
  accentText: string;
  accentBg: string;
  onAccent: string;
  pressed: string;
  overlay: string;
  chipOn: string;
  chipOff: string;
  borderAccent: string;
  iconMuted: string;
}

/** classes Tailwind estáticas por modo — sem depender do dark: automático */
export function palette(mode: ResolvedMode): Palette {
  if (mode === 'dark') {
    return {
      bg: 'bg-[#0e0d0b]',
      card: 'bg-[#171512]',
      text: 'text-[#ece5d8]',
      muted: 'text-[#98907f]',
      border: 'border-[#2a261f]',
      line: 'border-[#2a261f]',
      accentText: 'text-[#d6b06e]',
      accentBg: 'bg-[#d6b06e]',
      onAccent: 'text-[#17130a]',
      pressed: 'bg-white/10',
      overlay: 'bg-black/60',
      chipOn: 'border-[#d6b06e] bg-[#d6b06e]/15 text-[#d6b06e]',
      chipOff: 'border-[#2a261f] bg-transparent text-[#98907f]',
      borderAccent: 'border-[#d6b06e]',
      iconMuted: '#98907f',
    };
  }
  return {
    bg: 'bg-[#faf7f2]',
    card: 'bg-white',
    text: 'text-[#1b1916]',
    muted: 'text-[#6f675a]',
    border: 'border-[#e7e0d4]',
    line: 'border-[#e7e0d4]',
    accentText: 'text-[#926a2d]',
    accentBg: 'bg-[#926a2d]',
    onAccent: 'text-white',
    pressed: 'bg-black/5',
    overlay: 'bg-black/50',
    chipOn: 'border-[#926a2d] bg-[#926a2d]/10 text-[#926a2d]',
    chipOff: 'border-[#e7e0d4] bg-transparent text-[#6f675a]',
    borderAccent: 'border-[#926a2d]',
    iconMuted: '#6f675a',
  };
}
