(this["webpackJsonp@p2p-wallet-web/web"]=this["webpackJsonp@p2p-wallet-web/web"]||[]).push([[9],{1375:function(e,t,n){},1376:function(e,t,n){"use strict";n.d(t,"a",(function(){return B}));var c=n(5),a=n(10),o=n(2),i=n(44),s=n(1380),r=n(183),l=n(57),b=n(1382),j=n(1381),u=n(1379),d=n.n(u),O=n(28),v=n.n(O),m=n(15),f=n(0),p=d()(.7,-.4,.4,1.4),h=Object(s.a)(b.a),x=Object(r.a)((function(e){var t=Object.assign({},e);return Object(f.jsx)(h,Object(a.a)({},t))}))({name:"StyledDialogContent",class:"stp2ewb",vars:{"stp2ewb-0":[function(e){return e.mobile?"scroll":"hidden"}]}}),y=Object(r.a)("div")({name:"Handle",class:"h17b9fu2"}),w=Object(r.a)("div")({name:"Header",class:"h7031l9"}),g=Object(r.a)("div")({name:"Delimiter",class:"dl0kydt"}),k=Object(r.a)("div")({name:"IconWrapper",class:"ivdh5pf"}),C=Object(r.a)(m.d)({name:"IconStyled",class:"i1cf8pa"}),D=Object(r.a)("div")({name:"Title",class:"tn185p9"}),N=Object(r.a)("div")({name:"Description",class:"d1b6gjod"}),S=Object(r.a)(m.d)({name:"CloseIcon",class:"c3pgt25"}),I=Object(r.a)("div")({name:"Content",class:"chwv75v"}),A=Object(r.a)("div")({name:"Footer",class:"f1xysusc"}),B=function(e){var t=e.title,n=e.description,r=e.footer,b=e.iconName,u=e.iconBgClassName,d=e.noDelimiter,O=e.close,m=e.doNotCloseOnPathChangeMobile,h=e.className,B=e.children,E=Object(o.useState)(!1),M=Object(c.a)(E,2),Y=M[0],F=M[1],H=Object(l.d)(),J=Object(i.i)(),L=Object(o.useRef)(J.pathname);Object(o.useEffect)((function(){H&&!m&&L.current!==J.pathname&&O()}),[H,m,J.pathname]),Object(o.useEffect)((function(){return F(!0),function(){F(!1)}}),[]);var P=Object(o.useMemo)((function(){return H?{config:{duration:600,easing:function(e){return p(e)}},from:{transform:"translateY(100px)"},enter:{transform:"translateX(0)"},leave:{transform:"translateY(100px)"}}:{}}),[H]),W=Object(s.c)(Y,null,P),q=Object(s.b)((function(){return{y:0,config:{mass:1,tension:210,friction:20}}})),R=Object(c.a)(q,2),T=R[0].y,U=R[1],X=Object(j.useDrag)((function(e){U({y:e.down?e.movement[1]:0}),(e.movement[1]>300||e.velocity[1]>3&&e.direction[1]>0)&&O()}));return Object(f.jsx)(f.Fragment,{children:W.map((function(e){var c=e.item,o=e.key,i=e.props;return c&&Object(f.jsxs)(x,Object(a.a)(Object(a.a)({},H?Object(a.a)(Object(a.a)({},X()),{},{style:Object(a.a)(Object(a.a)({},i),{},{transform:T.interpolate((function(e){return"translateY(".concat(e>0?e:0,"px)")}))})}):{style:i}),{},{"aria-label":"dialog",className:h,children:[H?Object(f.jsx)(y,{}):void 0,t||n?Object(f.jsxs)(w,{children:[t?Object(f.jsx)(D,{children:t}):void 0,n?Object(f.jsx)(N,{children:n}):void 0,H?void 0:Object(f.jsx)(S,{name:"cross",onClick:O})]}):void 0,d?void 0:Object(f.jsx)(g,{className:v()({hasIcon:Boolean(b)}),children:b?Object(f.jsx)(k,{className:u,children:Object(f.jsx)(C,{name:b})}):void 0}),B?Object(f.jsx)(I,{children:B}):void 0,r?Object(f.jsx)(A,{children:r}):void 0]}),o)}))})};n(1375)},1413:function(e,t,n){},1422:function(e,t,n){"use strict";n.r(t),n.d(t,"default",(function(){return u}));var c=n(44),a=n(23),o=n(24),i=n(1376),s=n(183),r=n(235),l=n(0),b=Object(s.a)("div")({name:"Wrapper",class:"w5lr7q8"}),j=function(e){var t=e.tokenAccount,n=e.onClick;return Object(l.jsx)(b,{onClick:n,children:Object(l.jsx)(r.a,{tokenAccount:t,isMobilePopupChild:!0})})};n(1413);var u=function(e){var t,n,s=e.close,r=Object(c.h)(),b=Object(c.i)(),u=Object(o.y)().tokenConfigs,d=Object(a.w)(null===(t=u.SOL)||void 0===t?void 0:t.mint),O=Object(a.w)(null===(n=u.USDC)||void 0===n?void 0:n.mint),v=Object(a.E)([d,O]),m=function(){s(!1)};return Object(l.jsx)(i.a,{noDelimiter:!1,close:m,title:"Choose a crypto for buying",children:v.map((function(e){var t;return Object(l.jsx)(j,{tokenAccount:e,onClick:function(){return function(e){var t;m();var n=(null===e||void 0===e||null===(t=e.balance)||void 0===t?void 0:t.token.symbol)||"SOL",c="/buy/".concat(n);b.pathname!==c&&r.push(c)}(e)}},null===e||void 0===e||null===(t=e.key)||void 0===t?void 0:t.toBase58())}))})}}}]);
//# sourceMappingURL=9.ec04db1e.chunk.js.map