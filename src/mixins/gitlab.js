import axios from 'axios';

export function getGitlabToken()
{
    return localStorage.getItem('gitlabToken');
}

export function setGitlabToken(val)
{
    return localStorage.setItem('gitlabToken', val);
}

export function base64Encode(str)
{
    const encoded = Buffer.from(str);

    return encoded.toString('base64');
}

export function base64Decode(str)
{
    if(typeof str !== 'string')
    {
        if(str instanceof Buffer)
        {
            return str.toString('utf8');
        }
    }

    return Buffer.from(str, 'base64').toString('utf8');
}

export function getProjectPath(module)
{
    switch(module)
    {
        case 'framework':
        case 'core-api':
            return `aluminati/${module}`;
        default:
            return `aluminati/aluminate-${module}`;
    }
}

export async function getGitlabEndpoint(endpoint, params, queryParams, extra)
{
    const baseUri = 'http://dev-git.angdev.com/api/v4';

    if(!endpoint)
    {
        // endpoint = `${baseUri}/projects/${projectId}/stories/${storyId}`;
        endpoint = `${baseUri}/projects/${extra.projectId}/wikis/${extra.slug}`;
    }
    else
    {
        // endpoint = endpoint.replace('{projectId}', projectId);

        endpoint = `${baseUri}${endpoint || ''}`;
    }

    const token = getGitlabToken();

    if(!token)
    {
        console.warn('No gitlab token found!');

        return;
    }

    const headers = {
        'PRIVATE-TOKEN': token
    };

    try
    {
        if(queryParams)
        {
            // const queryString = qs.stringify(queryParams);
            let queryString = '';

            Object.entries(queryParams).forEach(([label, value]) =>
            {
                let result = '';

                if(Array.isArray(value))
                {
                    result = `(${value.map((v) => (`${htmlEncode(label)}:"${htmlEncode(v)}"`)).join(' OR ')})`;
                }
                else
                {
                    result = `${htmlEncode(label)}:"${htmlEncode(value)}"`;
                }

                queryString = `${queryString} ${result}`;
            });

            endpoint = `${endpoint}?query=${queryString}`;
        }

        console.info('getGitlabEndpoint:', { endpoint, headers, params, queryParams });

        const { data } = await axios.get(endpoint, {
            headers,
            params
        });

        console.info('getGitlabEndpoint: result:', data);

        return data;
    }
    catch(e)
    {
        console.error(e);

        return null;
    }
}

export function htmlEncode(str) {
    return encodeURI(str).replace('+', '%2B');
}

export default {
    name: 'GitlabMixin',
    data()
    {
        return {
        };
    },
    inject: ['$log', '$notify'],
    methods: {
        getGitlabToken,
        setGitlabToken,
        base64Encode,
        base64Decode,
        getProjectPath,
        getGitlabEndpoint
    }
};