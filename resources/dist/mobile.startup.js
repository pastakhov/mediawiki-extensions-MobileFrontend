this.mfModules=this.mfModules||{},this.mfModules["mobile.startup"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{"./src/mobile.startup/OverlayManager.js":function(e,t,r){var n=r("./src/mobile.startup/util.js"),s=null;function i(e,t){e.on("route",this._checkRoute.bind(this)),this.router=e,this.entries={},this.stack=[],this.hideCurrent=!0,t||mw.log.warn("appendToSelector will soon be a required parameter to OverlayManager"),this.appendToSelector=t||"body"}r("./src/mobile.startup/mfExtend.js")(i,{_onHideOverlay:function(){this.hideCurrent=!1,this.router.back()},_attachOverlay:function(e){e.$el.parents().length||$(this.appendToSelector).append(e.$el)},_show:function(e){e.once("_om_hide",this._onHideOverlay.bind(this)),this._attachOverlay(e),e.show()},_hideOverlay:function(e){var t;return e.off("_om_hide"),(t=e.hide(this.stack.length>1))||e.once("_om_hide",this._onHideOverlay.bind(this)),t},_processMatch:function(e){var t,r=this;function n(e){e.on("hide",function(){e.emit("_om_hide")})}e&&(e.overlay?r._show(e.overlay):"function"==typeof(t=e.factoryResult).promise?t.then(function(t){e.overlay=t,n(t),r._show(t)}):(e.overlay=t,n(e.overlay),r._show(t)))},_checkRoute:function(e){var t,r=this.stack[0];r||(this.scrollTop=window.pageYOffset),t=Object.keys(this.entries).reduce(function(t,r){return t||this._matchRoute(e.path,this.entries[r])}.bind(this),null),r&&void 0!==r.overlay&&this.hideCurrent&&!this._hideOverlay(r.overlay)?e.preventDefault():t||(this.stack=[],window.scrollTo(window.pageXOffset,this.scrollTop)),this.hideCurrent=!0,this._processMatch(t)},_matchRoute:function(e,t){var r,n=e.match(t.route),s=this.stack[1],i=this;function a(){return{path:e,factoryResult:t.factory.apply(i,n.slice(1))}}return n?s&&s.path===e?s.overlay&&s.overlay.hasLoadError?(i.stack.shift(),i.stack[0]=a(),i.stack[0]):(i.stack.shift(),s):(r=a(),this.stack[0]&&r.path===this.stack[0].path?i.stack[0]=r:i.stack.unshift(r),r):null},add:function(e,t){var r=this,s={route:e,factory:t};this.entries[e]=s,n.docReady(function(){r._processMatch(r._matchRoute(r.router.getPath(),s))})},replaceCurrent:function(e){if(0===this.stack.length)throw new Error("Trying to replace OverlayManager's current overlay, but stack is empty");this._hideOverlay(this.stack[0].overlay),this.stack[0].overlay=e,this._show(e)}}),i.getSingleton=function(){return s||(s=new i(mw.loader.require("mediawiki.router"),"body")),s},e.exports=i},"./src/mobile.startup/PageGateway.js":function(e,t,r){var n=mw.template.get("mobile.startup","Section.hogan"),s=r("./src/mobile.startup/util.js"),i=r("./src/mobile.startup/actionParams.js"),a={};function o(e){var t,r=e.map(function(e){return e.level}).filter(function(e){return!!e}),s=Math.min.apply(this,r).toString(),i=[];return e.forEach(function(e){void 0!==e.line&&(e.line=e.line.replace(/<\/?a\b[^>]*>/g,"")),e.subsections=[],!t||!e.level||e.level===s||t.subsections.length&&t.subsections[0].level>e.level||t.level&&t.level>=e.level?(i.push(e),t=e):(!function e(t,r){var n;0===t.length?t.push(r):(n=t[t.length-1],parseInt(n.level,10)===parseInt(r.level,10)?t.push(r):e(n.subsections,r))}(t.subsections,e),t.text+=n.render(e))}),i}function c(e){this.api=e}c.prototype={getPage:function(e,t,r){var n,c=s.Deferred(),l=t?{url:t,dataType:"jsonp"}:{},u={edit:["*"]};return s.extend(l,i({action:"mobileview",page:e,variant:mw.config.get("wgPageContentLanguage"),redirect:"yes",prop:"id|sections|text|lastmodified|lastmodifiedby|languagecount|hasvariants|protection|displaytitle|revision",noheadings:"yes",sectionprop:"level|line|anchor",sections:r?0:"all"})),a[e]||(a[e]=this.api.get(l).then(function(t){var r,i,a,l;return t.error?c.reject(t.error):t.mobileview.sections?(r=o((l=t.mobileview).sections),n=new Date(l.lastmodified).getTime()/1e3,i=l.lastmodifiedby,u=Array.isArray(l.protection)?u:s.extend(u,l.protection),a={title:e,id:l.id,revId:l.revId,protection:u,lead:r[0].text,sections:r.slice(1),isMainPage:void 0!==l.mainpage,historyUrl:mw.util.getUrl(e,{action:"history"}),lastModifiedTimestamp:n,languageCount:l.languagecount,hasVariants:void 0!==l.hasvariants,displayTitle:l.displaytitle},i&&s.extend(a,{lastModifiedUserName:i.name,lastModifiedUserGender:i.gender}),a):c.reject("No sections")},function(e){return c.reject(e)})),a[e]},invalidatePage:function(e){delete a[e]},_getLanguageVariantsFromApiResponse:function(e,t){var r=t.query.general,n=r.variantarticlepath,s=[];return!!r.variants&&(Object.keys(r.variants).forEach(function(t){var i=r.variants[t],a={autonym:i.name,lang:i.code};a.url=n?n.replace("$1",e).replace("$2",i.code):mw.util.getUrl(e,{variant:i.code}),s.push(a)}),s)},getPageLanguages:function(e,t){var r=this,n=i({meta:"siteinfo",siprop:"general",prop:"langlinks",lllimit:"max",titles:e});return t?(n.llprop="url|autonym|langname",n.llinlanguagecode=t):n.llprop="url|autonym",this.api.get(n).then(function(t){return{languages:t.query.pages[0].langlinks||[],variants:r._getLanguageVariantsFromApiResponse(e,t)}},function(){return s.Deferred().reject()})},_getAPIResponseFromHTML:function(e){var t=[];return e.find("h1,h2,h3,h4,h5,h6").each(function(){var r=this.tagName.substr(1),n=e.find(this).find(".mw-headline");n.length&&t.push({level:r,line:n.html(),anchor:n.attr("id")||"",text:""})}),t},getSectionsFromHTML:function(e){return o(this._getAPIResponseFromHTML(e))}},e.exports=c},"./src/mobile.startup/Skin.js":function(e,t,r){var n=r("./src/mobile.startup/Browser.js").getSingleton(),s=r("./src/mobile.startup/View.js"),i=r("./src/mobile.startup/util.js"),a=r("./src/mobile.startup/Page.js"),o=i.Deferred,c=i.when,l=r("./src/mobile.startup/icons.js"),u=mw.viewport,h=l.spinner();function m(e){var t,r=a.HEADING_SELECTOR,n=e.parent(),s=e.prevAll(r).eq(0);return s.length&&(t=s.find(".mw-headline").attr("id"))?t:n.length?m(n):null}function p(e){var t=this,r=i.extend({},e);this.page=r.page,this.name=r.name,r.mainMenu&&(this.mainMenu=r.mainMenu,mw.log.warn("Skin: Use of mainMenu is deprecated.")),this.eventBus=r.eventBus,r.isBorderBox=!1,s.call(this,r),this.referencesGateway=r.referencesGateway,mw.config.get("wgMFLazyLoadImages")&&i.docReady(function(){t.setupImageLoading()}),mw.config.get("wgMFLazyLoadReferences")&&this.eventBus.on("before-section-toggled",this.lazyLoadReferences.bind(this))}r("./src/mobile.startup/mfExtend.js")(p,s,{defaults:{page:void 0},events:{},postRender:function(){var e=this.$el;n.supportsAnimations()&&e.addClass("animations"),n.supportsTouchEvents()&&e.addClass("touch-events"),i.parseHTML('<div class="transparent-shield cloaked-element">').appendTo(e.find("#mw-mf-page-center")),this.emit("changed"),this.$("#mw-mf-page-center").on("click",this.emit.bind(this,"click"))},getUnloadedImages:function(e){return(e=e||this.$("#content")).find(".lazy-image-placeholder").toArray()},setupImageLoading:function(e){var t=this,r=1.5*i.getWindow().height(),n=this.loadImagesList.bind(this),s=this.getUnloadedImages(e);function a(){var e=[];return(s=i.grep(s,function(n){var s=t.$(n);return!s.length||!function(e){return u.isElementCloseToViewport(e[0],r)&&(e.is(":visible")||0===e.height())}(s)||(e.push(n),!1)})).length||(t.eventBus.off("scroll:throttled",a),t.eventBus.off("resize:throttled",a),t.eventBus.off("section-toggled",a),t.off("changed",a)),n(e)}return this.eventBus.on("scroll:throttled",a),this.eventBus.on("resize:throttled",a),this.eventBus.on("section-toggled",a),this.on("changed",a),a()},loadImagesList:function(e){var t,r=this.$.bind(this),n=this.loadImage.bind(this);return t=(e=e||this.getUnloadedImages()).map(function(e){return n(r(e))}),c.apply(null,t)},loadImage:function(e){var t=o(),r=e.attr("data-width"),n=e.attr("data-height"),s=i.parseHTML("<img>",this.$el[0].ownerDocument);return s.on("load",function(){s.addClass("image-lazy-loaded"),e.replaceWith(s),t.resolve()}),s.on("error",function(){t.reject()}),s.attr({class:e.attr("data-class"),width:r,height:n,src:e.attr("data-src"),alt:e.attr("data-alt"),style:e.attr("style"),srcset:e.attr("data-srcset")}),t},lazyLoadReferences:function(e){var t,r,n=this.referencesGateway,s=this.getUnloadedImages.bind(this),i=this.loadImagesList.bind(this),a=this;if(!e.wasExpanded&&e.isReferenceSection)return(t=e.$heading.next()).data("are-references-loaded")?o().reject().promise():(t.children().addClass("hidden"),r=h.$el.prependTo(t),n.getReferencesLists(e.page).then(function(){var s;t.find(".mf-lazy-references-placeholder").each(function(){var r=0,i=t.find(this),a=m(i);s!==a?(r=0,s=a):r++,a&&n.getReferencesList(e.page,a).then(function(e){e&&e[r]&&i.replaceWith(e[r])})}),r.remove(),t.children().removeClass("hidden"),a.emit("references-loaded",a.page),c()},function(){r.remove(),t.children().removeClass("hidden"),c()}));function c(){i(s(t)),t.data("are-references-loaded",1)}},getLicenseMsg:function(){var e,t=mw.config.get("wgMFLicense"),r=mw.language.convertNumber(t.plural);return t.link&&(e=this.$("#footer-places-terms-use").length>0?mw.msg("mobile-frontend-editor-licensing-with-terms",mw.message("mobile-frontend-editor-terms-link",this.$("#footer-places-terms-use a").attr("href")).parse(),t.link,r):mw.msg("mobile-frontend-editor-licensing",t.link,r)),e}}),p.getSectionId=m,e.exports=p},"./src/mobile.startup/Toggler.js":function(e,t,r){var n=r("./src/mobile.startup/Browser.js").getSingleton(),s=r("./src/mobile.startup/util.js"),i=s.escapeHash,a={name:"arrow",additionalClassNames:"indicator"},o=r("./src/mobile.startup/Icon.js");function c(e){this.eventBus=e.eventBus,this._enable(e.$container,e.prefix,e.page,e.isClosed)}function l(e){var t=JSON.parse(mw.storage.get("expandedSections")||"{}");return t[e.title]=t[e.title]||{},t}function u(e){mw.storage.set("expandedSections",JSON.stringify(e))}function h(e,t,r){var n,s,i=l(r);t.find(".section-heading span").each(function(){s=t.find(this),n=s.parents(".section-heading"),i[r.title][s.attr("id")]&&!n.hasClass("open-block")&&e.toggle(n,r)})}function m(e){var t=(new Date).getTime(),r=l(e);Object.keys(r).forEach(function(e){var n=r[e];Object.keys(n).forEach(function(s){var i=n[s];Math.floor((t-i)/1e3/60/60/24)>=1&&delete r[e][s]})}),u(r)}c.prototype.toggle=function(e){var t,r=e.is(".open-block"),s=e.data("page"),i=e.data("section-number"),c=e.next();e.toggleClass("open-block"),e.data("indicator").remove(),a.rotation=r?0:180,t=new o(a).prependTo(e),e.data("indicator",t),this.eventBus.emit("before-section-toggled",{page:s,wasExpanded:r,$heading:e,isReferenceSection:Boolean(c.attr("data-is-reference-section"))}),c.toggleClass("open-block").attr({"aria-pressed":!r,"aria-expanded":!r}),this.eventBus.emit("section-toggled",r,i),n.isWideScreen()||function(e,t){var r=e.find("span").attr("id"),n=e.hasClass("open-block"),s=l(t);r&&(n?s[t.title][r]=(new Date).getTime():delete s[t.title][r],u(s))}(e,s)},c.prototype.reveal=function(e,t){var r,n;try{(n=(r=t.find(i(e))).parents(".collapsible-heading")).length||(n=r.parents(".collapsible-block").prev(".collapsible-heading")),n.length&&!n.hasClass("open-block")&&this.toggle(n),n.length&&window.scrollTo(0,r.offset().top)}catch(e){}},c.prototype._enable=function(e,t,r,i){var c,l,u,p,d,f=this,g=mw.config.get("wgMFCollapseSectionsByDefault");function b(){var t=window.location.hash;0===t.indexOf("#")&&f.reveal(t,e)}c=e.find("> h1,> h2,> h3,> h4,> h5,> h6,.section-heading").eq(0).prop("tagName")||"H1",void 0===g&&(g=!0),l=!g||mw.config.get("wgMFExpandAllSectionsUserOption")&&"true"===mw.storage.get("expandSections"),e.children(c).each(function(s){var c,h=e.find(this),m=h.find(".indicator"),d=t+"collapsible-block-"+s;h.next().is("div")&&(p=h.next("div"),c=Boolean(p.attr("data-is-reference-section")),h.addClass("collapsible-heading ").data("section-number",s).data("page",r).attr({tabindex:0,"aria-haspopup":"true","aria-controls":d}).on("click",function(e){e.target.href||(e.preventDefault(),f.toggle(h))}),a.rotation=l?180:0,u=new o(a),m.length?m.replaceWith(u.$el):u.prependTo(h),h.data("indicator",u.$el),p.addClass("collapsible-block").eq(0).attr({id:d,"aria-pressed":"false","aria-expanded":"false"}),function(e,t){t.on("keypress",function(r){13!==r.which&&32!==r.which||e.toggle(t)}).find("a").on("keypress mouseup",function(e){e.stopPropagation()})}(f,h),!c&&(!i&&n.isWideScreen()||l)&&f.toggle(h))}),function(){var t=mw.config.get("wgInternalRedirectTargetUrl"),r=!!t&&t.split("#")[1];r&&(window.location.hash=r,f.reveal(r,e))}(),b(),(d=e.find("a:not(.reference a)")).on("click",function(){void 0!==d.attr("href")&&d.attr("href").indexOf("#")>-1&&b()}),s.getWindow().on("hashchange",function(){b()}),!n.isWideScreen()&&r&&(h(this,e,r),m(r))},c._getExpandedSections=l,c._expandStoredSections=h,c._cleanObsoleteStoredSections=m,e.exports=c},"./src/mobile.startup/cache.js":function(e,t){function r(){this._cache={}}function n(){}r.prototype.get=function(e){return this._cache[e]},r.prototype.set=function(e,t){this._cache[e]=t},n.prototype.get=function(){},n.prototype.set=function(){},e.exports={MemoryCache:r,NoCache:n}},"./src/mobile.startup/context.js":function(e,t){e.exports={getMode:function(){return mw.config.get("wgMFMode")}}},"./src/mobile.startup/loadingOverlay.js":function(e,t,r){var n=r("./src/mobile.startup/icons.js"),s=r("./src/mobile.startup/Overlay.js");e.exports=function(){var e=new s({className:"overlay overlay-loading",noHeader:!0});return n.spinner().$el.appendTo(e.$(".overlay-content")),e}},"./src/mobile.startup/mobile.startup.js":function(e,t,r){var n=r("./src/mobile.startup/moduleLoaderSingleton.js"),s=r("./src/mobile.startup/mfExtend.js"),i=r("./src/mobile.startup/context.js"),a=r("./src/mobile.startup/time.js"),o=r("./src/mobile.startup/actionParams.js"),c=r("./src/mobile.startup/util.js"),l=r("./src/mobile.startup/View.js"),u=r("./src/mobile.startup/PageGateway.js"),h=r("./src/mobile.startup/Browser.js"),m=r("./src/mobile.startup/cache.js"),p=r("./src/mobile.startup/Button.js"),d=r("./src/mobile.startup/Icon.js"),f=r("./src/mobile.startup/references/ReferencesDrawer.js"),g=r("./src/mobile.startup/references/ReferencesGateway.js"),b=r("./src/mobile.startup/references/ReferencesHtmlScraperGateway.js"),w=r("./src/mobile.startup/references/ReferencesMobileViewGateway.js"),v=r("./src/mobile.startup/icons.js"),y=r("./src/mobile.startup/Panel.js"),S=r("./src/mobile.startup/Section.js"),j=r("./src/mobile.startup/Thumbnail.js"),k=r("./src/mobile.startup/Page.js"),R=r("./src/mobile.startup/Anchor.js"),x=r("./src/mobile.startup/Skin.js"),C=r("./src/mobile.startup/OverlayManager.js"),T=r("./src/mobile.startup/Overlay.js"),O=r("./src/mobile.startup/loadingOverlay.js"),M=r("./src/mobile.startup/Drawer.js"),$=r("./src/mobile.startup/CtaDrawer.js"),_=r("./src/mobile.startup/PageList.js"),F=r("./src/mobile.startup/toast.js"),L=r("./src/mobile.startup/extendSearchParams.js"),E=r("./src/mobile.startup/watchstar/Watchstar.js"),I=r("./src/mobile.startup/watchstar/WatchstarPageList.js"),D=r("./src/mobile.startup/rlModuleLoader.js"),P=r("./src/mobile.startup/eventBusSingleton.js"),B=r("./src/mobile.startup/Toggler.js"),H=r("./src/mobile.startup/search/SearchOverlay.js"),N=r("./src/mobile.startup/search/schemaMobileWebSearch.js"),G=r("./src/mobile.startup/search/MobileWebSearchLogger.js"),W=r("./src/mobile.startup/search/SearchGateway.js"),A=r("./src/mobile.startup/ScrollEndEventEmitter.js");mw.mobileFrontend=n,OO.mfExtend=s,mw.mobileFrontend.define("mobile.startup/util",c),mw.mobileFrontend.define("mobile.startup/View",l),mw.mobileFrontend.define("mobile.startup/Browser",h),mw.mobileFrontend.define("mobile.startup/cache",m),mw.mobileFrontend.define("mobile.startup/time",a),mw.mobileFrontend.define("mobile.startup/context",i),mw.mobileFrontend.define("mobile.startup/PageGateway",u),mw.mobileFrontend.define("mobile.startup/Button",p),mw.mobileFrontend.define("mobile.startup/Icon",d),mw.mobileFrontend.define("mobile.startup/icons",v),mw.mobileFrontend.define("mobile.startup/Panel",y),mw.mobileFrontend.define("mobile.startup/Section",S),mw.mobileFrontend.define("mobile.startup/Thumbnail",j),mw.mobileFrontend.define("mobile.startup/Page",k),mw.mobileFrontend.define("mobile.startup/Anchor",R),mw.mobileFrontend.define("mobile.startup/Skin",x),mw.mobileFrontend.define("mobile.startup/OverlayManager",C),mw.mobileFrontend.define("mobile.startup/Overlay",T),mw.mobileFrontend.define("mobile.startup/Drawer",M),mw.mobileFrontend.define("mobile.startup/CtaDrawer",$),mw.mobileFrontend.define("mobile.startup/PageList",_),mw.mobileFrontend.define("mobile.startup/toast",F),mw.mobileFrontend.define("mobile.startup/rlModuleLoader",D),mw.mobileFrontend.define("mobile.startup/eventBusSingleton",P),mw.mobileFrontend.deprecate("mobile.startup/LoadingOverlay",O,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.search.util/extendSearchParams",L,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.references/ReferencesDrawer",f,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.references.gateway/ReferencesGateway",g,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.references.gateway/ReferencesHtmlScraperGateway",b,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.references.gateway/ReferencesMobileViewGateway",w,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.watchstar/Watchstar",E,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.pagelist.scripts/WatchstarPageList",I,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.toggle/Toggler",B,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.search/SearchOverlay",H,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.search/MobileWebSearchLogger",G,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.search.api/SearchGateway",W,"mobile.startup"),e.exports={extendSearchParams:L,ReferencesDrawer:f,ReferencesGateway:g,ReferencesHtmlScraperGateway:b,ReferencesMobileViewGateway:w,moduleLoader:n,time:a,util:c,actionParams:o,View:l,Browser:h,context:i,cache:m,Button:p,Icon:d,icons:v,Panel:y,Section:S,Page:k,Anchor:R,Skin:x,OverlayManager:C,Overlay:T,loadingOverlay:O,Drawer:M,CtaDrawer:$,PageList:_,toast:F,Watchstar:E,WatchstarPageList:I,rlModuleLoader:D,eventBusSingleton:P,Toggler:B,search:{SearchOverlay:H,MobileWebSearchLogger:G,SearchGateway:W},ScrollEndEventEmitter:A},mw.mobileFrontend.define("mobile.startup",e.exports),N.subscribeMobileWebSearchSchema()},"./src/mobile.startup/references/ReferencesDrawer.js":function(e,t,r){var n=r("./src/mobile.startup/Drawer.js"),s=r("./src/mobile.startup/util.js"),i=r("./src/mobile.startup/icons.js"),a=r("./src/mobile.startup/mfExtend.js"),o=r("./src/mobile.startup/references/ReferencesGateway.js"),c=r("./src/mobile.startup/Icon.js");function l(e){n.call(this,s.extend({className:"drawer position-fixed text references"},e))}a(l,n,{defaults:s.extend({},n.prototype.defaults,{spinner:i.spinner().toHtmlString(),cancelButton:i.cancel("gray").toHtmlString(),citation:new c({isSmall:!0,name:"citation",additionalClassNames:"text",hasText:!0,label:mw.msg("mobile-frontend-references-citation")}).toHtmlString(),errorClassName:new c({name:"error",hasText:!0,isSmall:!0}).getClassName()}),events:{"click sup a":"showNestedReference"},show:function(){return n.prototype.show.apply(this,arguments)},template:mw.template.get("mobile.startup","ReferencesDrawer.hogan"),closeOnScroll:!1,postRender:function(){var e=s.getWindow().height();n.prototype.postRender.apply(this),e/2<400&&this.$el.css("max-height",e/2),this.on("show",this.onShow.bind(this)),this.on("hide",this.onHide.bind(this))},onShow:function(){s.getDocument().find("body").addClass("drawer-enabled")},onHide:function(){s.getDocument().find("body").removeClass("drawer-enabled")},showReference:function(e,t,r){var n=this,s=this.options.gateway;return this.options.page=t,n.show(),s.getReference(e,t).then(function(e){n.render({title:r,text:e.text})},function(e){e===o.ERROR_NOT_EXIST?n.hide():n.render({error:!0,title:r,text:mw.msg("mobile-frontend-references-citation-error")})})},showNestedReference:function(e){var t=this.$(e.target);return this.showReference(t.attr("href"),this.options.page,t.text()),!1}}),e.exports=l},"./src/mobile.startup/references/ReferencesGateway.js":function(e,t){function r(e){this.api=e}r.prototype.getReference=null,r.ERROR_NOT_EXIST="NOT_EXIST_ERROR",r.ERROR_OTHER="OTHER_ERROR",e.exports=r},"./src/mobile.startup/references/ReferencesHtmlScraperGateway.js":function(e,t,r){var n=r("./src/mobile.startup/references/ReferencesGateway.js"),s=r("./src/mobile.startup/mfExtend.js"),i=r("./src/mobile.startup/util.js");function a(){n.apply(this,arguments)}s(a,n,{getReferenceFromContainer:function(e,t){var r,s=i.Deferred();return(r=t.find("#"+i.escapeSelector(e.substr(1)))).length?s.resolve({text:r.html()}):s.reject(n.ERROR_NOT_EXIST),s.promise()},getReference:function(e,t){return this.getReferenceFromContainer(decodeURIComponent(e),t.$("ol.references"))}}),e.exports=a},"./src/mobile.startup/references/ReferencesMobileViewGateway.js":function(e,t,r){var n=r("./src/mobile.startup/references/ReferencesHtmlScraperGateway.js"),s=r("./src/mobile.startup/cache.js"),i=r("./src/mobile.startup/references/ReferencesGateway.js"),a=s.MemoryCache,o=r("./src/mobile.startup/util.js"),c=r("./src/mobile.startup/mfExtend.js"),l=s.NoCache,u=null;function h(e,t){n.call(this,e),this.cache=t||new l}c(h,n,{getReferencesLists:function(e){var t=this,r=o.Deferred(),n=this.cache.get(e.id);return n?r.resolve(n).promise():(this.api.get({action:"mobileview",page:e.getTitle(),sections:"references",prop:"text",revision:e.getRevisionId()}).then(function(n){var s={};n.mobileview.sections.forEach(function(e){var t=o.parseHTML("<div>").html(e.text);s[t.find(".mw-headline").attr("id")]=t.find(".references")}),t.cache.set(e.id,s),r.resolve(s)},function(){r.reject(i.ERROR_OTHER)}),r.promise())},getReferencesList:function(e,t){return this.getReferencesLists(e).then(function(e){return!!Object.prototype.hasOwnProperty.call(e,t)&&e[t]})},getReference:function(e,t){var r=this;return this.getReferencesLists(t).then(function(t){var n=o.parseHTML("<div>");return Object.keys(t).forEach(function(e){n.append(t[e])}),r.getReferenceFromContainer(e,n)})}}),h.getSingleton=function(){return u||(u=new h(new mw.Api,new a)),u},e.exports=h},"./src/mobile.startup/rlModuleLoader.js":function(e,t,r){var n=r("./src/mobile.startup/loadingOverlay.js"),s=r("./src/mobile.startup/util.js");e.exports={newLoadingOverlay:function(){return n()},loadModule:function(e,t,r){var n=this.newLoadingOverlay();function i(){!t&&r&&n.hide()}return(r=void 0===r||r)&&n.show(),mw.loader.using(e).then(function(){return i(),n},function(){return i(),s.Deferred().reject().promise()})}}},"./src/mobile.startup/search/MobileWebSearchLogger.js":function(e,t){function r(){this.userSessionToken=null,this.searchSessionToken=null}r.prototype={_newUserSession:function(){this.userSessionToken=mw.user.generateRandomSessionId()},_newSearchSession:function(){this.searchSessionToken=mw.user.generateRandomSessionId(),this.searchSessionCreatedAt=(new Date).getTime()},onSearchShow:function(){this._newUserSession()},onSearchStart:function(){this._newSearchSession(),mw.track("mf.schemaMobileWebSearch",{action:"session-start",userSessionToken:this.userSessionToken,searchSessionToken:this.searchSessionToken,timeOffsetSinceStart:0})},onSearchResults:function(e){var t=(new Date).getTime()-this.searchSessionCreatedAt;mw.track("mf.schemaMobileWebSearch",{action:"impression-results",resultSetType:"prefix",numberOfResults:e.results.length,userSessionToken:this.userSessionToken,searchSessionToken:this.searchSessionToken,timeToDisplayResults:t,timeOffsetSinceStart:t})},onSearchResultClick:function(e){var t=(new Date).getTime()-this.searchSessionCreatedAt;mw.track("mf.schemaMobileWebSearch",{action:"click-result",clickIndex:e.resultIndex+1,userSessionToken:this.userSessionToken,searchSessionToken:this.searchSessionToken,timeOffsetSinceStart:t})}},r.register=function(e){var t=new r;e.on("search-show",t.onSearchShow.bind(t)),e.on("search-start",t.onSearchStart.bind(t)),e.on("search-results",t.onSearchResults.bind(t)),e.on("search-result-click",t.onSearchResultClick.bind(t))},e.exports=r},"./src/mobile.startup/search/SearchGateway.js":function(e,t,r){var n=r("./src/mobile.startup/Page.js"),s=r("./src/mobile.startup/util.js"),i=r("./src/mobile.startup/extendSearchParams.js");function a(e){this.api=e,this.searchCache={},this.generator=mw.config.get("wgMFSearchGenerator")}a.prototype={searchNamespace:0,getApiData:function(e){var t=this.generator.prefix,r=i("search",{generator:this.generator.name});return r.redirects="",r["g"+t+"search"]=e,r["g"+t+"namespace"]=this.searchNamespace,r["g"+t+"limit"]=15,r.pilimit&&(r.pilimit=15,r.pithumbsize=mw.config.get("wgMFThumbnailSizes").tiny),r},_createSearchRegEx:function(e){return e=e.replace(/[-\[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),new RegExp("^("+e+")","ig")},_highlightSearchTerm:function(e,t){return e=s.parseHTML("<span>").text(e).html(),t=s.parseHTML("<span>").text(t).html(),e.replace(this._createSearchRegEx(t),"<strong>$1</strong>")},_getPage:function(e,t){var r=n.newFromJSON(t);return r.displayTitle=this._highlightSearchTerm(t.displaytext?t.displaytext:r.title,e),r.index=t.index,r},_processData:function(e,t){var r=this,n=[];return t.query&&(n=t.query.pages||{},(n=Object.keys(n).map(function(t){return r._getPage(e,n[t])})).sort(function(e,t){return e.index<t.index?-1:1})),n},search:function(e){var t,r,n=this;return this.isCached(e)||(r=(t=this.api.get(this.getApiData(e))).then(function(t){return{query:e,results:n._processData(e,t)}},function(){n.searchCache[e]=void 0}),this.searchCache[e]=r.promise({abort:function(){t.abort()}})),this.searchCache[e]},isCached:function(e){return Boolean(this.searchCache[e])}},e.exports=a},"./src/mobile.startup/search/SearchOverlay.js":function(e,t,r){var n=r("./src/mobile.startup/mfExtend.js"),s=r("./src/mobile.startup/Overlay.js"),i=r("./src/mobile.startup/util.js"),a=r("./src/mobile.startup/Anchor.js"),o=r("./src/mobile.startup/Icon.js"),c=r("./src/mobile.startup/watchstar/WatchstarPageList.js"),l=mw.config.get("wgCirrusSearchFeedbackLink");function u(e){var t=i.extend({},{isBorderBox:!1,className:"overlay search-overlay"},e);s.call(this,t),this.api=t.api,this.gateway=new t.gatewayClass(this.api),this.router=t.router}n(u,s,{templatePartials:i.extend({},s.prototype.templatePartials,{header:mw.template.get("mobile.startup","search/SearchHeader.hogan"),content:mw.template.get("mobile.startup","search/SearchContent.hogan"),icon:o.prototype.template}),defaults:i.extend({},s.prototype.defaults,{headerChrome:!0,clearIcon:new o({tagName:"button",name:"search-clear",isSmall:!0,label:mw.msg("mobile-frontend-clear-search"),additionalClassNames:"clear"}).options,searchContentIcon:new o({tagName:"a",href:"#",name:"search-content",label:mw.msg("mobile-frontend-search-content")}).options,searchTerm:"",placeholderMsg:"",noResultsMsg:mw.msg("mobile-frontend-search-no-results"),searchContentNoResultsMsg:mw.message("mobile-frontend-search-content-no-results").parse(),action:mw.config.get("wgScript"),feedback:!!l&&{feedback:new a({label:mw.msg("mobile-frontend-search-feedback-link-text"),href:l}).options,prompt:mw.msg("mobile-frontend-search-feedback-prompt")}}),events:i.extend({},s.prototype.events,{"input input":"onInputInput","click .clear":"onClickClear","click .search-content":"onClickSearchContent","click .overlay-content":"onClickOverlayContent","click .overlay-content > div":"onClickOverlayContentDiv","touchstart .results":"hideKeyboardOnScroll","mousedown .results":"hideKeyboardOnScroll","click .results a":"onClickResult"}),onInputInput:function(){this.performSearch(),this.$clear.toggle(""!==this.$input.val())},onClickClear:function(){return this.$input.val("").focus(),this.performSearch(),this.$clear.hide(),!1},onClickSearchContent:function(){var e=i.getDocument().find("body"),t=this.$("form");this.parseHTML("<input>").attr({type:"hidden",name:"fulltext",value:"search"}).appendTo(t),setTimeout(function(){t.appendTo(e),t.submit()},0)},onClickOverlayContent:function(){this.$(".cancel").trigger("click")},onClickOverlayContentDiv:function(e){e.stopPropagation()},hideKeyboardOnScroll:function(){this.$input.blur()},onClickResult:function(e){var t=this.$(e.currentTarget),r=t.closest("li");this.emit("search-result-click",{result:r,resultIndex:this.$results.index(r),originalEvent:e}),e.preventDefault(),this.router.back().then(function(){window.location.href=t.attr("href")})},postRender:function(){var e,t=this;function r(){t.$spinner.hide(),clearTimeout(e)}s.prototype.postRender.call(this),this.$input=this.$("input"),this.$clear=this.$(".clear"),this.$searchContent=this.$(".search-content").hide(),this.$searchFeedback=this.$(".search-feedback").hide(),this.$resultContainer=this.$(".results-list-container"),this.$spinner=this.$(".spinner-container"),this.on("search-start",function(n){e&&r(),e=setTimeout(function(){t.$spinner.show()},2e3-n.delay)}),this.on("search-results",r),""===t.$input.val()&&this.$clear.hide()},showKeyboard:function(){var e=this.$input.val().length;this.$input.focus(),this.$input[0].setSelectionRange&&this.$input[0].setSelectionRange(e,e)},show:function(){s.prototype.show.apply(this,arguments),this.showKeyboard(),this.emit("search-show")},hide:function(){var e=this;return i.getDocument().hasClass("animations")?(e.$el.addClass("fade-out"),setTimeout(function(){s.prototype.hide.apply(e,arguments)},500)):s.prototype.hide.apply(e,arguments),!0},performSearch:function(){var e=this,t=this.api,r=this.$input.val(),n=this.gateway.isCached(r)?0:300;r!==this.lastQuery&&(e._pendingQuery&&e._pendingQuery.abort(),clearTimeout(this.timer),r.length?this.timer=setTimeout(function(){var s;e.emit("search-start",{query:r,delay:n}),s=e.gateway.search(r),e._pendingQuery=s.then(function(r){r&&r.query===e.$input.val()&&(e.$el.toggleClass("no-results",0===r.results.length),e.$searchContent.show().find("p").hide().filter(r.results.length?".with-results":".without-results").show(),new c({api:t,funnel:"search",pages:r.results,el:e.$resultContainer}),e.$results=e.$resultContainer.find("li"),e.emit("search-results",{results:r.results}))}).promise({abort:function(){s.abort()}})},n):e.resetSearch(),this.lastQuery=r)},resetSearch:function(){this.$spinner.hide(),this.$searchContent.hide(),this.$searchFeedback.hide(),this.$resultContainer.empty()}}),e.exports=u},"./src/mobile.startup/search/schemaMobileWebSearch.js":function(e,t){e.exports={subscribeMobileWebSearchSchema:function(){mw.loader.using(["ext.eventLogging.subscriber"]).then(function(){var e=mw.mobileFrontend.require("mobile.startup/context"),t=new(0,mw.eventLog.Schema)("MobileWebSearch",mw.config.get("wgMFSchemaSearchSampleRate",.001),{platform:"mobileweb",platformVersion:e.getMode()});mw.trackSubscribe("mf.schemaMobileWebSearch",function(e,r){t.log(r)})})}}}},[["./src/mobile.startup/mobile.startup.js",0,1]]]);
//# sourceMappingURL=mobile.startup.js.map.json