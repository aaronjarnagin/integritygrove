/* While true, every page is noindex, analytics are off, and robots.txt lists no sitemap, so the staging build
   (integritygrove-l3fdz.kinsta.page) stays out of search engines.
   Set to false on cutover day, in the same push that goes live on integritygrove.com. */
export const STAGING = true;
