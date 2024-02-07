import axios from 'axios';
import { getFromLocalStorage, LocalStorageName } from 'src/utils';
import { PivotalStory } from '@/pinia/pivotalStore';

function getPivotalToken() {
  return getFromLocalStorage(LocalStorageName.pivotalToken);
}

function getPivotalProjectId(): number | undefined {
  const savedValue = getFromLocalStorage(
    LocalStorageName.pivotalProjectId
  );

  if(!savedValue)
  {
    return undefined;
  }

  return parseInt(savedValue, 10);
}

export function getPivotalProjectIdAlt(): number | undefined {
  const savedValue = getFromLocalStorage(
    LocalStorageName.pivotalProjectIdAlt
  );

  if(!savedValue)
  {
    return undefined;
  }

  return parseInt(savedValue, 10);
}

function htmlEncode(str: string) {
  // let i = str.length,
  //     aRet = [];
  //
  // while (i--) {
  //     const iC = str[i].charCodeAt();
  //     if (iC < 65 || iC > 127 || (iC>90 && iC<97)) {
  //         // aRet[i] = '&#'+iC+';';
  //         aRet[i] = '%'+iC;
  //     } else {
  //         aRet[i] = str[i];
  //     }
  // }
  // return aRet.join('');

  return encodeURI(str).replace('+', '%2B');
}

export async function getPivotalEndpoint(
  endpoint: string,
  params: Record<string, any>,
  queryParams: Record<string, any>
): Promise<any> {
  const projectId = getPivotalProjectId();
  const baseUri = 'https://www.pivotaltracker.com/services/v5/';

  if (!endpoint) {
    endpoint = `${baseUri}/projects/${projectId}/stories`;
  } else {
    endpoint = endpoint.replace('{projectId}', String(projectId));

    endpoint = `${baseUri}${endpoint}`;
  }

  const headers = {
    'X-TrackerToken': getPivotalToken(),
  };

  try {
    if (queryParams) {
      // const queryString = qs.stringify(queryParams);
      let queryString = '';

      Object.entries(queryParams).forEach(([label, value]) => {
        let result = '';

        if (label === 'text') {
          // ignore until the end
        } else if (
          typeof value === 'boolean' ||
          value === 'true' ||
          value === 'false'
        ) {
          result = `${htmlEncode(label)}:${value}`;
        } else if (Array.isArray(value)) {
          result = `(${value
            .map((v) => `${htmlEncode(label)}:"${htmlEncode(v)}"`)
            .join(' OR ')})`;
        } else {
          result = `${htmlEncode(label)}:"${htmlEncode(value)}"`;
        }

        queryString = `${queryString} ${result}`;
      });

      queryString = `${queryParams.text || ''} ${queryString}`;

      endpoint = `${endpoint}?query=${queryString}`;
    }

    const { data } = await axios.get(endpoint, {
      headers,
      params,
    });

    return data;
  } catch (e) {
    console.error(e);

    return null;
  }
}

export async function getPivotalStory(
  storyId: string | number,
  endpoint?: string,
  projectIdOverride?: number
): Promise<PivotalStory> {
  const projectId = projectIdOverride || getPivotalProjectId();
  const baseUri = 'https://www.pivotaltracker.com/services/v5/';

  if (!endpoint) {
    if (!storyId) {
      return {};
    }

    endpoint = `${baseUri}/projects/${projectId}/stories/${storyId}`;
  } else {
    endpoint = endpoint.replace('{projectId}', String(projectId));

    endpoint = `${baseUri}${endpoint}`;
  }

  const headers = {
    // 'PRIVATE-TOKEN': getGitlabToken() // gitlab
    'X-TrackerToken': getPivotalToken(), // pivotal
  };

  try {
    const { data } = await axios.get(endpoint, { headers });

    return data;
  } catch (e) {
    console.error(e);

    return null;
  }
}
