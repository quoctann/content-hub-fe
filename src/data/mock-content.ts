/**
 * Mock Content Data
 * 
 * This file contains mock data for development and testing.
 * In production, this would be replaced with actual API calls.
 */

import type { ContentItem } from '@/types/content';

export const mockContentItems: ContentItem[] = [
  {
    id: '1',
    type: 'text',
    title: 'Welcome to Content Hub',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nostra purus rutrum leo ad dapibus. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    tags: [
      { id: 't1', name: 'welcome' },
      { id: 't2', name: 'intro' },
    ],
    category: 'general',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    type: 'text',
    title: 'Getting Started Guide',
    content: 'This is your comprehensive guide to using the Content Hub. You can search for content using keywords, tags (#fun), and type filters (@text or @image). Copy any content to your clipboard with a single click!',
    tags: [
      { id: 't3', name: 'guide' },
      { id: 't4', name: 'tutorial' },
    ],
    category: 'documentation',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: '3',
    type: 'image',
    title: 'Beautiful Sunset',
    content: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800',
    tags: [
      { id: 't5', name: 'nature' },
      { id: 't6', name: 'beauty' },
    ],
    category: 'photography',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '4',
    type: 'text',
    title: 'Tips for Productivity',
    content: 'Stay focused on one task at a time. Use the Pomodoro technique for better time management. Take regular breaks to maintain your energy levels throughout the day. Remember to hydrate and stretch!',
    tags: [
      { id: 't7', name: 'productivity' },
      { id: 't8', name: 'tips' },
    ],
    category: 'lifestyle',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '5',
    type: 'image',
    title: 'Mountain Adventure',
    content: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    tags: [
      { id: 't9', name: 'adventure' },
      { id: 't10', name: 'nature' },
    ],
    category: 'photography',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '6',
    type: 'text',
    title: 'Code Snippet: React Hook',
    content: 'const useLocalStorage = (key, initialValue) => {\n  const [storedValue, setStoredValue] = useState(() => {\n    const item = window.localStorage.getItem(key);\n    return item ? JSON.parse(item) : initialValue;\n  });\n  return [storedValue, setStoredValue];\n};',
    tags: [
      { id: 't11', name: 'code' },
      { id: 't12', name: 'react' },
      { id: 't13', name: 'fun' },
    ],
    category: 'development',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '7',
    type: 'image',
    title: 'City Skyline',
    content: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
    tags: [
      { id: 't14', name: 'city' },
      { id: 't15', name: 'urban' },
    ],
    category: 'photography',
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23'),
  },
  {
    id: '8',
    type: 'text',
    title: 'Inspirational Quote',
    content: '"The only way to do great work is to love what you do. If you haven\'t found it yet, keep looking. Don\'t settle." - Steve Jobs',
    tags: [
      { id: 't16', name: 'inspiration' },
      { id: 't17', name: 'quotes' },
      { id: 't18', name: 'fun' },
    ],
    category: 'motivation',
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24'),
  },
  {
    id: '9',
    type: 'image',
    title: 'Ocean Waves',
    content: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800',
    tags: [
      { id: 't19', name: 'ocean' },
      { id: 't20', name: 'nature' },
      { id: 't21', name: 'beauty' },
    ],
    category: 'photography',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '10',
    type: 'text',
    title: 'Design Principles',
    content: 'Good design is as little design as possible. Focus on the essential aspects and remove unnecessary elements. Embrace whitespace. Create visual hierarchy. Consistency builds trust and familiarity.',
    tags: [
      { id: 't22', name: 'design' },
      { id: 't23', name: 'principles' },
    ],
    category: 'design',
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26'),
  },
];
