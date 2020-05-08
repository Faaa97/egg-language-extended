
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

  Object.defineProperty(Array.prototype, "=", {
    enumerable: false,
    writable: true,
    value: function(value, ...args) {
      if (args.length === 0 || value === undefined) {
        return this;
      }
      const accesor = (arr, ...args) => {
        const index = args.shift();
        if (args.length > 0) {
          accesor(arr[index], ...args);
        } else {
          arr[index] = value;
        }
      };
      accesor(this, ...args);
    }
  });
};

module.exports = {
  patch,
};