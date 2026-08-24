const SCHEDULE_URL = '/schedules/main-promo.json';

async function getSchedule() {
  const response = await fetch(SCHEDULE_URL);

  if (!response.ok) {
    throw new Error(`Failed to load schedule: ${response.status}`);
  }

  return response.json();
}

function getActivePromo(schedule) {
  const promos = schedule.data || [];
  const now = new Date();

  // Find scheduled promo matching current time
  const activePromo = promos.find((promo) => {
    if (!promo.start || !promo.end) {
      return false;
    }

    const start = new Date(promo.start);
    const end = new Date(promo.end);

    return now >= start && now < end;
  });

  // If no scheduled promo is active, use Default
  return activePromo || promos.find((promo) => !promo.start && !promo.end);
}

export async function getScheduledPromo() {
  const schedule = await getSchedule();
  return getActivePromo(schedule);
}