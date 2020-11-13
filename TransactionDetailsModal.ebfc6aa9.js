// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"components/modals/TransactionDetailsModal/TransactionDetailsModal.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TransactionDetailsModal = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactRedux = require("react-redux");

var _react2 = require("linaria/react");

var _ui = require("../../ui");

var _useDecodeInstrcutions = require("../../../utils/hooks/useDecodeInstrcutions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Wrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Wrapper",
  class: "Wrapper_w1tifgs8"
});
var Header = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Header",
  class: "Header_hyjm7t0"
});
var Title = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Title",
  class: "Title_t1ge91kj"
});
var CloseWrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "CloseWrapper",
  class: "CloseWrapper_c19v5yq5"
});
var CloseIcon = /*#__PURE__*/(0, _react2.styled)(_ui.Icon)({
  name: "CloseIcon",
  class: "CloseIcon_c4q92ii"
});
var CircleWrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "CircleWrapper",
  class: "CircleWrapper_cn2thh8"
});
var ArrowAngleIcon = /*#__PURE__*/(0, _react2.styled)(_ui.Icon)({
  name: "ArrowAngleIcon",
  class: "ArrowAngleIcon_a1d2ax1y"
});
var Content = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Content",
  class: "Content_c14kd5e9"
});
var StatusWrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "StatusWrapper",
  class: "StatusWrapper_s1qeiy73"
});
var Value = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Value",
  class: "Value_vwa4296"
});
var Status = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Status",
  class: "Status_s11bohjs"
});
var FieldsWrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "FieldsWrapper",
  class: "FieldsWrapper_fiwc0bt"
});
var FieldWrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "FieldWrapper",
  class: "FieldWrapper_f1n4mogn"
});
var FieldTitle = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "FieldTitle",
  class: "FieldTitle_f9aqzce"
});
var FieldValue = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "FieldValue",
  class: "FieldValue_fuy8m85"
});

var TransactionDetailsModal = function TransactionDetailsModal(_ref) {
  var signature = _ref.signature,
      close = _ref.close;
  var transaction = (0, _reactRedux.useSelector)(function (state) {
    return state.entities.transactionsNormalized[signature];
  });

  var _useDecodeInstrcution = (0, _useDecodeInstrcutions.useDecodeInstrcutions)(transaction === null || transaction === void 0 ? void 0 : transaction.transaction.instructions),
      type = _useDecodeInstrcution.type,
      fromPubkey = _useDecodeInstrcution.fromPubkey,
      lamports = _useDecodeInstrcution.lamports,
      toPubkey = _useDecodeInstrcution.toPubkey;

  if (!transaction) {
    return null;
  }

  return /*#__PURE__*/_react.default.createElement(Wrapper, null, /*#__PURE__*/_react.default.createElement(Header, null, /*#__PURE__*/_react.default.createElement(Title, null, transaction.slot), /*#__PURE__*/_react.default.createElement(CloseWrapper, {
    onClick: close
  }, /*#__PURE__*/_react.default.createElement(CloseIcon, {
    name: "close"
  })), /*#__PURE__*/_react.default.createElement(CircleWrapper, null, /*#__PURE__*/_react.default.createElement(ArrowAngleIcon, {
    name: "arrow-angle"
  }))), /*#__PURE__*/_react.default.createElement(Content, null, /*#__PURE__*/_react.default.createElement(StatusWrapper, null, /*#__PURE__*/_react.default.createElement(Value, null, lamports), /*#__PURE__*/_react.default.createElement(Status, null, "Completed")), /*#__PURE__*/_react.default.createElement(FieldsWrapper, null, /*#__PURE__*/_react.default.createElement(FieldWrapper, null, /*#__PURE__*/_react.default.createElement(FieldTitle, null, "Transaction ID"), /*#__PURE__*/_react.default.createElement(FieldValue, null, signature)), /*#__PURE__*/_react.default.createElement(FieldWrapper, null, /*#__PURE__*/_react.default.createElement(FieldTitle, null, "Amount"), /*#__PURE__*/_react.default.createElement(FieldValue, null, lamports)), /*#__PURE__*/_react.default.createElement(FieldWrapper, null, /*#__PURE__*/_react.default.createElement(FieldTitle, null, "Value"), /*#__PURE__*/_react.default.createElement(FieldValue, null, lamports)), transaction.meta ? /*#__PURE__*/_react.default.createElement(FieldWrapper, null, /*#__PURE__*/_react.default.createElement(FieldTitle, null, "Fee"), /*#__PURE__*/_react.default.createElement(FieldValue, null, transaction.meta.fee)) : null)));
};

exports.TransactionDetailsModal = TransactionDetailsModal;
            ;(function() {
              var reloadCSS = require('_css_loader');
              module.hot.dispose(reloadCSS);
              module.hot.accept(reloadCSS);
            })();
          
},{"react":"../node_modules/react/index.js","react-redux":"../node_modules/react-redux/es/index.js","linaria/react":"../node_modules/linaria/react.js","../../ui":"components/ui/index.ts","../../../utils/hooks/useDecodeInstrcutions":"utils/hooks/useDecodeInstrcutions.ts","_css_loader":"../node_modules/parcel-bundler/src/builtins/css-loader.js"}],"components/modals/TransactionDetailsModal/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () {
    return _TransactionDetailsModal.TransactionDetailsModal;
  }
});

var _TransactionDetailsModal = require("./TransactionDetailsModal");
},{"./TransactionDetailsModal":"components/modals/TransactionDetailsModal/TransactionDetailsModal.tsx"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59634" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js"], null)
//# sourceMappingURL=/TransactionDetailsModal.ebfc6aa9.js.map