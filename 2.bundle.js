(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[2],{

/***/ "./.linaria-cache/src/components/modals/TransactionDetailsModal/TransactionDetailsModal.linaria.css":
/*!**********************************************************************************************************!*\
  !*** ./.linaria-cache/src/components/modals/TransactionDetailsModal/TransactionDetailsModal.linaria.css ***!
  \**********************************************************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/components/modals/TransactionDetailsModal/TransactionDetailsModal.tsx":
/*!***********************************************************************************!*\
  !*** ./src/components/modals/TransactionDetailsModal/TransactionDetailsModal.tsx ***!
  \***********************************************************************************/
/*! exports provided: TransactionDetailsModal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TransactionDetailsModal", function() { return TransactionDetailsModal; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var _linaria_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @linaria/react */ "./node_modules/@linaria/react/esm/index.js");
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @reduxjs/toolkit */ "./node_modules/@reduxjs/toolkit/dist/redux-toolkit.esm.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! dayjs */ "./node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _api_transaction_Transaction__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../api/transaction/Transaction */ "./src/api/transaction/Transaction.ts");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../ui */ "./src/components/ui/index.ts");
/* harmony import */ var _store_slices_transaction_TransactionSlice__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../store/slices/transaction/TransactionSlice */ "./src/store/slices/transaction/TransactionSlice.ts");








const Wrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Wrapper",
  class: "Wrapper_w1tifgs8"
});
const Header = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Header",
  class: "Header_hyjm7t0"
});
const Title = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Title",
  class: "Title_t1ge91kj"
});
const CloseWrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "CloseWrapper",
  class: "CloseWrapper_c19v5yq5"
});
const CloseIcon = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])(_ui__WEBPACK_IMPORTED_MODULE_6__["Icon"])({
  name: "CloseIcon",
  class: "CloseIcon_c4q92ii"
});
const CircleWrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "CircleWrapper",
  class: "CircleWrapper_cn2thh8"
});
const ArrowAngleIcon = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])(_ui__WEBPACK_IMPORTED_MODULE_6__["Icon"])({
  name: "ArrowAngleIcon",
  class: "ArrowAngleIcon_a1d2ax1y"
});
const Content = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Content",
  class: "Content_c14kd5e9"
});
const StatusWrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "StatusWrapper",
  class: "StatusWrapper_s1qeiy73"
});
const Value = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Value",
  class: "Value_vwa4296"
});
const Status = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "Status",
  class: "Status_s11bohjs"
});
const FieldsWrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "FieldsWrapper",
  class: "FieldsWrapper_fiwc0bt"
});
const FieldWrapper = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "FieldWrapper",
  class: "FieldWrapper_f1n4mogn"
});
const FieldTitle = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "FieldTitle",
  class: "FieldTitle_f9aqzce"
});
const FieldValue = /*#__PURE__*/Object(_linaria_react__WEBPACK_IMPORTED_MODULE_2__["styled"])("div")({
  name: "FieldValue",
  class: "FieldValue_fuy8m85"
});
const TransactionDetailsModal = ({
  signature,
  close
}) => {
  var _transaction$short$so;

  const dispatch = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useDispatch"])();
  const transaction = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useSelector"])(state => state.transaction.items[signature] && _api_transaction_Transaction__WEBPACK_IMPORTED_MODULE_5__["Transaction"].from(state.transaction.items[signature]));
  Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(() => {
    const mount = async () => {
      const trx = Object(_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_3__["unwrapResult"])(await dispatch(Object(_store_slices_transaction_TransactionSlice__WEBPACK_IMPORTED_MODULE_7__["getTransaction"])(signature)));

      if (!trx) {
        setTimeout(mount, 3000);
      }
    };

    if (!transaction) {
      void mount();
    }
  }, [signature]);

  if (!transaction) {
    return null;
  }

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Wrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Header, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Title, {
    title: `${transaction.slot} SLOT`
  }, transaction.timestamp ? dayjs__WEBPACK_IMPORTED_MODULE_4___default.a.unix(transaction.timestamp).format('LLL') : `${transaction.slot} SLOT`), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(CloseWrapper, {
    onClick: close
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(CloseIcon, {
    name: "close"
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(CircleWrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ArrowAngleIcon, {
    name: "arrow-angle"
  }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Content, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(StatusWrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Value, null, transaction.short.amount.toNumber(), ' ', (_transaction$short$so = transaction.short.sourceTokenAccount) === null || _transaction$short$so === void 0 ? void 0 : _transaction$short$so.mint.symbol), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Status, null, "Completed")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldsWrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldWrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldTitle, null, "Transaction ID"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldValue, null, signature)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldWrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldTitle, null, "Amount"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldValue, null, transaction.short.amount.toNumber())), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldWrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldTitle, null, "Value"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldValue, null, transaction.short.amount.toNumber())), transaction.meta ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldWrapper, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldTitle, null, "Fee"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(FieldValue, null, transaction.meta.fee, " lamports")) : null)));
};

__webpack_require__(/*! ../../../../.linaria-cache/src/components/modals/TransactionDetailsModal/TransactionDetailsModal.linaria.css */ "./.linaria-cache/src/components/modals/TransactionDetailsModal/TransactionDetailsModal.linaria.css");

/***/ }),

/***/ "./src/components/modals/TransactionDetailsModal/index.ts":
/*!****************************************************************!*\
  !*** ./src/components/modals/TransactionDetailsModal/index.ts ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _TransactionDetailsModal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./TransactionDetailsModal */ "./src/components/modals/TransactionDetailsModal/TransactionDetailsModal.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _TransactionDetailsModal__WEBPACK_IMPORTED_MODULE_0__["TransactionDetailsModal"]; });

// eslint-disable-next-line import/no-default-export


/***/ })

}]);
//# sourceMappingURL=2.bundle.js.map