import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// "ULTIMATE PRODUCTION STRESS" Test Configuration
// Simulates a massive surge in traffic (e.g., social media viral moment)
export const options = {
  stages: [
    { duration: '1m', target: 100 },  // Ramp up
    { duration: '2m', target: 300 },  // High load
    { duration: '2m', target: 350 },  // Peak Stress (Targeting user request)
    { duration: '1m', target: 400 },  // Break point test
    { duration: '2m', target: 0 },    // Gradual cool down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],   // Less than 5% errors even under peak
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // Strict latency targets
  },
};

let BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1);
}

export default function stressTest() {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'k6-ultimate-stress-agent',
    },
    timeout: '30s',
  };

  // --- PHASE 1: DISCOVERY (SSR & Main Pages) ---
  group('User Discovery Flow', function () {
    const pages = ['/', '/menu', '/catering', '/about', '/reviews'];
    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    
    const res = http.get(`${BASE_URL}${randomPage}`, params);
    check(res, { 'discovery: page load (200)': (r) => r.status === 200 });
    
    // Simulate "think time" while looking at the page
    sleep(1 + Math.random() * 2);
  });

  // --- PHASE 2: BROWSING (Public Read APIs) ---
  group('Browsing Data Flow', function () {
    // Site Settings (Always hit first)
    http.get(`${BASE_URL}/api/settings`, params);

    // Categories
    const catRes = http.get(`${BASE_URL}/api/categories`, params);
    const categories = catRes.json().categories || ['Starters'];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    // Menu Items (Filtered by random category)
    const menuRes = http.get(`${BASE_URL}/api/menu-items?category=${randomCat}`, params);
    check(menuRes, { 'api: filtered menu (200)': (r) => r.status === 200 });

    // Parallel background checks
    http.batch([
      ['GET', `${BASE_URL}/api/todays-special`, null, params],
      ['GET', `${BASE_URL}/api/reviews?type=general`, null, params],
    ]);
  });

  sleep(Math.random() * 2);

  // --- PHASE 3: INTERACTION (POST Requests) ---
  const actionRand = Math.random();

  // 15% of users show interest in catering
  if (actionRand < 0.15) {
    group('High-Value Interaction: Catering', function () {
      // First browse the catering menu
      http.get(`${BASE_URL}/api/catering-menu`, params);
      sleep(1);

      const payload = JSON.stringify({
        name: `Stress Tester ${randomString(4)}`,
        phone: '555-000-1111',
        email: `loadtest_${randomString(8)}@gmail.com`,
        eventDate: '2026-05-20',
        guests: '200',
        location: 'Stress Test Arena',
        notes: 'Testing high concurrency throughput.',
        selections: []
      });
      const res = http.post(`${BASE_URL}/api/catering`, payload, params);
      check(res, { 'interaction: catering submit': (r) => [200, 429, 400].includes(r.status) });
    });
  }

  // 10% of users subscribe to newsletter
  if (actionRand > 0.85 && actionRand < 0.95) {
    group('Interaction: Newsletter', function () {
      const payload = JSON.stringify({
        email: `subscriber_${randomString(10)}@gmail.com`
      });
      const res = http.post(`${BASE_URL}/api/newsletter`, payload, params);
      check(res, { 'interaction: newsletter submit': (r) => [200, 400].includes(r.status) });
    });
  }

  // Final wait before session ends
  sleep(Math.random() * 3);
}
