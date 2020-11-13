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
})({"store/utils/instructions/tokenProgram.ts":[function(require,module,exports) {
var Buffer = require("buffer").Buffer;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeMintInstruction = initializeMintInstruction;
exports.initializeAccountInstruction = initializeAccountInstruction;
exports.mintToInstruction = mintToInstruction;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var web3 = _interopRequireWildcard(require("@solana/web3.js"));

var BufferLayout = _interopRequireWildcard(require("buffer-layout"));

var _bufferLayouts = require("../../../constants/solana/bufferLayouts");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'));
LAYOUT.addVariant(0, BufferLayout.struct([BufferLayout.u8('decimals'), BufferLayout.blob(32, 'mintAuthority'), BufferLayout.u8('freezeAuthorityOption'), BufferLayout.blob(32, 'freezeAuthority')]), 'initializeMint');
LAYOUT.addVariant(1, BufferLayout.struct([]), 'initializeAccount');
LAYOUT.addVariant(3, BufferLayout.struct([BufferLayout.nu64('amount')]), 'transfer');
LAYOUT.addVariant(7, BufferLayout.struct([BufferLayout.nu64('amount')]), 'mintTo');
LAYOUT.addVariant(8, BufferLayout.struct([BufferLayout.nu64('amount')]), 'burn');
LAYOUT.addVariant(9, BufferLayout.struct([]), 'closeAccount');
var instructionMaxSpan = Math.max.apply(Math, (0, _toConsumableArray2.default)(Object.values(LAYOUT.registry).map(function (r) {
  return r.span;
})));

function encodeTokenInstructionData(instruction) {
  var b = Buffer.alloc(instructionMaxSpan);
  var span = LAYOUT.encode(instruction, b);
  return b.slice(0, span);
}

function initializeMintInstruction(_ref) {
  var mint = _ref.mint,
      decimals = _ref.decimals,
      mintAuthority = _ref.mintAuthority,
      freezeAuthority = _ref.freezeAuthority;
  var keys = [{
    pubkey: mint,
    isSigner: false,
    isWritable: true
  }, {
    pubkey: web3.SYSVAR_RENT_PUBKEY,
    isSigner: false,
    isWritable: false
  }];
  return new web3.TransactionInstruction({
    keys: keys,
    data: encodeTokenInstructionData({
      initializeMint: {
        decimals: decimals,
        mintAuthority: mintAuthority.toBuffer(),
        freezeAuthorityOption: !!freezeAuthority,
        freezeAuthority: (freezeAuthority || new web3.PublicKey()).toBuffer()
      }
    }),
    programId: _bufferLayouts.TOKEN_PROGRAM_ID
  });
}

function initializeAccountInstruction(_ref2) {
  var account = _ref2.account,
      mint = _ref2.mint,
      owner = _ref2.owner;
  var keys = [{
    pubkey: account,
    isSigner: false,
    isWritable: true
  }, {
    pubkey: mint,
    isSigner: false,
    isWritable: false
  }, {
    pubkey: owner,
    isSigner: false,
    isWritable: false
  }, {
    pubkey: web3.SYSVAR_RENT_PUBKEY,
    isSigner: false,
    isWritable: false
  }];
  return new web3.TransactionInstruction({
    keys: keys,
    data: encodeTokenInstructionData({
      initializeAccount: {}
    }),
    programId: _bufferLayouts.TOKEN_PROGRAM_ID
  });
}

function mintToInstruction(_ref3) {
  var mint = _ref3.mint,
      destination = _ref3.destination,
      amount = _ref3.amount,
      mintAuthority = _ref3.mintAuthority;
  var keys = [{
    pubkey: mint,
    isSigner: false,
    isWritable: true
  }, {
    pubkey: destination,
    isSigner: false,
    isWritable: true
  }, {
    pubkey: mintAuthority,
    isSigner: true,
    isWritable: false
  }];
  return new web3.TransactionInstruction({
    keys: keys,
    data: encodeTokenInstructionData({
      mintTo: {
        amount: amount
      }
    }),
    programId: _bufferLayouts.TOKEN_PROGRAM_ID
  });
}
},{"@babel/runtime/helpers/toConsumableArray":"../node_modules/@babel/runtime/helpers/toConsumableArray.js","@solana/web3.js":"../node_modules/@solana/web3.js/lib/index.esm.js","buffer-layout":"../node_modules/buffer-layout/lib/Layout.js","../../../constants/solana/bufferLayouts":"constants/solana/bufferLayouts.ts","buffer":"../node_modules/node-libs-browser/node_modules/buffer/index.js"}],"store/actions/complex/tokens.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTokenAccount = exports.createAndInitializeMint = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var web3 = _interopRequireWildcard(require("@solana/web3.js"));

var _bufferLayouts = require("../../../constants/solana/bufferLayouts");

var _commands = require("../../commands");

var _middlewares = require("../../middlewares");

var _services = require("../../middlewares/solana-api/services");

var _tokenProgram = require("../../utils/instructions/tokenProgram");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createAndInitializeMint = function createAndInitializeMint(_ref) {
  var owner = _ref.owner,
      mint = _ref.mint,
      amount = _ref.amount,
      decimals = _ref.decimals,
      initialAccount = _ref.initialAccount;
  return /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(dispatch) {
      var connection, transaction, lamportsForMint, signers, lamportsForAccount;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              connection = _services.ApiSolanaService.getConnection();
              transaction = new web3.Transaction();
              _context.next = 4;
              return connection.getMinimumBalanceForRentExemption(_bufferLayouts.MINT_LAYOUT.span);

            case 4:
              lamportsForMint = _context.sent;
              transaction.add(web3.SystemProgram.createAccount({
                fromPubkey: owner.publicKey,
                newAccountPubkey: mint.publicKey,
                lamports: lamportsForMint,
                space: _bufferLayouts.MINT_LAYOUT.span,
                programId: _bufferLayouts.TOKEN_PROGRAM_ID
              }));
              transaction.add((0, _tokenProgram.initializeMintInstruction)({
                mint: mint.publicKey,
                decimals: decimals,
                mintAuthority: owner.publicKey
              }));
              signers = [owner, mint];

              if (!(amount > 0)) {
                _context.next = 16;
                break;
              }

              signers.push(initialAccount);
              _context.next = 12;
              return connection.getMinimumBalanceForRentExemption(_bufferLayouts.ACCOUNT_LAYOUT.span);

            case 12:
              lamportsForAccount = _context.sent;
              transaction.add(web3.SystemProgram.createAccount({
                fromPubkey: owner.publicKey,
                newAccountPubkey: initialAccount.publicKey,
                lamports: lamportsForAccount,
                space: _bufferLayouts.ACCOUNT_LAYOUT.span,
                programId: _bufferLayouts.TOKEN_PROGRAM_ID
              }));
              transaction.add((0, _tokenProgram.initializeAccountInstruction)({
                account: initialAccount.publicKey,
                mint: mint.publicKey,
                owner: owner.publicKey
              }));
              transaction.add((0, _tokenProgram.mintToInstruction)({
                mint: mint.publicKey,
                destination: initialAccount.publicKey,
                amount: amount,
                mintAuthority: owner.publicKey
              }));

            case 16:
              return _context.abrupt("return", dispatch((0, _defineProperty2.default)({}, _middlewares.SOLANA_API, {
                action: _commands.mintTestTokenAsyncAction,
                transaction: transaction,
                signers: signers,
                options: {
                  preflightCommitment: 'single'
                }
              })));

            case 17:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }();
};

exports.createAndInitializeMint = createAndInitializeMint;

var createAndInitializeTokenAccount = function createAndInitializeTokenAccount(_ref3) {
  var payer = _ref3.payer,
      mintPublicKey = _ref3.mintPublicKey,
      newAccount = _ref3.newAccount;
  return /*#__PURE__*/function () {
    var _ref4 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(dispatch) {
      var connection, transaction, lamportsForAccount;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              connection = _services.ApiSolanaService.getConnection();
              transaction = new web3.Transaction();
              _context2.next = 4;
              return connection.getMinimumBalanceForRentExemption(_bufferLayouts.ACCOUNT_LAYOUT.span);

            case 4:
              lamportsForAccount = _context2.sent;
              transaction.add(web3.SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: newAccount.publicKey,
                lamports: lamportsForAccount,
                space: _bufferLayouts.ACCOUNT_LAYOUT.span,
                programId: _bufferLayouts.TOKEN_PROGRAM_ID
              }));
              transaction.add((0, _tokenProgram.initializeAccountInstruction)({
                account: newAccount.publicKey,
                mint: mintPublicKey,
                owner: payer.publicKey
              }));
              return _context2.abrupt("return", dispatch((0, _defineProperty2.default)({}, _middlewares.SOLANA_API, {
                action: _commands.mintTestTokenAsyncAction,
                transaction: transaction,
                signers: [payer, newAccount],
                options: {
                  preflightCommitment: 'single'
                }
              })));

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref4.apply(this, arguments);
    };
  }();
};

