import {
    firebaseFetch,
    getConfig
} from "src/mixins/firebase";

export const cProtocols = {
    get: 'GET',
    put: 'PUT',
    post: 'POST'
};

export const dbName = 'notes';

export function getURL(path, token)
{
    let url = `${getConfig().databaseURL}/${dbName}.json`;

    if(path)
    {
        if(path.indexOf('/') === 0)
        {
            url = `${url}/${path.slice(1)}`;
        }
        else
        {
            url = `${url}/${path}`;
        }
    }

    if(token)
    {
        url = `${url}?auth=${token}`;
    }

    return url;
}

export async function getAll()
{
    try
    {
        const url = getURL();

        return firebaseFetch(cProtocols.get, url);
    }
    catch(e)
    {
        console.error(e);

        return undefined;
    }
}

export async function updateAll(data)
{
    try
    {
        const url = getURL();

        return firebaseFetch(cProtocols.post, url, data);
    }
    catch(e)
    {
        console.error(e);

        return undefined;
    }
}
