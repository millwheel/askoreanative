export const CATEGORIES = [
  { value: 'TRANSPORT', label: '🚗 Transport', description: 'Public transport, driving, taxis' },
  { value: 'FOOD', label: '🍜 Food', description: 'Restaurants, food culture, dining' },
  { value: 'ACCOMMODATION', label: '🏨 Accommodation', description: 'Hotels, hostels, airbnb, housing' },
  { value: 'CULTURE', label: '🎭 Culture', description: 'Traditions, customs, etiquette' },
  { value: 'ACTIVITIES', label: '🎪 Activities', description: 'Things to do, attractions, tours' },
  { value: 'VISA_DOCUMENTS', label: '📄 Visa/Documents', description: 'Visa, permits, immigration' },
  { value: 'SAFETY', label: '🛡️ Safety', description: 'Safety, health, emergencies' },
] as const;

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((cat) => [cat.value, cat.label])
);

export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
