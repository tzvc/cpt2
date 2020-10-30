export function downloadBlob(blob: Blob, fileName: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
}

export type UserInfo = {
  lastname: string;
  firstname: string;
  birthday: string;
  placeofbirth: string;
};

export function extractUserInfoFromURL() {
  try {
    const extractFromParams = (
      params: URLSearchParams,
      key: string
    ): string => {
      const value = params.get(key);
      if (value == null)
        throw new Error(
          `Could not load user info. Missing key "${key}" in URL.`
        );
      return value;
    };
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const firstname = extractFromParams(urlParams, 'firstname');
    const lastname = extractFromParams(urlParams, 'lastname');
    const birthday = extractFromParams(urlParams, 'birthday');
    const placeofbirth = extractFromParams(urlParams, 'placeofbirth');
    return {
      firstname,
      lastname,
      birthday,
      placeofbirth,
    } as UserInfo;
  } catch (e) {
    throw new Error(e.message);
  }
}