var createTokenAccount = function createTokenAccount(tokenAddress) {
  return function (dispatch, getState) {
    var ownerAccount = getState().data.blockchain.account;

    if (!ownerAccount) {
      // TODO: check auth
      console.info('TODO: check auth');
    }

    return dispatch(createAndInitializeTokenAccount({
      payer: ownerAccount,
      mintPublicKey: tokenAddress,
      newAccount: new web3.Account()
    }));
  };
};

exports.createTokenAccount = createTokenAccount;
},{"@babel/runtime/regenerator":"../node_modules/@babel/runtime/regenerator/index.js","@babel/runtime/helpers/defineProperty":"../node_modules/@babel/runtime/helpers/defineProperty.js","@babel/runtime/helpers/asyncToGenerator":"../node_modules/@babel/runtime/helpers/asyncToGenerator.js","@solana/web3.js":"../node_modules/@solana/web3.js/lib/index.esm.js","../../../constants/solana/bufferLayouts":"constants/solana/bufferLayouts.ts","../../commands":"store/commands/index.ts","../../middlewares":"store/middlewares/index.ts","../../middlewares/solana-api/services":"store/middlewares/solana-api/services/index.ts","../../utils/instructions/tokenProgram":"store/utils/instructions/tokenProgram.ts"}],"components/modals/AddCoinModal/TokenRow/TokenRow.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenRow = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var web3 = _interopRequireWildcard(require("@solana/web3.js"));

