export const PRODUCT_COLORS: Record<string, { hex: string; label: string }> = {
  BLACK: { hex: '#000000', label: 'Black' },
  WHITE: { hex: '#FFFFFF', label: 'White' },
  GRAY: { hex: '#808080', label: 'Gray' },
  BEIGE: { hex: '#F5F5DC', label: 'Beige' },
  BROWN: { hex: '#733E0A', label: 'Brown' },
  NAVY: { hex: '#000080', label: 'Navy' },
  BLUE: { hex: '#3B82F6', label: 'Blue' }, // Tailwind blue-500
  GREEN: { hex: '#10B981', label: 'Green' }, // Tailwind emerald-500
  RED: { hex: '#EF4444', label: 'Red' },
  ORANGE: { hex: '#F97316', label: 'Orange' }, // Tailwind orange-500
  YELLOW: { hex: '#FACC15', label: 'Yellow' }, // Tailwind yellow-400
  PINK: { hex: '#EC4899', label: 'Pink' }, // Tailwind pink-500
  PURPLE: { hex: '#A855F7', label: 'Purple' }, // Tailwind purple-500
  MULTICOLOR: {
    hex: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
    label: 'Multicolor',
  },
};
