(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[1],{

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

/***/ "./.linaria-cache/src/components/modals/RecieveTokensModal/RecieveTokensModal.linaria.css":
/*!************************************************************************************************!*\
  !*** ./.linaria-cache/src/components/modals/RecieveTokensModal/RecieveTokensModal.linaria.css ***!
  \************************************************************************************************/
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

/***/ "./src/components/modals/RecieveTokensModal/RecieveTokensModal.tsx":
/*!*************************************************************************!*\
  !*** ./src/components/modals/RecieveTokensModal/RecieveTokensModal.tsx ***!
  \*************************************************************************/
/*! exports provided: RecieveTokensModal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RecieveTokensModal", function() { return RecieveTokensModal; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _linaria_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @linaria/react */ "./node_modules/@linaria/react/esm/index.js");
/* harmony import */ var _common_Modal__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../common/Modal */ "./src/components/common/Modal/index.ts");
/* harmony import */ var _common_QRAddressWidget__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../common/QRAddressWidget */ "./src/components/common/QRAddressWidget/index.ts");




const WrapperModal = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])(_common_Modal__WEBPACK_IMPORTED_MODULE_2__["Modal"])({
  name: "WrapperModal",
  class: "WrapperModal_w7vsqjw"
});
const Content = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_1__["styled"])("div")({
  name: "Content",
  class: "Content_c11d4nv2"
});
/* TODO: need to use QRAddressWidgetStyled but it cause build error */

/*
const QRAddressWidgetStyled = styled(QRAddressWidget)`
  background: #F0F0F0;
`;
 */

const RecieveTokensModal = ({
  publicKey,
  isSol,
  close
}) => {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(WrapperModal, {
    title: "Recieve tokens",
    close: close
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Content, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_common_QRAddressWidget__WEBPACK_IMPORTED_MODULE_3__["QRAddressWidget"], {
    publicKey: publicKey,
    isSol: isSol
  })));
};

__webpack_require__(/*! ../../../../.linaria-cache/src/components/modals/RecieveTokensModal/RecieveTokensModal.linaria.css */ "./.linaria-cache/src/components/modals/RecieveTokensModal/RecieveTokensModal.linaria.css");

/***/ }),

/***/ "./src/components/modals/RecieveTokensModal/index.ts":
/*!***********************************************************!*\
  !*** ./src/components/modals/RecieveTokensModal/index.ts ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _RecieveTokensModal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RecieveTokensModal */ "./src/components/modals/RecieveTokensModal/RecieveTokensModal.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _RecieveTokensModal__WEBPACK_IMPORTED_MODULE_0__["RecieveTokensModal"]; });

// eslint-disable-next-line import/no-default-export


/***/ })

}]);
//# sourceMappingURL=1.bundle.js.map