export default async function decorate(block) {
  const link = block.querySelector('a');

  if (!link) {
    block.textContent = 'API URL not configured';
    return;
  }

  const apiUrl = link.href;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Remove authored API link
    block.innerHTML = '';

    // Render any JSON structure
    const content = renderJson(data);

    block.append(content);
  } catch (error) {
    console.error('API error:', error);

    block.innerHTML = '';

    const errorMessage = document.createElement('div');
    errorMessage.className = 'api-error';
    errorMessage.textContent = 'Unable to load API data.';

    block.append(errorMessage);
  }
}


/**
 * Render any valid JSON value
 */
function renderJson(value, key = null) {
  // null
  if (value === null) {
    return createPrimitive(key, 'null');
  }

  // Array
  if (Array.isArray(value)) {
    return renderArray(value, key);
  }

  // Object
  if (typeof value === 'object') {
    return renderObject(value, key);
  }

  // String / Number / Boolean
  return createPrimitive(key, value);
}


/**
 * Render JSON object
 */
function renderObject(object, key = null) {
  const container = document.createElement('div');
  container.className = 'api-object';

  if (key) {
    const title = document.createElement('h3');
    title.className = 'api-object-title';
    title.textContent = formatKey(key);

    container.append(title);
  }

  Object.entries(object).forEach(([property, value]) => {
    const field = document.createElement('div');
    field.className = 'api-field';

    // Nested object / array
    if (typeof value === 'object' && value !== null) {
      field.append(renderJson(value, property));
    } else {
      field.append(renderJson(value, property));
    }

    container.append(field);
  });

  return container;
}


/**
 * Render JSON array
 */
function renderArray(array, key = null) {
  const container = document.createElement('div');
  container.className = 'api-array';

  if (key) {
    const title = document.createElement('h2');
    title.className = 'api-array-title';
    title.textContent = formatKey(key);

    container.append(title);
  }

  array.forEach((item, index) => {
    const itemContainer = document.createElement('div');
    itemContainer.className = 'api-item';

    // Give array items a number
    if (typeof item === 'object' && item !== null) {
      const itemNumber = document.createElement('div');
      itemNumber.className = 'api-item-number';
      itemNumber.textContent = `Item ${index + 1}`;

      itemContainer.append(itemNumber);
    }

    itemContainer.append(renderJson(item));

    container.append(itemContainer);
  });

  return container;
}


/**
 * Render primitive values
 */
function createPrimitive(key, value) {
  const container = document.createElement('div');
  container.className = 'api-primitive';

  if (key) {
    const label = document.createElement('strong');
    label.textContent = `${formatKey(key)}: `;
    container.append(label);
  }

  const valueElement = document.createElement('span');

  // Boolean
  if (typeof value === 'boolean') {
    valueElement.className = value
      ? 'api-boolean true'
      : 'api-boolean false';

    valueElement.textContent = value ? 'Yes' : 'No';
  }

  // Number
  else if (typeof value === 'number') {
    valueElement.className = 'api-number';
    valueElement.textContent = value;
  }

  // Null
  else if (value === 'null') {
    valueElement.className = 'api-null';
    valueElement.textContent = 'null';
  }

  // String
  else {
    const stringValue = String(value);

    // Detect URL
    if (isUrl(stringValue)) {
      const link = document.createElement('a');

      link.href = stringValue;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = stringValue;

      valueElement.append(link);
    } else {
      valueElement.textContent = stringValue;
    }
  }

  container.append(valueElement);

  return container;
}


/**
 * Format JSON key
 */
function formatKey(key) {
  return String(key)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}


/**
 * Check URL
 */
function isUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}