var _classnames = _interopRequireDefault(require("classnames"));

var _react2 = require("linaria/react");

var _ui = require("../../../ui");

var _tokens = require("../../../../store/actions/complex/tokens");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Wrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Wrapper",
  class: "Wrapper_w2hsup5"
});
var ChevronWrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "ChevronWrapper",
  class: "ChevronWrapper_cjk37vx"
});
var ChevronIcon = /*#__PURE__*/(0, _react2.styled)(_ui.Icon)({
  name: "ChevronIcon",
  class: "ChevronIcon_c1aewuyh"
});
var Main = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Main",
  class: "Main_m1x0i73s"
});
var Content = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Content",
  class: "Content_c1lrr91s"
});
var InfoWrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "InfoWrapper",
  class: "InfoWrapper_ifuaxgh"
});
var AvatarStyled = /*#__PURE__*/(0, _react2.styled)(_ui.Avatar)({
  name: "AvatarStyled",
  class: "AvatarStyled_asx2g64"
});
var Info = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Info",
  class: "Info_i10180ct"
});
var Top = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Top",
  class: "Top_t1idmxl7"
});
var Bottom = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Bottom",
  class: "Bottom_b5vkidx"
});
var Additional = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Additional",
  class: "Additional_ajtzobz"
});
var CopyWrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "CopyWrapper",
  class: "CopyWrapper_cr7kpio"
});
var CopyIcon = /*#__PURE__*/(0, _react2.styled)(_ui.Icon)({
  name: "CopyIcon",
  class: "CopyIcon_c1n4pegg"
});

