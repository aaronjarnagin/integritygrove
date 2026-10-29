/* While true, every page is noindex, analytics are off, and robots.txt lists no sitemap, so the staging build
   (integritygrove-l3fdz.kinsta.page) stays out of search engines.
   Set to false on cutover day, in the same push that goes live on integritygrove.com. */
export const STAGING = true;

/* Free 30-minute discovery call (Google Calendar booking page). Main call to action site-wide. */
export const BOOK_URL = 'https://calendar.app.google/4rns3tHTA2yDxzhJ6';
export const EMAIL = 'info@integritygrove.com';

/* Formspree endpoint for the contact form (a form delivering to info@integritygrove.com).
   Empty = not connected yet: the form still shows, and submitting tells the visitor to email or book instead. */
export const FORM_URL = '';
