import axios from 'axios';

export function getPivotalToken()
{
    return localStorage.getItem('pivotalToken');
}

export function getPivotalProjectId()
{
    return localStorage.getItem('pivotalProjectId');
}

export async function getPivotalEndpoint(endpoint, params)
{
    const projectId = getPivotalProjectId();
    const baseUri = 'https://www.pivotaltracker.com/services/v5/';

    if(!endpoint)
    {
        endpoint = `${baseUri}/projects/${projectId}/stories/${storyId}`;
    }
    else
    {
        endpoint = `${baseUri}${endpoint}`;
    }

    const headers = {
        'X-TrackerToken': getPivotalToken()
    };

    try
    {
        console.info('getPivotalEndpoint:', { endpoint, headers, params });

        const { data } = await axios.get(endpoint, { headers, params });

        console.info('getPivotalEndpoint: result:', data);

        return data;
    }
    catch(e)
    {
        console.error(e);

        return null;
    }
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