var TokenRow = function TokenRow(_ref) {
  var mintAddress = _ref.mintAddress,
      tokenName = _ref.tokenName,
      tokenSymbol = _ref.tokenSymbol,
      icon = _ref.icon;
  var dispatch = (0, _reactRedux.useDispatch)(); // eslint-disable-next-line unicorn/no-null

  var inputRef = (0, _react.useRef)(null);

  var _useState = (0, _react.useState)(false),
      _useState2 = (0, _slicedToArray2.default)(_useState, 2),
      isOpen = _useState2[0],
      setIsOpen = _useState2[1];

  var handleChevronClick = function handleChevronClick() {
    setIsOpen(!isOpen);
  };

  var handleAddClick = function handleAddClick() {
    var mint = new web3.PublicKey(mintAddress);
    dispatch((0, _tokens.createTokenAccount)(mint));
  };

  var handleCopyClick = function handleCopyClick() {
    var input = inputRef.current;

    if (input) {
      input.focus();
      input.setSelectionRange(0, input.value.length);
      document.execCommand('copy');
    }
  };

  return /*#__PURE__*/_react.default.createElement(Wrapper, null, /*#__PURE__*/_react.default.createElement(ChevronWrapper, {
    onClick: handleChevronClick,
    className: (0, _classnames.default)({
      opened: isOpen
    })
  }, /*#__PURE__*/_react.default.createElement(ChevronIcon, {
    name: "chevron"
  })), /*#__PURE__*/_react.default.createElement(Main, null, /*#__PURE__*/_react.default.createElement(Content, null, /*#__PURE__*/_react.default.createElement(InfoWrapper, {
    onClick: handleChevronClick
  }, /*#__PURE__*/_react.default.createElement(AvatarStyled, {
    src: icon
  }), /*#__PURE__*/_react.default.createElement(Info, null, /*#__PURE__*/_react.default.createElement(Top, null, /*#__PURE__*/_react.default.createElement("div", null, tokenSymbol), " ", /*#__PURE__*/_react.default.createElement("div", null)), /*#__PURE__*/_react.default.createElement(Bottom, null, /*#__PURE__*/_react.default.createElement("div", null, tokenName), " ", /*#__PURE__*/_react.default.createElement("div", null)))), /*#__PURE__*/_react.default.createElement(_ui.Button, {
    secondary: true,
    small: true,
    onClick: handleAddClick
  }, "Add")), /*#__PURE__*/_react.default.createElement(Additional, {
    className: (0, _classnames.default)({
      opened: isOpen
    })
  }, /*#__PURE__*/_react.default.createElement(_ui.Input, {
    ref: inputRef,
    title: "".concat(tokenSymbol, " Mint Address"),
    value: mintAddress,
    readOnly: true,
    postfix: /*#__PURE__*/_react.default.createElement(CopyWrapper, {
      onClick: handleCopyClick
    }, /*#__PURE__*/_react.default.createElement(CopyIcon, {
      name: "copy"
    }))
  }))));
};

