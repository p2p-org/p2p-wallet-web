(this["webpackJsonp@p2p-wallet-web/web"]=this["webpackJsonp@p2p-wallet-web/web"]||[]).push([[1],{1363:function(e,n,t){},1364:function(e,n,t){"use strict";t.d(n,"a",(function(){return N}));var c=t(5),a=t(11),s=t(2),r=t(44),i=t(1368),o=t(178),l=t(58),d=t(1370),u=t(1369),j=t(1367),b=t.n(j),m=t(27),O=t.n(m),f=t(14),v=t(0),p=b()(.7,-.4,.4,1.4),x=Object(i.a)(d.a),h=Object(o.a)((function(e){var n=Object.assign({},e);return Object(v.jsx)(x,Object(a.a)({},n))}))({name:"StyledDialogContent",class:"stp2ewb",vars:{"stp2ewb-0":[function(e){return e.mobile?"scroll":"hidden"}]}}),g=Object(o.a)("div")({name:"Handle",class:"h17b9fu2"}),w=Object(o.a)("div")({name:"Header",class:"h7031l9"}),k=Object(o.a)("div")({name:"Delimiter",class:"dl0kydt"}),S=Object(o.a)("div")({name:"IconWrapper",class:"ivdh5pf"}),y=Object(o.a)(f.d)({name:"IconStyled",class:"i1cf8pa"}),T=Object(o.a)("div")({name:"Title",class:"tn185p9"}),I=Object(o.a)("div")({name:"Description",class:"d1b6gjod"}),E=Object(o.a)(f.d)({name:"CloseIcon",class:"c3pgt25"}),A=Object(o.a)("div")({name:"Content",class:"chwv75v"}),C=Object(o.a)("div")({name:"Footer",class:"f1xysusc"}),N=function(e){var n=e.title,t=e.description,o=e.footer,d=e.iconName,j=e.iconBgClassName,b=e.noDelimiter,m=e.close,f=e.doNotCloseOnPathChangeMobile,x=e.className,N=e.children,W=Object(s.useState)(!1),P=Object(c.a)(W,2),B=P[0],D=P[1],z=Object(l.d)(),F=Object(r.i)(),U=Object(s.useRef)(F.pathname);Object(s.useEffect)((function(){z&&!f&&U.current!==F.pathname&&m()}),[z,f,F.pathname]),Object(s.useEffect)((function(){return D(!0),function(){D(!1)}}),[]);var q=Object(s.useMemo)((function(){return z?{config:{duration:600,easing:function(e){return p(e)}},from:{transform:"translateY(100px)"},enter:{transform:"translateX(0)"},leave:{transform:"translateY(100px)"}}:{}}),[z]),M=Object(i.c)(B,null,q),R=Object(i.b)((function(){return{y:0,config:{mass:1,tension:210,friction:20}}})),_=Object(c.a)(R,2),Y=_[0].y,G=_[1],H=Object(u.useDrag)((function(e){G({y:e.down?e.movement[1]:0}),(e.movement[1]>300||e.velocity[1]>3&&e.direction[1]>0)&&m()}));return Object(v.jsx)(v.Fragment,{children:M.map((function(e){var c=e.item,s=e.key,r=e.props;return c&&Object(v.jsxs)(h,Object(a.a)(Object(a.a)({},z?Object(a.a)(Object(a.a)({},H()),{},{style:Object(a.a)(Object(a.a)({},r),{},{transform:Y.interpolate((function(e){return"translateY(".concat(e>0?e:0,"px)")}))})}):{style:r}),{},{"aria-label":"dialog",className:x,children:[z?Object(v.jsx)(g,{}):void 0,n||t?Object(v.jsxs)(w,{children:[n?Object(v.jsx)(T,{children:n}):void 0,t?Object(v.jsx)(I,{children:t}):void 0,z?void 0:Object(v.jsx)(E,{name:"cross",onClick:m})]}):void 0,b?void 0:Object(v.jsx)(k,{className:O()({hasIcon:Boolean(d)}),children:d?Object(v.jsx)(S,{className:j,children:Object(v.jsx)(y,{name:d})}):void 0}),N?Object(v.jsx)(A,{children:N}):void 0,o?Object(v.jsx)(C,{children:o}):void 0]}),s)}))})};t(1363)},1366:function(e,n,t){"use strict";t.d(n,"s",(function(){return r})),t.d(n,"D",(function(){return i})),t.d(n,"n",(function(){return o})),t.d(n,"a",(function(){return l})),t.d(n,"m",(function(){return d})),t.d(n,"l",(function(){return u})),t.d(n,"z",(function(){return j})),t.d(n,"f",(function(){return b})),t.d(n,"d",(function(){return m})),t.d(n,"c",(function(){return O})),t.d(n,"A",(function(){return f})),t.d(n,"e",(function(){return v})),t.d(n,"p",(function(){return p})),t.d(n,"B",(function(){return x})),t.d(n,"C",(function(){return h})),t.d(n,"y",(function(){return g})),t.d(n,"v",(function(){return w})),t.d(n,"x",(function(){return k})),t.d(n,"u",(function(){return S})),t.d(n,"w",(function(){return y})),t.d(n,"t",(function(){return T})),t.d(n,"j",(function(){return I})),t.d(n,"i",(function(){return E})),t.d(n,"g",(function(){return A})),t.d(n,"h",(function(){return C})),t.d(n,"q",(function(){return N})),t.d(n,"r",(function(){return W})),t.d(n,"k",(function(){return P})),t.d(n,"b",(function(){return B})),t.d(n,"o",(function(){return D}));var c=t(178),a=t(14),s=t(1364),r=Object(c.a)("div")({name:"StatusColors",class:"s1oe2baa"}),i=Object(c.a)(s.a)({name:"WrapperModal",class:"w4f3mu3"}),o=Object(c.a)("div")({name:"ProgressWrapper",class:"p1i912uk"}),l=Object(c.a)(r)({name:"BlockWrapper",class:"bgkzfl6"}),d=Object(c.a)(a.d)({name:"OtherIcon",class:"o1yz84kj"}),u=Object(c.a)("div")({name:"Header",class:"h1iyn34x"}),j=Object(c.a)("div")({name:"Title",class:"tmn2tn4"}),b=Object(c.a)("div")({name:"Desc",class:"d177nl2c"}),m=Object(c.a)("div")({name:"CloseWrapper",class:"c1sha4fn"}),O=Object(c.a)(a.d)({name:"CloseIcon",class:"c1prpn3v"}),f=Object(c.a)(r)({name:"TransactionLabel",class:"t1wcgvvt"}),v=Object(c.a)("div")({name:"Content",class:"c1y267t2"}),p=Object(c.a)("div")({name:"SendWrapper",class:"s33wg3"}),x=Object(c.a)("div")({name:"ValueCurrency",class:"vd77she"}),h=Object(c.a)("div")({name:"ValueOriginal",class:"v19h1co8"}),g=Object(c.a)("div")({name:"SwapWrapper",class:"spgqtm3"}),w=Object(c.a)("div")({name:"SwapColumn",class:"spxj4if"}),k=Object(c.a)("div")({name:"SwapInfo",class:"s1733ag7"}),S=Object(c.a)("div")({name:"SwapBlock",class:"s1thhukn"}),y=Object(c.a)(a.d)({name:"SwapIcon",class:"srl1rem"}),T=Object(c.a)("div")({name:"SwapAmount",class:"siq91qb"}),I=Object(c.a)("div")({name:"FieldsWrapper",class:"f1i7cxvz"}),E=Object(c.a)("div")({name:"FieldWrapper",class:"f1g97ed6"}),A=Object(c.a)("div")({name:"FieldTitle",class:"f1r727wv"}),C=Object(c.a)("div")({name:"FieldValue",class:"f1uopwlq"}),N=Object(c.a)(a.d)({name:"ShareIcon",class:"svtky2j"}),W=Object(c.a)("div")({name:"ShareWrapper",class:"s4w9gxk"}),P=Object(c.a)("div")({name:"Footer",class:"fr8alv0"}),B=Object(c.a)(a.c)({name:"ButtonExplorer",class:"b1mpmgz6"}),D=Object(c.a)("div")({name:"Section",class:"srflw21"});t(1380)},1371:function(e,n,t){"use strict";t.d(n,"h",(function(){return s})),t.d(n,"a",(function(){return r})),t.d(n,"l",(function(){return i})),t.d(n,"c",(function(){return o})),t.d(n,"f",(function(){return l})),t.d(n,"d",(function(){return d})),t.d(n,"k",(function(){return u})),t.d(n,"j",(function(){return j})),t.d(n,"e",(function(){return b})),t.d(n,"i",(function(){return m})),t.d(n,"m",(function(){return O})),t.d(n,"b",(function(){return f})),t.d(n,"g",(function(){return v}));var c=t(178),a=t(14),s=Object(c.a)("div")({name:"Section",class:"sxfy27d"}),r=Object(c.a)("div")({name:"FieldInfo",class:"f1iduq9w"}),i=Object(c.a)(a.d)({name:"WalletIcon",class:"w1hlmgol"}),o=Object(c.a)("div")({name:"IconWrapper",class:"i9bufhm"}),l=Object(c.a)("div")({name:"InfoWrapper",class:"ivnnc45"}),d=Object(c.a)("div")({name:"InfoTitle",class:"icxt4d5"}),u=Object(c.a)(d)({name:"Username",class:"ui6fe90"}),j=Object(c.a)("span")({name:"To",class:"txjo5xz"}),b=Object(c.a)("div")({name:"InfoValue",class:"i1yjs7sp"}),m=Object(c.a)("div")({name:"Subtitle",class:"s19nrvyc"}),O=Object(c.a)("div")({name:"Wrapper",class:"w1fipug1"}),f=Object(c.a)("div")({name:"FromToWrapper",class:"f1t28dbd"}),v=Object(c.a)("div")({name:"Overlay",class:"o91hs7v"});t(1377)},1373:function(e,n,t){"use strict";t.d(n,"a",(function(){return p}));var c=t(178),a=t(226),s=t(168),r=t(74),i=t(187),o=t(14),l=t(225),d=t(64),u=t(0),j=Object(c.a)("div")({name:"TokenAndUsd",class:"t1dpujm0"}),b=function(e){var n,t,c,a,s,r,b=e.sendState,m=e.amount;return Object(u.jsxs)(o.a,{title:Object(u.jsx)(l.a,{title:"Transaction details",titleBottomName:"Total",titleBottomValue:(null===b||void 0===b?void 0:b.details.totalAmount)||""}),open:!1,noContentPadding:!0,children:[Object(u.jsx)(d.a,{children:Object(u.jsxs)(d.b,{children:[Object(u.jsx)(d.c,{className:"gray",children:"Receive"}),Object(u.jsxs)(j,{children:[Object(u.jsx)(d.c,{children:null===b||void 0===b?void 0:b.details.receiveAmount}),Object(u.jsx)(i.b,{prefix:"(~",postfix:")",amount:(null===b||void 0===b||null===(n=b.parsedAmount)||void 0===n?void 0:n.toU64())||m,tokenName:null===b||void 0===b||null===(t=b.fromTokenAccount)||void 0===t||null===(c=t.balance)||void 0===c?void 0:c.token.symbol})]})]})}),Object(u.jsx)(d.a,{className:"total",children:Object(u.jsxs)(d.b,{children:[Object(u.jsx)(d.c,{children:"Total"}),Object(u.jsxs)(j,{children:[Object(u.jsx)(d.c,{children:null===b||void 0===b?void 0:b.details.totalAmount}),Object(u.jsx)(i.b,{prefix:"(~",postfix:")",amount:(null===b||void 0===b||null===(a=b.parsedAmount)||void 0===a?void 0:a.toU64())||m,tokenName:null===b||void 0===b||null===(s=b.fromTokenAccount)||void 0===s||null===(r=s.balance)||void 0===r?void 0:r.token.symbol})]})]})})]})};t(1378);var m=t(1371),O=Object(c.a)("div")({name:"ArrowWrapper",class:"a86hbkb"}),f=Object(c.a)("div")({name:"ArrowIconWrapper",class:"a1j2sz5p"}),v=Object(c.a)(o.d)({name:"ArrowIcon",class:"a1yaxcc8"}),p=function(e){var n,t,c,i,o=e.params,l=e.sendState,d=e.btcAddress,j=(null===(n=o.destination)||void 0===n||null===(t=n.toBase58)||void 0===t?void 0:t.call(n))||d,p=/\w*\.\w+/.test(o.username||"");return Object(u.jsxs)(m.h,{className:"send",children:[Object(u.jsxs)("div",{children:[Object(u.jsxs)(m.a,{children:[Object(u.jsx)(r.a,{symbol:null===(c=o.source.balance)||void 0===c?void 0:c.token.symbol,address:null===(i=o.source.balance)||void 0===i?void 0:i.token.address,size:44}),Object(u.jsxs)(m.f,{children:[Object(u.jsx)(m.d,{children:o.amount.formatUnits()}),Object(u.jsx)(m.e,{children:Object(u.jsx)(s.a,{value:o.amount})})]})]}),Object(u.jsx)(O,{children:Object(u.jsx)(f,{children:Object(u.jsx)(v,{name:"arrow-down"})})}),Object(u.jsxs)(m.a,{children:[Object(u.jsx)(m.c,{children:Object(u.jsx)(m.l,{name:"wallet"})}),Object(u.jsxs)(m.f,{children:[o.username?Object(u.jsxs)(m.k,{children:[Object(u.jsx)(m.j,{children:"To"}),p?o.username:"".concat(o.username,".p2p.sol")]}):Object(u.jsx)(m.d,{className:"secondary",children:"To address"}),Object(u.jsx)(m.e,{children:j&&Object(u.jsx)(a.a,{address:j,medium:!0})})]})]})]}),Object(u.jsx)(b,{sendState:l,amount:o.amount.toU64()})]})};t(1379)},1377:function(e,n,t){},1378:function(e,n,t){},1379:function(e,n,t){},1380:function(e,n,t){},1386:function(e,n,t){"use strict";t.d(n,"a",(function(){return l})),t.d(n,"b",(function(){return p})),t.d(n,"c",(function(){return C}));var c=t(178),a=t(304),s=t.n(a),r=t(0),i=Object(c.a)("div")({name:"Time",class:"t12rdzu9"}),o=Object(c.a)("div")({name:"DateHeaderWrapper",class:"d15mtekj"}),l=function(){var e=new Date,n=e.getHours()-e.getUTCHours();return Object(r.jsxs)(o,{children:[Object(r.jsx)("span",{children:s()().format("MMMM D, YYYY")}),Object(r.jsx)(i,{children:s()().format("hh:mm:ss")}),Object(r.jsxs)("span",{children:["(UTC",n>=0?"+":"-",n,")"]})]})};t(1396);var d=t(27),u=t.n(d),j=t(14),b=t(35),m=t(276),O=t(1366),f=Object(c.a)(j.d)({name:"GoToExplorerIcon",class:"g9bcl9u"}),v=Object(c.a)("a")({name:"GoToExplorerLink",class:"g1h0srjo"}),p=function(e){return Object(r.jsx)(O.k,{children:Object(r.jsxs)(v,{href:e.signature?Object(m.a)("tx",e.signature,e.network):"",target:"_blank",rel:"noopener noreferrer noindex",onClick:function(){Object(b.c)(e.amplitudeAction)},className:u()({isDisabled:!e.signature}),children:[Object(r.jsx)(f,{name:"external"}),"View in Solana explorer"]})})};t(1397);var x=t(5),h=t(2),g=t(58),w=t(1403),k=Object(c.a)(j.d)({name:"ProgressIcon",class:"psvdukr"}),S=Object(c.a)("div")({name:"TransactionStatus",class:"tmzguch"}),y=Object(c.a)("div")({name:"TransactionBadge",class:"t1v39w5"}),T=Object(c.a)("div")({name:"ProgressWrapper",class:"pb0xeb0"}),I=Object(c.a)("div")({name:"ProgressLine",class:"p195jhxp"}),E=Object(c.a)("div")({name:"ProgressStub",class:"p1u3sisq",vars:{"p1u3sisq-0":[g.f.bottom]}}),A=Object(c.a)(O.s)({name:"BlockWrapper",class:"b1pz7toa"}),C=function(e){var n=Object(h.useState)(w.INITIAL_PROGRESS),t=Object(x.a)(n,2),c=t[0],a=t[1];Object(h.useEffect)((function(){var n=w.INITIAL_PROGRESS;if(e.isExecuting){var t=setInterval((function(){a(c<=95?n+=7:n=95)}),2500);return function(){clearTimeout(t),a(100)}}}),[e.isExecuting]);return Object(r.jsxs)(r.Fragment,{children:[Object(r.jsxs)(T,{children:[Object(r.jsx)(I,{style:{width:"".concat(c,"%")},className:u()({isSuccess:e.isSuccess,isError:e.isError})}),Object(r.jsx)(E,{}),Object(r.jsx)(A,{className:u()({isProcessing:e.isProcessing,isSuccess:e.isSuccess,isError:e.isError}),children:e.isSuccess?Object(r.jsx)(k,{name:"success-send"}):Object(r.jsx)(k,{name:e.isError?"error-send":"clock-send"})})]}),Object(r.jsxs)(S,{children:[e.label,Object(r.jsxs)(y,{children:[Object(r.jsx)(O.A,{className:u()({isProcessing:e.isProcessing,isSuccess:e.isSuccess,isError:e.isError})}),function(e,n,t){switch(!0){case e:return"Pending";case t:return"Error";case n:return"Completed";default:return"Pending"}}(e.isExecuting,e.isSuccess,e.isError)]})]})]})};t(1398)},1396:function(e,n,t){},1397:function(e,n,t){},1398:function(e,n,t){},1403:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return x})),t.d(n,"INITIAL_PROGRESS",(function(){return v})),t.d(n,"TransactionStatusSendModal",(function(){return x}));var c=t(4),a=t(5),s=t(1),r=t.n(s),i=t(2),o=t(24),l=t(88),d=t(79),u=t(35),j=t(290),b=t(1373),m=t(1386),O=t(1366),f=t(0),v=5,p="Transaction error",x=function(e){var n,t,s=e.type,v=e.action,x=e.params,h=e.sendState,g=e.close,w=Object(o.G)().provider,k=Object(l.e)().network,S=Object(i.useState)(!1),y=Object(a.a)(S,2),T=y[0],I=y[1],E=Object(i.useState)(null),A=Object(a.a)(E,2),C=A[0],N=A[1],W=Object(o.B)(C),P=Object(i.useState)(null!==W&&void 0!==W&&null!==(n=W.raw)&&void 0!==n&&null!==(t=n.meta)&&void 0!==t&&t.err?p:""),B=Object(a.a)(P,2),D=B[0],z=B[1],F=function(){var e=Object(c.a)(r.a.mark((function e(){var n;return r.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:e.prev=0,I(!0),e.t0=s,e.next="send"===e.t0?5:11;break;case 5:return e.next=7,v();case 7:return n=e.sent,N(n),Object(j.b)({header:"Sent",text:"- ".concat(x.amount.formatUnits()),symbol:x.amount.token.symbol}),e.abrupt("break",12);case 11:throw new Error("Wrong type");case 12:e.next=18;break;case 14:e.prev=14,e.t1=e.catch(0),I(!1),"send"===s&&(d.b.error(s,e.t1.message),z(p));case 18:case"end":return e.stop()}}),e,null,[[0,14]])})));return function(){return e.apply(this,arguments)}}();Object(i.useEffect)((function(){F()}),[]),Object(i.useEffect)((function(){var e=function(){var n=Object(c.a)(r.a.mark((function n(){var t,c;return r.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(C){n.next=2;break}return n.abrupt("return");case 2:return n.prev=2,n.next=5,w.connection.getTransaction(C,{commitment:"confirmed"});case 5:(t=n.sent)?null!==(c=t.meta)&&void 0!==c&&c.err?z(p):D&&z(""):setTimeout(e,3e3),n.next=12;break;case 9:n.prev=9,n.t0=n.catch(2),d.b.error(n.t0.message);case 12:return n.prev=12,I(!1),n.finish(12);case 15:case"end":return n.stop()}}),n,null,[[2,9,12,15]])})));return function(){return n.apply(this,arguments)}}();e()}),[C]);var U=(!C||!(null!==W&&void 0!==W&&W.key))&&!D,q=Boolean(C&&(null===W||void 0===W?void 0:W.key)&&!D),M=Boolean(D),R=null===h||void 0===h?void 0:h.destinationAddress.replace(null===h||void 0===h?void 0:h.destinationAddress.substring(4,(null===h||void 0===h?void 0:h.destinationAddress.length)-4),"..."),_=function(){Object(u.b)("send_close_click",{transactionConfirmed:!T}),g(C)};return Object(f.jsxs)(O.D,{close:_,children:[Object(f.jsx)(O.o,{children:Object(f.jsxs)(O.l,{children:[x.amount.token.symbol," \u2192 ",R,Object(f.jsx)(O.d,{onClick:_,children:Object(f.jsx)(O.c,{name:"close"})}),Object(f.jsx)(m.a,{})]})}),Object(f.jsx)(m.c,{isError:M,isProcessing:U,isSuccess:q,isExecuting:T,label:"Transaction status:"}),Object(f.jsx)(O.o,{children:Object(f.jsx)(b.a,{sendState:h,params:x})}),Object(f.jsx)(m.b,{signature:C,network:k,amplitudeAction:{name:"send_explorer_click",data:{transactionConfirmed:!T}}})]})}}}]);
//# sourceMappingURL=1.d7734708.chunk.js.map