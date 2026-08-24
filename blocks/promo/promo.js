import { getScheduledPromo } from '../schedule/schedule.js';

export default async function decorate(block) {
  try {
    console.log('PROMO JS LOADED');

    const activePromo = await getScheduledPromo();

    console.log('ACTIVE PROMO:', activePromo);

    if (!activePromo || !activePromo.fragment) {
      console.error('No promo fragment found');
      return;
    }

    const fragmentPath = new URL(
      activePromo.fragment,
      window.location.origin,
    ).pathname;

    console.log('FRAGMENT PATH:', fragmentPath);

    // Load the selected fragment directly
    const response = await fetch(`${fragmentPath}.plain.html`);

    if (!response.ok) {
      throw new Error(`Failed to load fragment: ${fragmentPath}`);
    }

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const heading = doc.querySelector('h1, h2, h3, h4, h5, h6');
    const description = doc.querySelector('p');

    block.innerHTML = '';

    const content = document.createElement('div');
    content.className = 'promo-content';

    if (heading) {
      const title = document.createElement('h3');
      title.textContent = heading.textContent.trim();
      content.append(title);
    }

    if (description) {
      const desc = document.createElement('p');
      desc.textContent = description.textContent.trim();
      content.append(desc);
    }

    block.append(content);

    console.log('PROMO RENDERED:', activePromo.name);
  } catch (error) {
    console.error('Promo block error:', error);
  }
}