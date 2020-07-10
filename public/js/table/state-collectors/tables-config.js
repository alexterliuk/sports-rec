/**
 * Collector of building tables configuration.
 */
const tablesConfig = (function() {
  const _config = {};

  const addToConfig = (...items) => {
    items.forEach(item => {
      const name = Object.keys(item)[0];
      _config[name] = item[name];
    });
  };

  const getConfigItem = name => _config[name];

  const getAllConfig = () => _config;

  return { addToConfig, getConfigItem, getAllConfig };
})();