exports.TokenRow = TokenRow;
            ;(function() {
              var reloadCSS = require('_css_loader');
              module.hot.dispose(reloadCSS);
              module.hot.accept(reloadCSS);
            })();
          
},{"@babel/runtime/helpers/slicedToArray":"../node_modules/@babel/runtime/helpers/slicedToArray.js","react":"../node_modules/react/index.js","react-redux":"../node_modules/react-redux/es/index.js","@solana/web3.js":"../node_modules/@solana/web3.js/lib/index.esm.js","classnames":"../node_modules/classnames/index.js","linaria/react":"../node_modules/linaria/react.js","../../../ui":"components/ui/index.ts","../../../../store/actions/complex/tokens":"store/actions/complex/tokens.ts","_css_loader":"../node_modules/parcel-bundler/src/builtins/css-loader.js"}],"components/modals/AddCoinModal/TokenRow/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "TokenRow", {
  enumerable: true,
  get: function () {
    return _TokenRow.TokenRow;
  }
});

var _TokenRow = require("./TokenRow");
},{"./TokenRow":"components/modals/AddCoinModal/TokenRow/TokenRow.tsx"}],"components/modals/AddCoinModal/TokenList/TokenList.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenList = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _react2 = require("linaria/react");

var _TokenRow = require("../TokenRow");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Wrapper = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "Wrapper",
  class: "Wrapper_w1wf7dhi"
});

var TokenList = function TokenList(_ref) {
  var items = _ref.items;

  if (!items) {
    return null;
  }

  return /*#__PURE__*/_react.default.createElement(Wrapper, null, items.map(function (item) {
    return /*#__PURE__*/_react.default.createElement(_TokenRow.TokenRow, (0, _extends2.default)({
      key: item.mintAddress
    }, item));
  }));
};

exports.TokenList = TokenList;
            ;(function() {
              var reloadCSS = require('_css_loader');
              module.hot.dispose(reloadCSS);
              module.hot.accept(reloadCSS);
            })();
          
},{"@babel/runtime/helpers/extends":"../node_modules/@babel/runtime/helpers/extends.js","react":"../node_modules/react/index.js","linaria/react":"../node_modules/linaria/react.js","../TokenRow":"components/modals/AddCoinModal/TokenRow/index.ts","_css_loader":"../node_modules/parcel-bundler/src/builtins/css-loader.js"}],"components/modals/AddCoinModal/TokenList/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "TokenList", {
  enumerable: true,
  get: function () {
    return _TokenList.TokenList;
  }
});

var _TokenList = require("./TokenList");
},{"./TokenList":"components/modals/AddCoinModal/TokenList/TokenList.tsx"}],"components/modals/AddCoinModal/AddCoinModal.tsx":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AddCoinModal = void 0;

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var web3 = _interopRequireWildcard(require("@solana/web3.js"));

var _react2 = require("linaria/react");

var _Modal = require("../../common/Modal");

var _ui = require("../../ui");

var _tokens = require("../../../constants/tokens");

var _tokens2 = require("../../../store/actions/complex/tokens");

var _TokenList = require("./TokenList");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var WrapperModal = /*#__PURE__*/(0, _react2.styled)(_Modal.Modal)({
  name: "WrapperModal",
  class: "WrapperModal_wiqml5"
});
var ScrollableContainer = /*#__PURE__*/(0, _react2.styled)("div")({
  name: "ScrollableContainer",
  class: "ScrollableContainer_s17ynaak"
}); // const ITEMS = [
//   {
//     symbol: 'SRM',
//     name: 'Serum',
//     price: '$0.887832',
//     delta: '+16.9% for 24hrs',
//   },
//   {
//     symbol: 'MSRM',
//     name: 'MegaSerum',
//     price: '$0.887832',
//     delta: '+16.9% for 24hrs',
//   },
//   {
//     symbol: 'BTC',
//     name: 'Wrapped Bitcoin',
//     price: '$0.887832',
//     delta: '+16.9% for 24hrs',
//   },
//   {
//     symbol: 'ETH',
//     name: 'Wrapped Ethereum',
//     price: '$0.887832',
//     delta: '+16.9% for 24hrs',
//   },
//   {
//     symbol: 'FTT',
//     name: 'Wrapped FTT',
//     price: '$0.887832',
//     delta: '+16.9% for 24hrs',
//   },
//   {
//     symbol: 'YFI',
//     name: 'Wrapped YFI',
//     price: '$0.887832',
//     delta: '+16.9% for 24hrs',
//   },
//   {
//     symbol: 'YFI',
//     name: 'Wrapped YFI',
//     price: '$0.887832',
//     delta: '+16.9% for 24hrs',
//   },
// ];

