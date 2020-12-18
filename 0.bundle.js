(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{

/***/ "./.linaria-cache/src/components/common/Modal/Modal.linaria.css":
/*!**********************************************************************!*\
  !*** ./.linaria-cache/src/components/common/Modal/Modal.linaria.css ***!
  \**********************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./.linaria-cache/src/components/modals/AddCoinModal/AddCoinModal.linaria.css":
/*!************************************************************************************!*\
  !*** ./.linaria-cache/src/components/modals/AddCoinModal/AddCoinModal.linaria.css ***!
  \************************************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./.linaria-cache/src/components/modals/AddCoinModal/TokenList/TokenList.linaria.css":
/*!*******************************************************************************************!*\
  !*** ./.linaria-cache/src/components/modals/AddCoinModal/TokenList/TokenList.linaria.css ***!
  \*******************************************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./.linaria-cache/src/components/modals/AddCoinModal/TokenRow/TokenRow.linaria.css":
/*!*****************************************************************************************!*\
  !*** ./.linaria-cache/src/components/modals/AddCoinModal/TokenRow/TokenRow.linaria.css ***!
  \*****************************************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/components/common/Modal/Modal.tsx":
/*!***********************************************!*\
  !*** ./src/components/common/Modal/Modal.tsx ***!
  \***********************************************/
/*! exports provided: Modal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Modal", function() { return Modal; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _linaria_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @linaria/react */ "./node_modules/@linaria/react/esm/index.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui */ "./src/components/ui/index.ts");



const Wrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])("div")({
  name: "Wrapper",
  class: "Wrapper_wrdya2m"
});
const Header = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])("div")({
  name: "Header",
  class: "Header_h1vh307k"
});
const Title = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])("div")({
  name: "Title",
  class: "Title_t1qfjroh"
});
const Description = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])("div")({
  name: "Description",
  class: "Description_d8b2mdb"
});
const CloseWrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])("div")({
  name: "CloseWrapper",
  class: "CloseWrapper_c135gzia"
});
const CloseIcon = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])(_ui__WEBPACK_IMPORTED_MODULE_2__["Icon"])({
  name: "CloseIcon",
  class: "CloseIcon_c1whuod3"
});
const Content = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])("div")({
  name: "Content",
  class: "Content_c12kmdhp"
});
const Modal = ({
  title,
  description,
  close,
  children,
  className
}) => {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Wrapper, {
    className: className
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Header, null, title ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Title, null, title) : undefined, description ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Description, null, description) : undefined, close ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(CloseWrapper, {
    onClick: close
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(CloseIcon, {
    name: "close"
  })) : undefined), children ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Content, null, children) : undefined);
};

__webpack_require__(/*! ../../../../.linaria-cache/src/components/common/Modal/Modal.linaria.css */ "./.linaria-cache/src/components/common/Modal/Modal.linaria.css");

/***/ }),

/***/ "./src/components/common/Modal/index.ts":
/*!**********************************************!*\
  !*** ./src/components/common/Modal/index.ts ***!
  \**********************************************/
/*! exports provided: Modal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Modal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Modal */ "./src/components/common/Modal/Modal.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Modal", function() { return _Modal__WEBPACK_IMPORTED_MODULE_0__["Modal"]; });



/***/ }),

/***/ "./src/components/modals/AddCoinModal/AddCoinModal.tsx":
/*!*************************************************************!*\
  !*** ./src/components/modals/AddCoinModal/AddCoinModal.tsx ***!
  \*************************************************************/
/*! exports provided: AddCoinModal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AddCoinModal", function() { return AddCoinModal; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var _linaria_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @linaria/react */ "./node_modules/@linaria/react/esm/index.js");
/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @solana/web3.js */ "./node_modules/@solana/web3.js/lib/index.esm.js");
/* harmony import */ var _api_token_Token__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../api/token/Token */ "./src/api/token/Token.ts");
/* harmony import */ var _api_token_TokenAccount__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../api/token/TokenAccount */ "./src/api/token/TokenAccount.ts");
/* harmony import */ var _common_Modal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../common/Modal */ "./src/components/common/Modal/index.ts");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../ui */ "./src/components/ui/index.ts");
/* harmony import */ var _store_slices_wallet_WalletSlice__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../store/slices/wallet/WalletSlice */ "./src/store/slices/wallet/WalletSlice.ts");
/* harmony import */ var _TokenList__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./TokenList */ "./src/components/modals/AddCoinModal/TokenList/index.ts");










