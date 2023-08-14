export type PantryResult = string;

export interface ParsedPantryResult {
  name: string;
  description: string;
  baskets: Array<{
    [key: string]: any;
    name: string;
  }>;
}

export interface PantryBasket {
  [key: string]: any;
}

export interface RequestOptions {
  method: 'GET' | 'PUT' | 'POST';
  headers: Headers;
  body?: string | undefined;
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getPantryId() {
  return localStorage.getItem('pantry_token');
}

export function jsonHeaders() {
  const h = new Headers();
  h.append('Content-Type', 'application/json');
  // h.append('mode', 'no-cors');
  // h.append('Access-Control-Allow-Origin', '*');
  // h.append('Access-Control-Allow-Methods', 'DELETE, POST, GET, OPTIONS');
  // h.append(
  //   'Access-Control-Allow-Headers',
  //   'Content-Type, Authorization, X-Requested-With'
  // );

  return h;
}

export async function awaitStream(
  stream: ReadableStream
): Promise<PantryResult> {
  const set = [];
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    set.push(value);
  }

  return set.join('');
}

export async function getFromPantry(): Promise<PantryResult | undefined> {
  const url = `https://getpantry.cloud/apiv1/pantry/${getPantryId()}`;
  const requestOptions: RequestOptions = {
    method: 'GET',
    headers: jsonHeaders(),
  };

  try {
    await awaitRateLimit();

    const response: Response = await fetch(url, requestOptions);

    setLastRequestTime();

    if (!response?.body) return undefined;

    return awaitStream(response.body);
  } catch (e) {
    console.error(e);

    return undefined;
  }
}

/** GET/PUT/POST to Pantry regarding a specific basket */
export async function queryBasket(
  type: 'GET' | 'PUT' | 'POST',
  name: string,
  data?: any
): Promise<string> {
  if (type === 'PUT') {
    console.warn('PUT does not work! Use POST until further notice.');

    return '';
  }

  const url = `https://getpantry.cloud/apiv1/pantry/${getPantryId()}/basket/${name}`;

  const requestOptions: RequestOptions = {
    method: type,
    headers: jsonHeaders(),
  };

  if (type !== 'GET') {
    try {
      requestOptions.body = JSON.stringify(data);
    } catch (e) {
      console.warn('JSON.stringify FAILURE:');
      console.warn(e);
      return '';
    }
  }

  try {
    await awaitRateLimit();

    const response = await fetch(url, requestOptions);

    if (!response?.body) return '';

    const res = await awaitStream(response.body);

    // console.log(type, 'res:', res);
    return res;
  } catch (e) {
    console.warn(type, 'failure:', e);
    return '';
  }
}

/** Pass-through to queryBasket as PUT */
export async function updateBasket(name: string, data: any): Promise<any> {
  return queryBasket('PUT', name, data);
}

/** Pass-through to queryBasket as POST */
export async function createOrReplaceBasket<T>(
  name: string,
  data: T
): Promise<any> {
  return queryBasket('POST', name, data);
}

/** Pass-through to queryBasket as GET & return parsed result */
export async function getBasket(name: string): Promise<PantryBasket> {
  const basket = await queryBasket('GET', name);

  try {
    return JSON.parse(basket);
  } catch (e) {
    console.warn('Basket parse FAILURE:', basket);

    return [];
  }
}

async function awaitRateLimit(): Promise<void> {
  const rateInterval = 5000; // ms
  const elapsed = Date.now() - getLastRequestTime();
  const wait = Math.max(rateInterval - elapsed, 0);

  console.log('last fetch was', elapsed, 'ms ago. waiting', wait, 'ms');

  // if less than X ms since last fetch, wait
  if (elapsed <= rateInterval) {
    await sleep(wait);
    return;
  }

  setLastRequestTime();

  return;
}

function getLastRequestTime(): number {
  return Number(localStorage.getItem('pantry_request_timestamp') || 0);
}

function setLastRequestTime(): void {
  localStorage.setItem('pantry_request_timestamp', String(Date.now()));
}

function isRateLimited(): boolean {
  const lastRequestTime =
    Number(localStorage.getItem('pantry_request_timestamp')) || 0;

  if (!lastRequestTime) {
    return false;
  }

  return !(lastRequestTime + 1000 < Date.now());
}

export async function saveBasket<T>(name: string, data: T) {
  console.log('pantry SAVE:', data);
  // Get the existing basket
  const basket = await getBasket(name);
  // If no existing basket, create one
  if (!basket) {
    console.warn(`Creating new basket "${name}" with data`, data);
    await createOrReplaceBasket(name, data);
  } else {
    console.warn(`Updating existing basket "${name}" with data`, data);
    await createOrReplaceBasket(name, data);
  }

  const updatedData = await getBasket(name);

  console.info('Update finished with new data:', updatedData);
}
