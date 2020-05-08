
function patch() {
  Object.defineProperty(Array.prototype, "sub", {
    enumerable: false,
    writable: true,
    value: function(...args) {
      if (args.length === 0) {
        return this;
      }
      const index = args.shift();
      if (args.length > 0) {
        return this[index].sub(...args);
      } else {
        return this[index];
      }
    }
  });

};

module.exports = {
  patch,
};