import axios from 'axios';
import qs from 'qs';

export function getPivotalToken()
{
    return localStorage.getItem('pivotalToken');
}

export function getPivotalProjectId()
{
    return localStorage.getItem('pivotalProjectId');
}

export async function getPivotalEndpoint(endpoint, params, queryParams)
{
    const projectId = getPivotalProjectId();
    const baseUri = 'https://www.pivotaltracker.com/services/v5/';

    if(!endpoint)
    {
        endpoint = `${baseUri}/projects/${projectId}/stories/${storyId}`;
    }
    else
    {
        endpoint = endpoint
            .replace('{projectId}', projectId);

        endpoint = `${baseUri}${endpoint}`;
    }

    const headers = {
        'X-TrackerToken': getPivotalToken()
    };

    try
    {
        if(queryParams)
        {
            // const queryString = qs.stringify(queryParams);
            let queryString = '';

            Object.entries(queryParams).forEach(([label, value]) =>
            {
                queryString = `${queryString} ${htmlEncode(label)}:"${htmlEncode(value)}"`;
            });

            endpoint = `${endpoint}?query=${queryString}`;
        }

        console.info('getPivotalEndpoint:', { endpoint, headers, params, queryParams });

        const { data } = await axios.get(endpoint, {
            headers,
            params
        });

        console.info('getPivotalEndpoint: result:', data);

        return data;
    }
    catch(e)
    {
        console.error(e);

        return null;
    }
}

export function htmlEncode(str) {
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

    return encodeURI(str)
        .replace('+', '%2B');
}

export async function getPivotal(storyId, endpoint)
{
    const projectId = getPivotalProjectId();
    const baseUri = 'https://www.pivotaltracker.com/services/v5/';

    if(!endpoint)
    {
        if(!storyId)
        {
            return {};
        }

        endpoint = `${baseUri}/projects/${projectId}/stories/${storyId}`;
    }
    else
    {
        endpoint = endpoint
            .replace('{projectId}', projectId);

        endpoint = `${baseUri}${endpoint}`;
    }

    const headers = {
        // 'PRIVATE-TOKEN': getGitlabToken() // gitlab
        'X-TrackerToken': getPivotalToken() // pivotal
    };

    try
    {
        console.info('getPivotal:', { endpoint, headers });

        const { data } = await axios.get(endpoint, { headers });

        console.info('getPivotal: result:', data);

        return data;
    }
    catch(e)
    {
        console.error(e);

        return null;
    }
}

export default {
    name: 'PivotalMixin',
    data()
    {
        return {
            ptRenderKey: 0
        };
    },
    inject: ['$log', '$notify'],
    methods: {
        getPivotalToken,
        getPivotalEndpoint,
        getPivotal
    }
};