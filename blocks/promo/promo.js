const SCHEDULE_URL = '/schedules/main-promo.json';

async function getPromoSchedule() {
  const response = await fetch(SCHEDULE_URL);

  if (!response.ok) {
    throw new Error(`Failed to load promo schedule: ${response.status}`);
  }

  return response.json();
}

function getActivePromo(schedule) {
  const promos = schedule.data || [];
  const now = new Date();

  const activePromo = promos.find((promo) => {
    if (!promo.start || !promo.end) {
      return false;
    }

    const start = new Date(promo.start);
    const end = new Date(promo.end);

    return now >= start && now < end;
  });

  return activePromo || promos.find((promo) => !promo.start && !promo.end);
}

async function loadPromoFragment(url) {
  const fragmentPath = new URL(url).pathname;

  const response = await fetch(`${fragmentPath}.plain.html`);

  if (!response.ok) {
    throw new Error(
      `Failed to load promo fragment: ${fragmentPath} (${response.status})`,
    );
  }

  return response.text();
}

export default async function decorate(block) {
  try {
    console.log('PROMO JS LOADED');

    const schedule = await getPromoSchedule();

    console.log('PROMO SCHEDULE:', schedule);

    const activePromo = getActivePromo(schedule);

    console.log('ACTIVE PROMO:', activePromo);

    if (!activePromo || !activePromo.fragment) {
      console.error('No active promo found');
      return;
    }

    const html = await loadPromoFragment(activePromo.fragment);

    console.log('PROMO FRAGMENT LOADED');

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