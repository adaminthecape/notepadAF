import axios from 'axios';

function getPivotalToken()
{
    return localStorage.getItem('pivotalToken');
}

function getPivotalProjectId()
{
    return localStorage.getItem('pivotalProjectId');
}

function htmlEncode(str)
{
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

export async function getPivotalEndpoint(endpoint, params, queryParams)
{
    const projectId = getPivotalProjectId();
    const baseUri = 'https://www.pivotaltracker.com/services/v5/';

    if(!endpoint)
    {
        endpoint = `${baseUri}/projects/${projectId}/stories`;
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
                let result = '';

                if(label === 'text')
                {
                    // ignore until the end
                }
                else if(typeof value === 'boolean' || value === 'true' || value === 'false')
                {
                    result = `${htmlEncode(label)}:${value}`;
                }
                else if(Array.isArray(value))
                {
                    result = `(${value.map((v) => (`${htmlEncode(label)}:"${htmlEncode(v)}"`)).join(' OR ')})`;
                }
                else
                {
                    result = `${htmlEncode(label)}:"${htmlEncode(value)}"`;
                }

                queryString = `${queryString} ${result}`;
            });

            queryString = `${queryParams.text || ''} ${queryString}`;

            endpoint = `${endpoint}?query=${queryString}`;
        }

        const { data } = await axios.get(endpoint, {
            headers,
            params
        });

        return data;
    }
    catch(e)
    {
        console.error(e);

        return null;
    }
}

export async function getPivotalStory(storyId, endpoint)
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
        const { data } = await axios.get(endpoint, { headers });

        return data;
    }
    catch(e)
    {
        console.error(e);

        return null;
    }
}
