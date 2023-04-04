export function openInBrowser(link)
{
    const { shell } = require('electron');

    shell.openExternal(link);
}