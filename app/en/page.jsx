/**
 * 🌍 ENGLISH HOMEPAGE
 * 
 * Render HomePage với locale='en'
 */

import HomePage from '../page';

export const revalidate = 3600;

export default function EnglishHomePage() {
  return <HomePage locale="en" />;
}
