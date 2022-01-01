import { useEffect, useState } from "preact/hooks";

import getSettings, { defaultOptions } from "../../settings";

export default function useSettings() {
  const [options, setOptions] = useState(defaultOptions);

  useEffect(() => {

    (async () => {

      const syncedOptions = await getSettings();
      setOptions(syncedOptions);
    })();
  }, []);

  return [options, setOptions];
}