const WrapperModal = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])(_common_Modal__WEBPACK_IMPORTED_MODULE_6__["Modal"])({
  name: "WrapperModal",
  class: "WrapperModal_wiqml5"
});
const ScrollableContainer = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "ScrollableContainer",
  class: "ScrollableContainer_s17ynaak"
});
const AddCoinModal = ({
  close
}) => {
  const dispatch = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useDispatch"])();
  const cluster = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useSelector"])(state => state.wallet.cluster);
  const tokenAccounts = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useSelector"])(state => state.wallet.tokenAccounts.map(token => _api_token_TokenAccount__WEBPACK_IMPORTED_MODULE_5__["TokenAccount"].from(token)));
  const availableTokens = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useSelector"])(state => state.global.availableTokens.map(token => _api_token_Token__WEBPACK_IMPORTED_MODULE_4__["Token"].from(token)));
  const isMainnetEntrypoint = cluster === Object(_solana_web3_js__WEBPACK_IMPORTED_MODULE_3__["clusterApiUrl"])('mainnet-beta');

  const handleMintTestTokenClick = () => {
    dispatch(Object(_store_slices_wallet_WalletSlice__WEBPACK_IMPORTED_MODULE_8__["createMint"])({
      amount: 1000,
      decimals: 2,
      initialAccount: new _solana_web3_js__WEBPACK_IMPORTED_MODULE_3__["Account"]()
    }));
  };

  const closeModal = () => {
    close();
  };

  const filteredTokens = Object(react__WEBPACK_IMPORTED_MODULE_0__["useMemo"])(() => {
    if (!availableTokens) {
      return;
    }

    const existsMintAccounts = new Set(tokenAccounts.map(token => token.mint.address.toBase58()));
    return availableTokens.filter(token => !existsMintAccounts.has(token.address.toBase58()));
  }, [availableTokens]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(WrapperModal, {
    title: "Add coins",
    description: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, "Add a token to your wallet. This will cost some SOL", !isMainnetEntrypoint ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, ' ', /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_ui__WEBPACK_IMPORTED_MODULE_7__["Button"], {
      link: true,
      onClick: handleMintTestTokenClick
    }, "Mint test token")) : null),
    close: close
  }, (filteredTokens === null || filteredTokens === void 0 ? void 0 : filteredTokens.length) ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ScrollableContainer, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_TokenList__WEBPACK_IMPORTED_MODULE_9__["TokenList"], {
    items: filteredTokens,
    closeModal: closeModal
  })) : undefined);
};

__webpack_require__(/*! ../../../../.linaria-cache/src/components/modals/AddCoinModal/AddCoinModal.linaria.css */ "./.linaria-cache/src/components/modals/AddCoinModal/AddCoinModal.linaria.css");

/***/ }),

/***/ "./src/components/modals/AddCoinModal/TokenList/TokenList.tsx":
/*!********************************************************************!*\
  !*** ./src/components/modals/AddCoinModal/TokenList/TokenList.tsx ***!
  \********************************************************************/
/*! exports provided: TokenList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TokenList", function() { return TokenList; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _linaria_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @linaria/react */ "./node_modules/@linaria/react/esm/index.js");
/* harmony import */ var _TokenRow__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../TokenRow */ "./src/components/modals/AddCoinModal/TokenRow/index.ts");



const Wrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])("div")({
  name: "Wrapper",
  class: "Wrapper_w1wf7dhi"
});
const TokenList = ({
  items,
  closeModal
}) => {
  if (!items) {
    return null;
  }

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Wrapper, null, items.map(token => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_TokenRow__WEBPACK_IMPORTED_MODULE_2__["TokenRow"], {
    key: token.address.toBase58(),
    token: token,
    closeModal: closeModal
  })));
};

__webpack_require__(/*! ../../../../../.linaria-cache/src/components/modals/AddCoinModal/TokenList/TokenList.linaria.css */ "./.linaria-cache/src/components/modals/AddCoinModal/TokenList/TokenList.linaria.css");

/***/ }),

/***/ "./src/components/modals/AddCoinModal/TokenList/index.ts":
/*!***************************************************************!*\
  !*** ./src/components/modals/AddCoinModal/TokenList/index.ts ***!
  \***************************************************************/
/*! exports provided: TokenList */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _TokenList__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TokenList */ "./src/components/modals/AddCoinModal/TokenList/TokenList.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TokenList", function() { return _TokenList__WEBPACK_IMPORTED_MODULE_0__["TokenList"]; });



/***/ }),

/***/ "./src/components/modals/AddCoinModal/TokenRow/TokenRow.tsx":
/*!******************************************************************!*\
  !*** ./src/components/modals/AddCoinModal/TokenRow/TokenRow.tsx ***!
  \******************************************************************/
/*! exports provided: TokenRow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TokenRow", function() { return TokenRow; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var _linaria_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @linaria/react */ "./node_modules/@linaria/react/esm/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _common_TokenAvatar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../common/TokenAvatar */ "./src/components/common/TokenAvatar/index.ts");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../ui */ "./src/components/ui/index.ts");
/* harmony import */ var _store_slices_wallet_WalletSlice__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../../store/slices/wallet/WalletSlice */ "./src/store/slices/wallet/WalletSlice.ts");







const Wrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Wrapper",
  class: "Wrapper_w2hsup5"
});
const ChevronWrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "ChevronWrapper",
  class: "ChevronWrapper_cjk37vx"
});
const ChevronIcon = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])(_ui__WEBPACK_IMPORTED_MODULE_5__["Icon"])({
  name: "ChevronIcon",
  class: "ChevronIcon_c1aewuyh"
});
const Main = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Main",
  class: "Main_m1x0i73s"
});
const Content = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Content",
  class: "Content_c1lrr91s"
});
const InfoWrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "InfoWrapper",
  class: "InfoWrapper_ifuaxgh"
});
const Info = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Info",
  class: "Info_isx2g64"
});
const Top = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Top",
  class: "Top_t10180ct"
});
const Bottom = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Bottom",
  class: "Bottom_b1idmxl7"
});
const Additional = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Additional",
  class: "Additional_a5vkidx"
});
const CopyWrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "CopyWrapper",
  class: "CopyWrapper_cjtzobz"
});
const CopyIcon = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])(_ui__WEBPACK_IMPORTED_MODULE_5__["Icon"])({
  name: "CopyIcon",
  class: "CopyIcon_cr7kpio"
});
const TokenRow = ({
  token,
  closeModal
}) => {
  const dispatch = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useDispatch"])(); // eslint-disable-next-line unicorn/no-null

  const inputRef = Object(react__WEBPACK_IMPORTED_MODULE_0__["useRef"])(null);
  const [isOpen, setIsOpen] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(false);

  const handleChevronClick = () => {
    setIsOpen(!isOpen);
  };

  const handleAddClick = async () => {
    await dispatch(Object(_store_slices_wallet_WalletSlice__WEBPACK_IMPORTED_MODULE_6__["createAccountForToken"])({
      token
    })); // dispatch(getOwnedTokenAccounts());

    closeModal();
  };

  const handleCopyClick = () => {
    const input = inputRef.current;

    if (input) {
      input.focus();
      input.setSelectionRange(0, input.value.length);
      document.execCommand('copy');
    }
  };

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Wrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ChevronWrapper, {
    onClick: handleChevronClick,
    className: classnames__WEBPACK_IMPORTED_MODULE_3___default()({
      opened: isOpen
    })
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ChevronIcon, {
    name: "chevron"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Main, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Content, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(InfoWrapper, {
    onClick: handleChevronClick
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_common_TokenAvatar__WEBPACK_IMPORTED_MODULE_4__["TokenAvatar"], {
    symbol: token.symbol,
    size: 44
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Info, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Top, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, token.symbol), " ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Bottom, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, token.name), " ", /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null)))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_ui__WEBPACK_IMPORTED_MODULE_5__["Button"], {
    primary: true,
    small: true,
    onClick: handleAddClick
  }, "Add")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Additional, {
    className: classnames__WEBPACK_IMPORTED_MODULE_3___default()({
      opened: isOpen
    })
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_ui__WEBPACK_IMPORTED_MODULE_5__["Input"], {
    ref: inputRef,
    title: `${token.symbol} Mint Address`,
    value: token.address.toBase58(),
    readOnly: true,
    postfix: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(CopyWrapper, {
      onClick: handleCopyClick
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(CopyIcon, {
      name: "copy"
    }))
  }))));
};

__webpack_require__(/*! ../../../../../.linaria-cache/src/components/modals/AddCoinModal/TokenRow/TokenRow.linaria.css */ "./.linaria-cache/src/components/modals/AddCoinModal/TokenRow/TokenRow.linaria.css");

/***/ }),

/***/ "./src/components/modals/AddCoinModal/TokenRow/index.ts":
/*!**************************************************************!*\
  !*** ./src/components/modals/AddCoinModal/TokenRow/index.ts ***!
  \**************************************************************/
/*! exports provided: TokenRow */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _TokenRow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TokenRow */ "./src/components/modals/AddCoinModal/TokenRow/TokenRow.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TokenRow", function() { return _TokenRow__WEBPACK_IMPORTED_MODULE_0__["TokenRow"]; });



/***/ }),

/***/ "./src/components/modals/AddCoinModal/index.ts":
/*!*****************************************************!*\
  !*** ./src/components/modals/AddCoinModal/index.ts ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _AddCoinModal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AddCoinModal */ "./src/components/modals/AddCoinModal/AddCoinModal.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _AddCoinModal__WEBPACK_IMPORTED_MODULE_0__["AddCoinModal"]; });

// eslint-disable-next-line import/no-default-export


/***/ })

}]);
//# sourceMappingURL=0.bundle.js.map