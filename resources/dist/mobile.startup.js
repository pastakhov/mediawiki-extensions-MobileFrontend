this.mfModules=this.mfModules||{},this.mfModules["mobile.startup"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[3],[function(e,t){e.exports={escapeSelector:function(e){return $.escapeSelector(e)},grep:function(){return $.grep.apply($,arguments)},docReady:function(e){return $(e)},when:function(){return $.when.apply($,arguments)},Deferred:function(){var e=$.Deferred(),t="Use Promise compatible methods `then` and `catch` instead.";return mw.log.deprecate(e,"fail",e.fail,t),mw.log.deprecate(e,"always",e.always,t),mw.log.deprecate(e,"done",e.done,t),e},getDocument:function(){return $(document.documentElement)},getWindow:function(){return $(window)},parseHTML:function(e,t){return $($.parseHTML(e,t))},isNumeric:function(){return $.isNumeric.apply($,arguments)},extend:function(){return $.extend.apply($,arguments)},escapeHash:function(e){return e.replace(/(:|\.)/g,"\\$1")},isModifiedEvent:function(e){return e.altKey||e.ctrlKey||e.metaKey||e.shiftKey},repeatEvent:function(e,t,n,i){return e.on(n,function(e){return t.emit(n,e)},i)}}},function(e,t){e.exports=function(e,t,n){var i;for(i in n?OO.inheritClass(e,t):(OO.initClass(e),n=t),n)e.prototype[i]=n[i]}},function(e,t,n){var i=n(0),o=n(1),s=/^(\S+)\s*(.*)$/,r=0;function a(){this.initialize.apply(this,arguments)}OO.mixinClass(a,OO.EventEmitter),o(a,{tagName:"div",isTemplateMode:!1,template:void 0,templatePartials:{},defaults:{},events:null,initialize:function(e){var t=this;OO.EventEmitter.call(this),e=i.extend({},this.defaults,e),this.options=e,this.cid=function(e){var t=(++r).toString();return e?e+t:t}("view"),"string"==typeof this.template&&(this.template=mw.template.compile(this.template)),e.el?this.$el=$(e.el):this.$el=this.parseHTML("<"+this.tagName+">"),this.$el.length?this._postInitialize(e):i.docReady(function(){t.$el=$(e.el),t._postInitialize(e)})},_postInitialize:function(e){var t=!0;void 0!==e.isBorderBox?t=e.isBorderBox:void 0!==this.isBorderBox&&(t=this.isBorderBox),this.$el.addClass(e.className||this.className),t&&this.$el.addClass("view-border-box"),this.render(this.options)},preRender:function(){},postRender:function(){},render:function(e){var t,n;return i.extend(this.options,e),this.preRender(),this.undelegateEvents(),this.template&&!this.options.skipTemplateRender&&(n=this.template.render(this.options,this.templatePartials),this.isTemplateMode?(t=$(n),this.$el.replaceWith(t),this.$el=t):this.$el.html(n)),this.postRender(),this.delegateEvents(),this},$:function(e){return this.$el.find(e)},delegateEvents:function(e){var t,n,i;if(e=e||this.events)for(n in this.undelegateEvents(),e)"function"!=typeof(i=e[n])&&(i=this[e[n]]),i&&(t=n.match(s),this.delegate(t[1],t[2],i.bind(this)))},delegate:function(e,t,n){this.$el.on(e+".delegateEvents"+this.cid,t,n)},undelegateEvents:function(){this.$el&&this.$el.off(".delegateEvents"+this.cid)},undelegate:function(e,t,n){this.$el.off(e+".delegateEvents"+this.cid,t,n)},parseHTML:i.parseHTML}),["append","prepend","appendTo","prependTo","after","before","insertAfter","insertBefore","remove","detach"].forEach(function(e){a.prototype[e]=function(){return this.$el[e].apply(this.$el,arguments),this}}),e.exports=a},,,,,,,function(e,t,n){var i=n(11),o=n(0);e.exports={Icon:i,spinner:function(e){return e=e||{},new this.Icon(o.extend(e,{name:"spinner",label:mw.msg("mobile-frontend-loading-message"),additionalClassNames:"spinner loading"}))}}},function(e,t,n){var i,o=n(0);function s(e){var t=function(){var n=this["__cache"+t.cacheId]||(this["__cache"+t.cacheId]={}),i=[].join.call(arguments,"|");return Object.prototype.hasOwnProperty.call(n,i)?n[i]:n[i]=e.apply(this,arguments)};return t.cacheId=Date.now().toString()+Math.random().toString(),t}function r(e,t){this.userAgent=e,this.$el=t,this._fixIosLandscapeBug()}r.prototype={_fixIosLandscapeBug:function(){var e=this;this.$el.find('meta[name="viewport"]')[0]&&(this.isIos(4)||this.isIos(5))&&(this.lockViewport(),document.addEventListener("gesturestart",function(){e.lockViewport()},!1))},isIos:s(function(e){var t=this.userAgent,n=/ipad|iphone|ipod/i.test(t);if(!n||!e)return n;switch(e){case 8:return/OS 8_/.test(t)||/Version\/8/.test(t);case 4:return/OS 4_/.test(t);case 5:return/OS 5_/.test(t);default:return!1}}),lockViewport:function(){this.$el&&this.$el.find('meta[name="viewport"]').attr("content","initial-scale=1.0, maximum-scale=1.0, user-scalable=no")},isWideScreen:s(function(){var e=parseInt(mw.config.get("wgMFDeviceWidthTablet"),10);return window.innerWidth>=e||window.innerHeight>=e}),supportsAnimations:s(function(){var e=document.createElement("foo").style;function t(t){return t in e||"webkit"+t[0].toUpperCase()+t.slice(1)in e}return t("animationName")&&t("transform")&&t("transition")}),supportsTouchEvents:s(function(){return"ontouchstart"in window}),supportsGeoLocation:s(function(){return"geolocation"in window.navigator})},r.getSingleton=function(){var e;return i||(e=o.getDocument(),i=new r(window.navigator.userAgent,e)),i},e.exports=r},function(e,t,n){var i=n(1),o=n(2);function s(e){e.hasText&&(e.modifier="mw-ui-icon-before"),e.href&&(e.tagName="a"),o.call(this,e)}i(s,o,{preRender:function(){this.setRotationClass()},setRotationClass:function(){var e=this.options;if(e.rotation)switch(e.rotation){case-180:case 180:e._rotationClass="mf-mw-ui-icon-rotate-flip";break;case-90:e._rotationClass="mf-mw-ui-icon-rotate-anti-clockwise";break;case 90:e._rotationClass="mf-mw-ui-icon-rotate-clockwise";break;case 0:break;default:throw new Error("Bad value for rotation given. Must be ±90, 0 or ±180.")}},isTemplateMode:!0,defaults:{rotation:0,hasText:!1,href:void 0,glyphPrefix:"mf",tagName:"div",isSmall:!1,base:"mw-ui-icon",name:"",modifier:"mw-ui-icon-element",title:""},getClassName:function(){return this.$el.attr("class")},getGlyphClassName:function(){return this.options.base+"-"+this.options.glyphPrefix+"-"+this.options.name},toHtmlString:function(){return this.parseHTML("<div>").append(this.$el).html()},template:mw.template.get("mobile.startup","icon.hogan")}),e.exports=s},function(e,t,n){var i=n(1),o=n(2);function s(e){e.href&&(e.tagName="a"),o.call(this,e)}i(s,o,{isTemplateMode:!0,defaults:{tagName:"a",block:void 0,progressive:void 0,destructive:void 0,quiet:void 0,additionalClassNames:"",href:void 0,label:void 0},template:mw.template.get("mobile.startup","button.hogan")}),e.exports=s},function(e,t,n){var i=mw.html,o=n(1),s=n(16),r=n(0),a=n(17),l=n(21),c=n(2),d=mw.config.get("wgMFMobileFormatterHeadings",["h1","h2","h3","h4","h5"]).join(","),h=["noviewer","metadata"];function u(e){var t;void 0===e.thumbnail&&(e.thumbnail=!1),this.options=e,e.languageUrl=mw.util.getUrl("Special:MobileLanguages/"+e.title),c.call(this,e),e.displayTitle=this.getDisplayTitle(),this.title=e.title,this.displayTitle=e.displayTitle,this.thumbnail=e.thumbnail,this.url=e.url||mw.util.getUrl(e.title),this.id=e.id,this.isMissing=void 0!==e.isMissing?e.isMissing:0===e.id,(t=this.thumbnail)&&t.width&&(this.thumbnail.isLandscape=t.width>t.height),this.wikidataDescription=e.wikidataDescription}o(u,c,{defaults:{id:0,title:"",displayTitle:"",namespaceNumber:0,protection:{edit:["*"]},sections:[],isMissing:!1,isMainPage:!1,url:void 0,thumbnail:{isLandscape:void 0,source:void 0,width:void 0,height:void 0}},isBorderBox:!1,getDisplayTitle:function(){return this.options.displayTitle||i.escape(this.options.title)},inNamespace:function(e){return this.options.namespaceNumber===mw.config.get("wgNamespaceIds")[e]},findSectionHeadingByIndex:function(e){return e<1?this.$():this.$(d).filter('.mw-parser-output > *, [class^="mf-section-"] > *').eq(e-1)},findChildInSectionLead:function(e,t){var n,i,o,s,r=d;function a(e){return e.find(t).addBack()}return 0===e?(s=this.getLeadSectionElement())&&s.length?a(s.children(t)):(n=this.findSectionHeadingByIndex(1)).length?a(n.prevAll(t)):this.$(t):(n=this.findSectionHeadingByIndex(e)).hasClass("section-heading")?(i=(o=n.next()).find(r).eq(0)).length?a(i.prevAll(t)):a(o.children(t)):(i=n.eq(0).nextAll(r).eq(0),n.nextUntil(i,t))},getLeadSectionElement:function(){return this.$(".mf-section-0").length?this.$(".mf-section-0"):null},isWikiText:function(){return"wikitext"===mw.config.get("wgPageContentModel")},isMainPage:function(){return this.options.isMainPage},isWatched:function(){return this.options.isWatched},getRevisionId:function(){return this.options.revId},getTitle:function(){return this.options.title},getId:function(){return this.options.id},getNamespaceId:function(){var e=this.options.title.split(":");return e[1]&&mw.config.get("wgNamespaceIds")[e[0].toLowerCase().replace(" ","_")]||0},isTalkPage:function(){var e=this.getNamespaceId();return e>0&&e%2==1},preRender:function(){this.sections=[],this._sectionLookup={},this.title=this.options.title,this.options.sections.forEach(function(e){var t=new a(e);this.sections.push(t),this._sectionLookup[t.id]=t}.bind(this))},getThumbnails:function(){var e=this.$el,t="."+h.join(",."),n=[];return this._thumbs||(e.find("a.image, a.thumbimage").not(t).each(function(){var i=e.find(this),o=i.find(".lazy-image-placeholder"),s=0===i.parents(t).length&&0===i.find(t).length,r=i.attr("href").match(/title=([^/&]+)/),a=i.attr("href").match(/[^/]+$/);o.length&&s&&(s=!new RegExp("\\b("+h.join("|")+")\\b").test(o.data("class"))),s&&(r||a)&&n.push(new l({el:i,filename:decodeURIComponent(r?r[1]:a[0])}))}),this._thumbs=n),this._thumbs},getSection:function(e){return this._sectionLookup[e]},getSections:function(){return this.sections},getRedLinks:function(){return this.$(".new")}}),u.newFromJSON=function(e){var t,n,o=e.thumbnail,a=e.pageprops||{displaytitle:i.escape(e.title)},l=e.terms;return(a||l)&&(n=l&&l.label?i.escape(l.label[0]):a.displaytitle),e.wikidataDescription=e.description||void 0,o&&(e.thumbnail.isLandscape=o.width>o.height),e.revisions&&e.revisions[0]&&(t=e.revisions[0],e.lastModified=s.getLastModifiedMessage(new Date(t.timestamp).getTime()/1e3,t.user)),new u(r.extend(e,{id:e.pageid,isMissing:!!e.missing,url:mw.util.getUrl(e.title),displayTitle:n}))},u.HEADING_SELECTOR=d,e.exports=u},function(e,t,n){var i=n(2),o=n(11),s=n(12),r=n(15),a=n(9),l=n(0),c=n(10).getSingleton();function d(){this.isIos=c.isIos(),this.useVirtualKeyboardHack=c.isIos(4)||c.isIos(5),this.hasLoadError=!1,i.apply(this,arguments)}n(1)(d,i,{hasFixedHeader:!0,fullScreen:!0,hideOnExitClick:!0,appendToElement:"body",className:"overlay",templatePartials:{header:mw.template.get("mobile.startup","header.hogan"),anchor:r.prototype.template,button:s.prototype.template},template:mw.template.get("mobile.startup","Overlay.hogan"),defaults:{saveMsg:mw.msg("mobile-frontend-editor-save"),cancelButton:new o({tagName:"button",name:"overlay-close",additionalClassNames:"cancel",label:mw.msg("mobile-frontend-overlay-close")}).toHtmlString(),backButton:new o({tagName:"button",name:"back",additionalClassNames:"back",label:mw.msg("mobile-frontend-overlay-close")}).toHtmlString(),headerButtonsListClassName:"",headerChrome:!1,fixedHeader:!0,spinner:a.spinner().toHtmlString()},events:{"click .cancel, .confirm, .initial-header .back":"onExitClick",click:"stopPropagation"},closeOnContentTap:!1,showSpinner:function(){this.$spinner.removeClass("hidden")},hideSpinner:function(){this.$spinner.addClass("hidden")},postRender:function(){this.$overlayContent=this.$(".overlay-content"),this.$spinner=this.$(".spinner"),this.isIos&&this.$el.addClass("overlay-ios"),this.$(".overlay-header h2 span").addClass("truncated-text"),this.setupEmulatedIosOverlayScrolling()},setupEmulatedIosOverlayScrolling:function(){var e=this;this.isIos&&this.hasFixedHeader&&(this.$(".overlay-content").on("touchstart",this.onTouchStart.bind(this)).on("touchmove",this.onTouchMove.bind(this)),setTimeout(function(){e._fixIosHeader(e.$("textarea, input"))},0))},onExitClick:function(e){e.preventDefault(),e.stopPropagation(),this.hideOnExitClick&&this.hide(),this.emit(d.EVENT_EXIT)},onTouchStart:function(e){this.startY=e.originalEvent.touches[0].pageY},onTouchMove:function(e){var t=e.originalEvent.touches[0].pageY,n=this.$overlayContent.outerHeight(),i=this.$overlayContent.prop("scrollHeight")-n;e.stopPropagation(),(0===this.$overlayContent.scrollTop()&&this.startY<t||this.$overlayContent.scrollTop()===i&&this.startY>t)&&e.preventDefault()},stopPropagation:function(e){e.stopPropagation()},show:function(){var e=this,t=l.getDocument(),n=l.getWindow();this.$el.appendTo(this.appendToElement),this.scrollTop=window.pageYOffset,this.fullScreen&&(t.addClass("overlay-enabled"),window.scrollTo(0,1)),this.closeOnContentTap&&t.find("#mw-mf-page-center").one("click",this.hide.bind(this)),this.isIos&&this.hasFixedHeader&&n.on("touchmove.ios",function(e){e.preventDefault()}).on("resize.ios",function(){e._resizeContent(n.height())}),this.$el.addClass("visible")},hide:function(){var e=l.getWindow(),t=l.getDocument();return this.fullScreen&&(t.removeClass("overlay-enabled"),window.scrollTo(window.pageXOffset,this.scrollTop)),this.$el.detach(),this.isIos&&e.off(".ios"),this.emit("hide"),!0},_resizeContent:function(e){this.$overlayContent.height(e-this.$(".overlay-header-container").outerHeight()-this.$(".overlay-footer-container").outerHeight())},_fixIosHeader:function(e){var t=this,n=l.getWindow();this.isIos&&(this._resizeContent(n.height()),e.on("focus",function(){setTimeout(function(){var e=0;t.useVirtualKeyboardHack&&(n.scrollTop(999),e=n.scrollTop(),n.scrollTop(0)),n.height()>e&&t._resizeContent(n.height()-e)},0)}).on("blur",function(){t._resizeContent(n.height()),n.scrollTop(0)}))},showHidden:function(e){this.$(".hideable").addClass("hidden"),this.$(e).removeClass("hidden")}}),d.EVENT_EXIT="Overlay-exit",e.exports=d},function(e,t,n){var i=n(2);function o(){i.apply(this,arguments)}n(1)(o,i,{isTemplateMode:!0,defaults:{progressive:void 0,destructive:void 0,additionalClassNames:"",href:void 0,label:void 0},template:mw.template.get("mobile.startup","anchor.hogan")}),e.exports=o},function(e,t,n){var i=["seconds","minutes","hours","days","months","years"],o=n(0),s=[1,60,3600,86400,2592e3,31536e3];function r(e){for(var t=0;t<s.length&&e>s[t+1];)++t;return{value:Math.round(e/s[t]),unit:i[t]}}function a(e){return r(Math.round((new Date).getTime()/1e3)-e)}function l(e){return"seconds"===e.unit&&e.value<10}e.exports={getLastModifiedMessage:function(e,t,n,i){var s,r,c=[];return n=n||"unknown",l(s=a(e))?c.push("mobile-frontend-last-modified-with-user-just-now",n,t):c.push({seconds:"mobile-frontend-last-modified-with-user-seconds",minutes:"mobile-frontend-last-modified-with-user-minutes",hours:"mobile-frontend-last-modified-with-user-hours",days:"mobile-frontend-last-modified-with-user-days",months:"mobile-frontend-last-modified-with-user-months",years:"mobile-frontend-last-modified-with-user-years"}[s.unit],n,t,mw.language.convertNumber(s.value)),c.push(i||"#",mw.language.convertNumber(t?1:0),t?mw.util.getUrl("User:"+t):""),r=mw.message.apply(this,c).parse(),i?r:o.parseHTML("<div>").html(r).text()},getRegistrationMessage:function(e,t){var n,i=[];return t=t||"unknown",l(n=a(parseInt(e,10)))?i.push("mobile-frontend-joined-just-now",t):i.push({seconds:"mobile-frontend-joined-seconds",minutes:"mobile-frontend-joined-minutes",hours:"mobile-frontend-joined-hours",days:"mobile-frontend-joined-days",months:"mobile-frontend-joined-months",years:"mobile-frontend-joined-years"}[n.unit],t,mw.language.convertNumber(n.value)),mw.message.apply(this,i).parse()},timeAgo:r,getTimeAgoDelta:a,isNow:l,isRecent:function(e){return["seconds","minutes","hours"].indexOf(e.unit)>-1}}},function(e,t,n){var i=n(1),o=n(9),s=n(2);function r(e){var t=this;e.tag="h"+e.level,this.line=e.line,this.text=e.text,this.hasReferences=e.hasReferences||!1,this.id=e.id||null,this.anchor=e.anchor,this.subsections=[],(e.subsections||[]).forEach(function(e){t.subsections.push(new r(e))}),s.call(this,e)}i(r,s,{template:mw.template.get("mobile.startup","Section.hogan"),defaults:{line:void 0,text:"",spinner:o.spinner().toHtmlString()}}),e.exports=r},function(e,t){function n(){this._cache={}}function i(){}n.prototype.get=function(e){return this._cache[e]},n.prototype.set=function(e,t){this._cache[e]=t},i.prototype.get=function(){},i.prototype.set=function(){},e.exports={MemoryCache:n,NoCache:i}},function(e,t){function n(){this._register={},OO.EventEmitter.call(this)}n.prototype={require:function(e){var t,n,i=this._register;function o(){if(!Object.hasOwnProperty.call(i,e))throw new Error("MobileFrontend Module not found: "+e);return i[e]}n=e.split("/");try{return(t=mw.loader.require(n[0]))[n[1]]?t[n[1]]:o()}catch(e){return o()}},define:function(e,t){var n=this;if(Object.hasOwnProperty.call(this._register,e))throw new Error("Module already exists: "+e);return this._register[e]=t,{deprecate:function(i){n.deprecate(i,t,e)}}},deprecate:function(e,t,n){var i;n&&(i="Use "+n+" instead."),mw.log.deprecate(this._register,e,t,i)}},OO.mixinClass(n,OO.EventEmitter),e.exports=n},,function(e,t,n){var i=n(1),o=n(2);function s(){o.apply(this,arguments)}i(s,o,{defaults:{filename:void 0},isBorderBox:!1,postRender:function(){this.options.description=this.$el.siblings(".thumbcaption").text()},getDescription:function(){return this.options.description},getFileName:function(){return this.options.filename}}),e.exports=s},function(e,t,n){var i=n(1),o=n(2);function s(){o.apply(this,arguments)}i(s,o,{className:"panel",minHideDelay:10,events:{"click .cancel":"onCancel"},onCancel:function(e){e.preventDefault(),this.hide()},show:function(){var e=this;e.isVisible()||setTimeout(function(){e.$el.addClass("visible animated"),e.emit("show")},e.minHideDelay)},hide:function(){var e=this;setTimeout(function(){e.$el.removeClass("visible"),e.emit("hide")},e.minHideDelay)},isVisible:function(){return this.$el.hasClass("visible")},toggle:function(){this.isVisible()?this.hide():this.show()}}),e.exports=s},function(e,t,n){var i=n(14);function o(){i.apply(this,arguments)}n(1)(o,i,{className:"overlay overlay-loading",template:mw.template.get("mobile.startup","LoadingOverlay.hogan")}),e.exports=o},function(e,t,n){var i=n(19);e.exports=new i},function(e,t){function n(e){this.api=e}n.prototype.getReference=null,n.ERROR_NOT_EXIST="NOT_EXIST_ERROR",n.ERROR_OTHER="OTHER_ERROR",e.exports=n},function(e,t){e.exports={getMode:function(){return mw.config.get("wgMFMode")}}},function(e,t,n){var i=n(0);e.exports=function(e){var t,n,o=mw.config.get("wgMFDisplayWikibaseDescriptions",{});if(!Object.prototype.hasOwnProperty.call(o,e))throw new Error('"'+e+"\" isn't a feature that shows Wikibase descriptions.");return(t=Array.prototype.slice.call(arguments,1)).unshift({prop:[]}),t.push(mw.config.get("wgMFSearchAPIParams")),(n=i.extend.apply({},t)).prop=n.prop.concat(mw.config.get("wgMFQueryPropModules")),o[e]&&-1===n.prop.indexOf("description")&&n.prop.push("description"),n}},,,function(e,t,n){var i=n(0),o=null;function s(e){e.on("route",this._checkRoute.bind(this)),this.router=e,this.entries={},this.stack=[],this.hideCurrent=!0}n(1)(s,{_onHideOverlay:function(){this.hideCurrent=!1,this.router.back()},_showOverlay:function(e){e.once("_om_hide",this._onHideOverlay.bind(this)),e.show()},_hideOverlay:function(e){var t;return e.off("_om_hide"),(t=e.hide(this.stack.length>1))||e.once("_om_hide",this._onHideOverlay.bind(this)),t},_processMatch:function(e){var t,n=this;function i(e){e.on("hide",function(){e.emit("_om_hide")})}e&&(e.overlay?n._showOverlay(e.overlay):"function"==typeof(t=e.factoryResult).promise?t.then(function(t){e.overlay=t,i(t),n._showOverlay(t)}):(e.overlay=t,i(e.overlay),n._showOverlay(t)))},_checkRoute:function(e){var t,n=this.stack[0];n||(this.scrollTop=window.pageYOffset),t=Object.keys(this.entries).reduce(function(t,n){return t||this._matchRoute(e.path,this.entries[n])}.bind(this),null),n&&void 0!==n.overlay&&this.hideCurrent&&!this._hideOverlay(n.overlay)?e.preventDefault():t||(this.stack=[],window.scrollTo(window.pageXOffset,this.scrollTop)),this.hideCurrent=!0,this._processMatch(t)},_matchRoute:function(e,t){var n,i=e.match(t.route),o=this.stack[1],s=this;function r(){return{path:e,factoryResult:t.factory.apply(s,i.slice(1))}}return i?o&&o.path===e?o.overlay&&o.overlay.hasLoadError?(s.stack.shift(),s.stack[0]=r(),s.stack[0]):(s.stack.shift(),o):(n=r(),this.stack[0]&&n.path===this.stack[0].path?s.stack[0]=n:s.stack.unshift(n),n):null},add:function(e,t){var n=this,o={route:e,factory:t};this.entries[e]=o,i.docReady(function(){n._processMatch(n._matchRoute(n.router.getPath(),o))})},replaceCurrent:function(e){if(0===this.stack.length)throw new Error("Trying to replace OverlayManager's current overlay, but stack is empty");this._hideOverlay(this.stack[0].overlay),this.stack[0].overlay=e,this._showOverlay(e)}}),s.getSingleton=function(){return o||(o=new s(mw.loader.require("mediawiki.router"))),o},e.exports=s},function(e,t,n){var i=mw.template.get("mobile.startup","Section.hogan"),o=n(0),s={};function r(e){var t,n=e.map(function(e){return e.level}).filter(function(e){return!!e}),o=Math.min.apply(this,n).toString(),s=[];return e.forEach(function(e){void 0!==e.line&&(e.line=e.line.replace(/<\/?a\b[^>]*>/g,"")),e.subsections=[],!t||!e.level||e.level===o||t.subsections.length&&t.subsections[0].level>e.level||t.level&&t.level>=e.level?(s.push(e),t=e):(!function e(t,n){var i;0===t.length?t.push(n):(i=t[t.length-1],parseInt(i.level,10)===parseInt(n.level,10)?t.push(n):e(i.subsections,n))}(t.subsections,e),t.text+=i.render(e))}),s}function a(e){this.api=e}a.prototype={getPage:function(e,t,n){var i,a=o.Deferred(),l=t?{url:t,dataType:"jsonp"}:{},c={edit:["*"]};return s[e]||(s[e]=this.api.get({action:"mobileview",page:e,variant:mw.config.get("wgPageContentLanguage"),redirect:"yes",prop:"id|sections|text|lastmodified|lastmodifiedby|languagecount|hasvariants|protection|displaytitle|revision",noheadings:"yes",sectionprop:"level|line|anchor",sections:n?0:"all"},l).then(function(t){var n,s,l,d;return t.error?a.reject(t.error):t.mobileview.sections?(n=r((d=t.mobileview).sections),i=new Date(d.lastmodified).getTime()/1e3,s=d.lastmodifiedby,c=Array.isArray(d.protection)?c:o.extend(c,d.protection),l={title:e,id:d.id,revId:d.revId,protection:c,lead:n[0].text,sections:n.slice(1),isMainPage:void 0!==d.mainpage,historyUrl:mw.util.getUrl(e,{action:"history"}),lastModifiedTimestamp:i,languageCount:d.languagecount,hasVariants:void 0!==d.hasvariants,displayTitle:d.displaytitle},s&&o.extend(l,{lastModifiedUserName:s.name,lastModifiedUserGender:s.gender}),l):a.reject("No sections")},function(e){return a.reject(e)})),s[e]},invalidatePage:function(e){delete s[e]},_getLanguageVariantsFromApiResponse:function(e,t){var n=t.query.general,i=n.variantarticlepath,o=[];return!!n.variants&&(Object.keys(n.variants).forEach(function(t){var s=n.variants[t],r={autonym:s.name,lang:s.code};r.url=i?i.replace("$1",e).replace("$2",s.code):mw.util.getUrl(e,{variant:s.code}),o.push(r)}),o)},getPageLanguages:function(e,t){var n=this,i={action:"query",meta:"siteinfo",siprop:"general",prop:"langlinks",lllimit:"max",titles:e,formatversion:2};return t?(i.llprop="url|autonym|langname",i.llinlanguagecode=t):i.llprop="url|autonym",this.api.get(i).then(function(t){return{languages:t.query.pages[0].langlinks||[],variants:n._getLanguageVariantsFromApiResponse(e,t)}},function(){return o.Deferred().reject()})},_getAPIResponseFromHTML:function(e){var t=[];return e.find("h1,h2,h3,h4,h5,h6").each(function(){var n=this.tagName.substr(1),i=e.find(this).find(".mw-headline");i.length&&t.push({level:n,line:i.html(),anchor:i.attr("id")||"",text:""})}),t},getSectionsFromHTML:function(e){return r(this._getAPIResponseFromHTML(e))}},e.exports=a},function(e,t,n){var i=n(23),o=n(0);e.exports={newLoadingOverlay:function(){return new i},loadModule:function(e,t,n){var i=this.newLoadingOverlay();function s(){!t&&n&&i.hide()}return(n=void 0===n||n)&&i.show(),mw.loader.using(e).then(function(){return s(),i},function(){return s(),o.Deferred().reject().promise()})}}},function(e,t,n){var i=n(10).getSingleton(),o=n(2),s=n(0),r=n(13),a=s.Deferred,l=s.when,c=n(9),d=mw.viewport,h=c.spinner(),u=n(1),p=n(24);function m(e){var t,n=r.HEADING_SELECTOR,i=e.parent(),o=e.prevAll(n).eq(0);return o.length&&(t=o.find(".mw-headline").attr("id"))?t:i.length?m(i):null}function f(e){var t=this;this.page=e.page,this.name=e.name,e.mainMenu&&(this.mainMenu=e.mainMenu,mw.log.warn("Skin: Use of mainMenu is deprecated.")),o.call(this,e),this.referencesGateway=e.referencesGateway,mw.config.get("wgMFLazyLoadImages")&&s.docReady(function(){t.setupImageLoading()}),mw.config.get("wgMFLazyLoadReferences")&&p.on("before-section-toggled",this.lazyLoadReferences.bind(this))}u(f,o,{isBorderBox:!1,defaults:{page:void 0},events:{},postRender:function(){var e=this.$el;i.supportsAnimations()&&e.addClass("animations"),i.supportsTouchEvents()&&e.addClass("touch-events"),s.parseHTML('<div class="transparent-shield cloaked-element">').appendTo(e.find("#mw-mf-page-center")),this.emit("changed"),this.$("#mw-mf-page-center").on("click",this.emit.bind(this,"click"))},getUnloadedImages:function(e){return(e=e||this.$("#content")).find(".lazy-image-placeholder").toArray()},setupImageLoading:function(e){var t=this,n=1.5*s.getWindow().height(),i=this.loadImagesList.bind(this),o=this.getUnloadedImages(e);function r(){var e=[];return(o=s.grep(o,function(i){var o=t.$(i);return!o.length||!function(e){return d.isElementCloseToViewport(e[0],n)&&(e.is(":visible")||0===e.height())}(o)||(e.push(i),!1)})).length||(p.off("scroll:throttled",r),p.off("resize:throttled",r),p.off("section-toggled",r),t.off("changed",r)),i(e)}return p.on("scroll:throttled",r),p.on("resize:throttled",r),p.on("section-toggled",r),this.on("changed",r),r()},loadImagesList:function(e){var t,n=this.$.bind(this),i=this.loadImage.bind(this);return t=(e=e||this.getUnloadedImages()).map(function(e){return i(n(e))}),l.apply(null,t)},loadImage:function(e){var t=a(),n=e.attr("data-width"),i=e.attr("data-height"),o=s.parseHTML("<img>",this.$el[0].ownerDocument);return o.on("load",function(){o.addClass("image-lazy-loaded"),e.replaceWith(o),t.resolve()}),o.on("error",function(){t.reject()}),o.attr({class:e.attr("data-class"),width:n,height:i,src:e.attr("data-src"),alt:e.attr("data-alt"),style:e.attr("style"),srcset:e.attr("data-srcset")}),t},lazyLoadReferences:function(e){var t,n,i=this.referencesGateway,o=this.getUnloadedImages.bind(this),s=this.loadImagesList.bind(this),r=this;if(!e.wasExpanded&&e.isReferenceSection)return(t=e.$heading.next()).data("are-references-loaded")?a().reject().promise():(t.children().addClass("hidden"),n=h.$el.prependTo(t),i.getReferencesLists(e.page).then(function(){var o;t.find(".mf-lazy-references-placeholder").each(function(){var n=0,s=t.find(this),r=m(s);o!==r?(n=0,o=r):n++,r&&i.getReferencesList(e.page,r).then(function(e){e&&e[n]&&s.replaceWith(e[n])})}),n.remove(),t.children().removeClass("hidden"),r.emit("references-loaded",r.page),l()},function(){n.remove(),t.children().removeClass("hidden"),l()}));function l(){s(o(t)),t.data("are-references-loaded",1)}},getLicenseMsg:function(){var e,t=mw.config.get("wgMFLicense"),n=mw.language.convertNumber(t.plural);return t.link&&(e=this.$("#footer-places-terms-use").length>0?mw.msg("mobile-frontend-editor-licensing-with-terms",mw.message("mobile-frontend-editor-terms-link",this.$("#footer-places-terms-use a").attr("href")).parse(),t.link,n):mw.msg("mobile-frontend-editor-licensing",t.link,n)),e}}),f.getSectionId=m,e.exports=f},function(e,t,n){var i=n(1),o=n(22),s=n(0),r=n(11);function a(){o.apply(this,arguments)}i(a,o,{defaults:s.extend({},o.prototype.defaults,{collapseIcon:new r({name:"arrow",additionalClassNames:"cancel"}).options}),templatePartials:s.extend({},o.prototype.templatePartials,{icon:r.prototype.template}),className:"drawer position-fixed",appendToElement:"body",closeOnScroll:!0,events:s.extend({},o.prototype.events,{click:"stopPropagation"}),postRender:function(){var e=this;s.docReady(function(){e.appendTo(e.appendToElement),e.$el.parent().addClass("has-drawer")}),this.on("show",this.onShowDrawer.bind(this)),this.on("hide",this.onHideDrawer.bind(this))},stopPropagation:function(e){e.stopPropagation()},onShowDrawer:function(){var e=this;this.$el.parent().addClass("drawer-visible"),setTimeout(function(){var t=s.getWindow();t.one("click.drawer",e.hide.bind(e)),e.closeOnScroll&&t.one("scroll.drawer",e.hide.bind(e))},e.minHideDelay)},onHideDrawer:function(){this.$el.parent().removeClass("drawer-visible"),s.getWindow().off(".drawer")}}),e.exports=a},,,function(e,t,n){var i=n(25),o=n(1),s=n(0);function r(){i.apply(this,arguments)}o(r,i,{getReferenceFromContainer:function(e,t){var n,o=s.Deferred();return(n=t.find("#"+s.escapeSelector(e.substr(1)))).length?o.resolve({text:n.html()}):o.reject(i.ERROR_NOT_EXIST),o.promise()},getReference:function(e,t){return this.getReferenceFromContainer(decodeURIComponent(e),t.$("ol.references"))}}),e.exports=r},,,,,,,,,,,,,,,,,,,,,,,,,,function(e,t,n){var i=n(24),o=n(1),s=n(26),r=n(16),a=n(64),l=n(0),c=n(2),d=n(31),h=n(10),u=n(18),p=n(12),m=n(11),f=n(65),g=n(25),w=n(37),v=n(66),b=n(9),y=n(22),x=n(17),T=n(21),R=n(13),$=n(15),C=n(33),O=n(30),k=n(14),M=n(23),_=n(34),E=n(67),I=n(68),S=n(69),L=n(27),N=n(32);mw.mobileFrontend=i,mw.log.deprecate(i,"on",i.on,"The global EventEmitter should not be used (T156186)."),OO.mfExtend=o,t={extendSearchParams:L,ReferencesDrawer:f,ReferencesGateway:g,ReferencesHtmlScraperGateway:w,ReferencesMobileViewGateway:v,moduleLoader:i,time:r,util:l,View:c,Browser:h,context:s,cache:u,Button:p,Icon:m,icons:b,Panel:y,Section:x,Page:R,Anchor:$,Skin:C,OverlayManager:O,Overlay:k,LoadingOverlay:M,Drawer:_,CtaDrawer:E,PageList:I,toast:S,rlModuleLoader:N},mw.mobileFrontend.define("mobile.startup/util",l),mw.mobileFrontend.define("mobile.startup/View",c),mw.mobileFrontend.define("mobile.startup/Browser",h),mw.mobileFrontend.define("mobile.startup/cache",u),mw.mobileFrontend.define("mobile.startup/time",r),mw.mobileFrontend.define("mobile.startup/context",s),mw.mobileFrontend.define("mobile.startup/user",a),mw.mobileFrontend.define("mobile.startup/PageGateway",d),mw.mobileFrontend.define("mobile.startup/Button",p),mw.mobileFrontend.define("mobile.startup/Icon",m),mw.mobileFrontend.define("mobile.startup/icons",b),mw.mobileFrontend.define("mobile.startup/Panel",y),mw.mobileFrontend.define("mobile.startup/Section",x),mw.mobileFrontend.define("mobile.startup/Thumbnail",T),mw.mobileFrontend.define("mobile.startup/Page",R),mw.mobileFrontend.define("mobile.startup/Anchor",$),mw.mobileFrontend.define("mobile.startup/Skin",C),mw.mobileFrontend.define("mobile.startup/OverlayManager",O),mw.mobileFrontend.define("mobile.startup/Overlay",k),mw.mobileFrontend.define("mobile.startup/LoadingOverlay",M),mw.mobileFrontend.define("mobile.startup/Drawer",_),mw.mobileFrontend.define("mobile.startup/CtaDrawer",E),mw.mobileFrontend.define("mobile.startup/PageList",I),mw.mobileFrontend.define("mobile.startup/toast",S),mw.mobileFrontend.define("mobile.startup/rlModuleLoader",N),mw.mobileFrontend.deprecate("mobile.search.util/extendSearchParams",L,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.references/ReferencesDrawer",f,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.references.gateway/ReferencesGateway",g,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.references.gateway/ReferencesHtmlScraperGateway",w,"mobile.startup"),mw.mobileFrontend.deprecate("mobile.references.gateway/ReferencesMobileViewGateway",v,"mobile.startup"),mw.mobileFrontend.define("mobile.startup",t),e.exports=t},function(e,t,n){var i,o=mw.user,s=n(0);i={tokens:o.tokens,isAnon:o.isAnon,getName:o.getName,getId:o.getId,getGroups:function(){return s.Deferred().resolve(mw.config.get("wgUserGroups"))},getSessionId:function(){return o.sessionId()},inUserBucketA:function(){return mw.config.get("wgUserId")%2==0}},e.exports=i},function(e,t,n){var i=n(34),o=n(0),s=n(9),r=n(1),a=n(25),l=n(11);function c(){i.apply(this,arguments)}r(c,i,{defaults:o.extend({},i.prototype.defaults,{spinner:s.spinner().toHtmlString(),cancelButton:new l({name:"overlay-close-gray",additionalClassNames:"cancel",label:mw.msg("mobile-frontend-overlay-close")}).toHtmlString(),citation:new l({isSmall:!0,name:"citation",additionalClassNames:"text",hasText:!0,label:mw.msg("mobile-frontend-references-citation")}).toHtmlString(),errorClassName:new l({name:"error",hasText:!0,isSmall:!0}).getClassName()}),events:{"click sup a":"showNestedReference"},show:function(){return i.prototype.show.apply(this,arguments)},className:"drawer position-fixed text references",template:mw.template.get("mobile.startup","ReferencesDrawer.hogan"),closeOnScroll:!1,postRender:function(){var e=o.getWindow().height();i.prototype.postRender.apply(this),e/2<400&&this.$el.css("max-height",e/2),this.on("show",this.onShow.bind(this)),this.on("hide",this.onHide.bind(this))},onShow:function(){o.getDocument().find("body").addClass("drawer-enabled")},onHide:function(){o.getDocument().find("body").removeClass("drawer-enabled")},showReference:function(e,t,n){var i=this,o=this.options.gateway;return this.options.page=t,i.show(),o.getReference(e,t).then(function(e){i.render({title:n,text:e.text})},function(e){e===a.ERROR_NOT_EXIST?i.hide():i.render({error:!0,title:n,text:mw.msg("mobile-frontend-references-citation-error")})})},showNestedReference:function(e){var t=this.$(e.target);return this.showReference(t.attr("href"),this.options.page,t.text()),!1}}),e.exports=c},function(e,t,n){var i=n(37),o=n(18),s=n(25),r=o.MemoryCache,a=n(0),l=n(1),c=o.NoCache,d=null;function h(e,t){i.call(this,e),this.cache=t||new c}l(h,i,{getReferencesLists:function(e){var t=this,n=a.Deferred(),i=this.cache.get(e.id);return i?n.resolve(i).promise():(this.api.get({action:"mobileview",page:e.getTitle(),sections:"references",prop:"text",revision:e.getRevisionId()}).then(function(i){var o={};i.mobileview.sections.forEach(function(e){var t=a.parseHTML("<div>").html(e.text);o[t.find(".mw-headline").attr("id")]=t.find(".references")}),t.cache.set(e.id,o),n.resolve(o)},function(){n.reject(s.ERROR_OTHER)}),n.promise())},getReferencesList:function(e,t){return this.getReferencesLists(e).then(function(e){return!!Object.prototype.hasOwnProperty.call(e,t)&&e[t]})},getReference:function(e,t){var n=this;return this.getReferencesLists(t).then(function(t){var i=a.parseHTML("<div>");return Object.keys(t).forEach(function(e){i.append(t[e])}),n.getReferenceFromContainer(e,i)})}}),h.getSingleton=function(){return d||(d=new h(new mw.Api,new r)),d},e.exports=h},function(e,t,n){var i=n(1),o=n(34),s=n(0),r=n(12),a=n(15);function l(){o.apply(this,arguments)}i(l,o,{defaults:s.extend({},o.prototype.defaults,{progressiveButton:new r({progressive:!0,label:mw.msg("mobile-frontend-watchlist-cta-button-login")}).options,actionAnchor:new a({progressive:!0,label:mw.msg("mobile-frontend-watchlist-cta-button-signup")}).options}),templatePartials:s.extend({},o.prototype.templatePartials,{button:r.prototype.template,anchor:a.prototype.template}),template:mw.template.get("mobile.startup","CtaDrawer.hogan"),events:s.extend({},o.prototype.events,{"click .hide":"hide"}),preRender:function(){var e=s.extend({returnto:this.options.returnTo||mw.config.get("wgPageName")},this.options.queryParams),t=s.extend({type:"signup"},this.options.signupQueryParams);this.options.progressiveButton.href||(this.options.progressiveButton.href=mw.util.getUrl("Special:UserLogin",e)),this.options.actionAnchor.href||(this.options.actionAnchor.href=mw.util.getUrl("Special:UserLogin",s.extend(e,t)))}}),e.exports=l},function(e,t,n){var i=n(1),o=n(2),s=n(10).getSingleton();function r(){o.apply(this,arguments)}i(r,o,{defaults:{pages:[]},renderPageImages:function(){var e=this;setTimeout(function(){e.$(".list-thumb").each(function(){var t=e.$(this).data("style");e.$(this).attr("style",t)})},s.isWideScreen()?0:1e3)},postRender:function(){this.renderPageImages()},template:mw.template.get("mobile.startup","PageList.hogan"),templatePartials:{item:mw.template.get("mobile.startup","PageListItem.hogan")}}),e.exports=r},function(e,t,n){var i=n(0),o="mobileFrontend/toast";function s(){mw.requestIdleCallback(this._showPending.bind(this))}s.prototype.show=function(e,t){"string"==typeof t&&(mw.log.warn("The use of the cssClass parameter of Toast.show is deprecated, please convert it to an options object."),t={type:t}),t=i.extend({tag:"toast"},t),this.notification=mw.notify(e,t)},s.prototype.hide=function(){void 0!==this.notification&&this.notification.then(function(e){e.close()})},s.prototype.showOnPageReload=function(e,t){mw.storage.get(o)?mw.log.warn("A pending toast message already exits. The page should have been reloaded by now."):mw.storage.set(o,JSON.stringify({content:e,className:t}))},s.prototype._showPending=function(){var e=mw.storage.get(o);e&&(e=JSON.parse(e),this.show(e.content,e.className),mw.storage.remove(o))},e.exports=new s}],[[63,0]]]);
//# sourceMappingURL=mobile.startup.js.map.json