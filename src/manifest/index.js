module.exports = (browser) => {

  const version = '1.1.0';

  switch (browser) {

    case 'chrome':
      return {
        minimum_chrome_version: '92.0',
        version,
      };

    case 'firefox':
    default:
      return {
        browser_specific_settings: {
          gecko: {
            id: 'yate@kien5436.com',
            strict_min_version: '90.0',
          },
        },
        version,
      };
  }
};