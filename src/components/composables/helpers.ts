import { copyToClipboard, openInBrowser } from 'src/utils';

export function useHelpers()
{
  function openLink(url: string) {
    openInBrowser(url);
  }

  function copy(val: string) {
    copyToClipboard(val);
  }

  return { copy, openLink };
}
