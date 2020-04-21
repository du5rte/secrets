"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var fs = require('fs');

var path = require('path');

function splitKeyValuePair(str) {
  var keyValuePairRegex = /^(\w+)\s*=\s*(.+)$/i;
  return str.match(keyValuePairRegex);
}

function splitIntoLines(str) {
  var regexLineBreak = /\n/g;
  return str.split(regexLineBreak);
}

function cleanQuotes(str) {
  var cleanupRegex = /(^['"]|['"]$)/g;
  return str.replace(cleanupRegex, '').trim();
}

function parse(raw) {
  var lines = splitIntoLines(raw);
  return lines.reduce(function (final, line) {
    try {
      var _splitKeyValuePair = splitKeyValuePair(line),
          _splitKeyValuePair2 = _slicedToArray(_splitKeyValuePair, 3),
          key = _splitKeyValuePair2[1],
          rawValue = _splitKeyValuePair2[2];

      var value = cleanQuotes(rawValue);
      return _objectSpread({}, final, {
        [key]: value
      });
    } catch (err) {
      return final;
    }
  }, {});
}

function searchDotEnvFile(directory) {
  var fileLocation = path.join(directory, '.env');

  try {
    var file = fs.readFileSync(fileLocation, 'utf8');
    var data = parse(file);
    return data;
  } catch (e) {
    return {};
  }
}

function searchJsonFile(directory) {
  var fileLocation = path.join(directory, '.env.json');

  try {
    var file = fs.readFileSync(fileLocation, 'utf8');
    var data = JSON.parse(file);
    return data;
  } catch (e) {
    return {};
  }
}

function searchJavaScriptFile(directory) {
  var fileLocation = path.join(directory, '.env.js');

  try {
    var data = require(fileLocation);

    return data;
  } catch (e) {
    return {};
  }
}

function searchAllEnvFiles() {
  return module.paths.reverse().reduce(function (final, directory) {
    var currentDirectory = path.dirname(directory); // Ignore `.env` files inside node_modules folders

    if (/node_modules/.test(currentDirectory)) {
      return final;
    }

    return Object.assign({}, final, searchDotEnvFile(currentDirectory), searchJsonFile(currentDirectory), searchJavaScriptFile(currentDirectory));
  }, {});
}

function StoreEnvKeysInProcessEnv(obj) {
  for (var key in obj) {
    process.env[key] = obj[key];
  }
}

StoreEnvKeysInProcessEnv(searchAllEnvFiles()); // binds exports to `process.env`
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/get

Object.defineProperty(module, 'exports', {
  get: function get() {
    return process.env;
  }
});