var AddCoinModal = function AddCoinModal(_ref) {
  var close = _ref.close;
  var dispatch = (0, _reactRedux.useDispatch)();
  var ownerAccount = (0, _reactRedux.useSelector)(function (state) {
    return state.data.blockchain.account;
  });
  var entrypoint = (0, _reactRedux.useSelector)(function (state) {
    return state.data.blockchain.entrypoint;
  });
  var tokenAccounts = (0, _reactRedux.useSelector)(function (state) {
    return state.entities.tokens.items;
  });
  var tokens = _tokens.TOKENS_BY_ENTRYPOINT[entrypoint];
  var isMainnetEntrypoint = entrypoint === web3.clusterApiUrl('mainnet-beta');

  var handleMintTestTokenClick = function handleMintTestTokenClick() {
    if (!ownerAccount) {
      return;
    }

    dispatch((0, _tokens2.createAndInitializeMint)({
      owner: ownerAccount,
      mint: new web3.Account(),
      amount: 1000,
      decimals: 2,
      initialAccount: new web3.Account()
    }));
  };

  var filteredTokens = (0, _react.useMemo)(function () {
    if (!tokens) {
      return;
    }

    var existsMintAccounts = new Set(Object.values(tokenAccounts).map(function (token) {
      var _token$parsed$mint;

      return (_token$parsed$mint = token.parsed.mint) === null || _token$parsed$mint === void 0 ? void 0 : _token$parsed$mint.toBase58();
    }));
    return tokens.filter(function (token) {
      return !existsMintAccounts.has(token.mintAddress);
    });
  }, [tokenAccounts, tokens]);
  console.log(filteredTokens);
  return /*#__PURE__*/_react.default.createElement(WrapperModal, {
    title: "Add coins",
    description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, "Add a token to your wallet. This will cost 0.002039 SOL.", !isMainnetEntrypoint ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, ' ', /*#__PURE__*/_react.default.createElement(_ui.Button, {
      link: true,
      onClick: handleMintTestTokenClick
    }, "Mint test token")) : null),
    close: close
  }, (filteredTokens === null || filteredTokens === void 0 ? void 0 : filteredTokens.length) ? /*#__PURE__*/_react.default.createElement(ScrollableContainer, null, /*#__PURE__*/_react.default.createElement(_TokenList.TokenList, {
    items: filteredTokens
  })) : undefined);
};

exports.AddCoinModal = AddCoinModal;
            ;(function() {
              var reloadCSS = require('_css_loader');
              module.hot.dispose(reloadCSS);
              module.hot.accept(reloadCSS);
            })();
          
},{"react":"../node_modules/react/index.js","react-redux":"../node_modules/react-redux/es/index.js","@solana/web3.js":"../node_modules/@solana/web3.js/lib/index.esm.js","linaria/react":"../node_modules/linaria/react.js","../../common/Modal":"components/common/Modal/index.ts","../../ui":"components/ui/index.ts","../../../constants/tokens":"constants/tokens.ts","../../../store/actions/complex/tokens":"store/actions/complex/tokens.ts","./TokenList":"components/modals/AddCoinModal/TokenList/index.ts","_css_loader":"../node_modules/parcel-bundler/src/builtins/css-loader.js"}],"components/modals/AddCoinModal/index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () {
    return _AddCoinModal.AddCoinModal;
  }
});

var _AddCoinModal = require("./AddCoinModal");
},{"./AddCoinModal":"components/modals/AddCoinModal/AddCoinModal.tsx"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57981" + '/');

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
//# sourceMappingURL=/AddCoinModal.4b79d9b5.js.map