import { chromium } from '@playwright/test';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Block analytics, GTM, ads, etc.
  await context.route('**/*', (route) => {
    const blockedDomains = [
        // Google / GTM / Analytics
        'googletagmanager.com',
        'google-analytics.com',
        'www.google-analytics.com',
        'analytics.google.com',
        'www.googletagmanager.com',
        'www.googleadservices.com',
      
        // Datadog
        'datadoghq.com',
        'www.datadoghq.com',
      
        // Ads / Tracking
        'doubleclick.net',
        'adservice.google.com',
        'ads.google.com',
        'ads.yahoo.com',
      
        // Heatmaps / Session Recording
        'hotjar.com',
        'www.hotjar.com',
        'fullstory.com',
        'segment.com',
      
        // Social / Retargeting
        'facebook.net',
        'connect.facebook.net',
        'linkedin.com',
        'www.linkedin.com',
        'twitter.com',
        'platform.twitter.com',
      
        // Misc common trackers
        'matomo.org',
        'pinterest.com',
        'www.pinterest.com',
        'criteo.com',
        'app.measurementapi.com',

        'recaptcha.net',
        'google.com/recaptcha',
        '/recaptcha/enterprise.js',
        '/recaptcha/enterprise/anchor',

        '/api/splitChanges',
        '/api/mySegments',
        '/sse',
        '/wi/config',

      ];
      

    const url = route.request().url();
    if (blockedDomains.some((domain) => url.includes(domain))) {
      return route.abort();
    }
    return route.continue();
  });

  await browser.close();
}
