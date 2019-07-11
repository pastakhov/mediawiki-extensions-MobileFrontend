this.mfModules=this.mfModules||{},this.mfModules["mobile.talk.overlays"]=(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{"./src/mobile.talk.overlays/AddTopicForm.js":function(t,e,s){var i=s("./src/mobile.startup/mfExtend.js"),o=s("./src/mobile.startup/View.js"),a=s("./src/mobile.startup/Panel.js"),n=s("./src/mobile.startup/util.js");function r(t){var e=new a;return e.$el.append(t),e}function l(t){o.call(this,n.extend(t,{topicTitlePlaceHolder:mw.msg("mobile-frontend-talk-add-overlay-subject-placeholder"),topicContentPlaceHolder:mw.msg("mobile-frontend-talk-add-overlay-content-placeholder"),className:"add-topic-form",events:{"input .wikitext-editor, input":"onTextInput","change .wikitext-editor, input":"onTextInput"}}))}i(l,o,{postRender:function(){var t=this.options,e=t.disabled,s=n.parseHTML("<input>").attr({class:"mw-ui-input",type:"text",disabled:e,value:t.subject,placeholder:t.topicTitlePlaceHolder}),i=n.parseHTML("<textarea>").attr({class:"wikitext-editor mw-ui-input",cols:40,rows:10,disabled:e,placeholder:t.topicContentPlaceHolder}).val(t.body),a=[r(n.parseHTML("<p>").addClass("license").html(t.licenseMsg)),r(s),r(i)];this.$el.append(a.map(function(t){return t.$el})),this.$subject=s,this.$messageBody=i,o.prototype.postRender.apply(this,arguments)},onTextInput:function(){this.options.onTextInput&&this.options.onTextInput(this.$subject.val().trim(),this.$messageBody.val().trim())}}),l.test={makePanel:r},t.exports=l},"./src/mobile.talk.overlays/TalkSectionAddOverlay.js":function(t,e,s){var i=s("./src/mobile.startup/mfExtend.js"),o=s("./src/mobile.startup/headers.js"),a=s("./src/mobile.startup/Overlay.js"),n=s("./src/mobile.startup/PageGateway.js"),r=s("./src/mobile.startup/util.js"),l=s("./src/mobile.talk.overlays/makeAddTopicForm.js"),d=s("./src/mobile.startup/toast.js");function c(t){this.editorApi=t.api,this.pageGateway=new n(t.api),a.call(this,r.extend(t,{className:"talk-overlay overlay",events:{"click .save":"onSaveClick"}})),this.title=t.title,this.currentPageTitle=t.currentPageTitle,this.eventBus=t.eventBus,this._saveHit=!1}i(c,a,{preRender:function(){this.options.headers=[o.saveHeader(mw.msg("mobile-frontend-talk-add-overlay-submit"),"initial-header save-header"),o.savingHeader(mw.msg("mobile-frontend-talk-topic-wait"))]},postRender:function(){var t;a.prototype.postRender.call(this),t=l({subject:"",body:"",disabled:!1,licenseMsg:this.options.licenseMsg,onTextInput:this.onTextInput.bind(this)}),this.showHidden(".initial-header"),this.$confirm=this.$el.find("button.save"),this.$el.find(".overlay-content").append(t.$el),this.$subject=t.$el.find("input"),this.$ta=t.$el.find(".wikitext-editor")},hide:function(){var t,e=mw.msg("mobile-frontend-editor-cancel-confirm");return t=!this.$subject.val()&&!this.$ta.val(),!!(this._saveHit||t||window.confirm(e))&&a.prototype.hide.apply(this,arguments)},onTextInput:function(t,e){this.subject=t,this.body=e,clearTimeout(this.timer),this.timer=setTimeout(function(){e&&t?this.$confirm.prop("disabled",!1):this.$confirm.prop("disabled",!0)}.bind(this),250)},onSaveClick:function(){var t=this.title===this.currentPageTitle;this.showHidden(".saving-header"),this.save().then(function(e){"ok"===e&&(t?this.eventBus.emit("talk-added-wo-overlay"):(this.pageGateway.invalidatePage(this.title),d.show(mw.msg("mobile-frontend-talk-topic-feedback")),this.eventBus.emit("talk-discussion-added"),this.hide()))}.bind(this),function(t){var e=mw.msg("mobile-frontend-talk-topic-error");switch(this.$confirm.prop("disabled",!1),t.details){case"protectedpage":e=mw.msg("mobile-frontend-talk-topic-error-protected");break;case"noedit":case"blocked":e=mw.msg("mobile-frontend-talk-topic-error-permission");break;case"spamdetected":e=mw.msg("mobile-frontend-talk-topic-error-spam");break;case"badtoken":e=mw.msg("mobile-frontend-talk-topic-error-badtoken");break;default:e=mw.msg("mobile-frontend-talk-topic-error")}d.show(e,{type:"error"}),this.showHidden(".save-header, .save-panel")}.bind(this))},save:function(){var t=this.subject,e=r.Deferred();return this.$ta.removeClass("error"),this.$subject.removeClass("error"),this._saveHit=!0,this.$el.find(".content").empty().addClass("loading"),this.editorApi.postWithToken("csrf",{action:"edit",section:"new",sectiontitle:t,title:this.title,summary:mw.msg("newsectionsummary",t),text:this.body}).then(function(){return"ok"},function(t){return e.reject({type:"error",details:t})})}}),t.exports=c},"./src/mobile.talk.overlays/TalkSectionOverlay.js":function(t,e,s){var i=mw.user,o=s("./src/mobile.startup/icons.js"),a=o.spinner().$el,n=s("./src/mobile.startup/mfExtend.js"),r=s("./src/mobile.startup/PageGateway.js"),l=s("./src/mobile.startup/Overlay.js"),d=s("./src/mobile.startup/headers.js").header,c=s("./src/mobile.startup/util.js"),p=s("./src/mobile.startup/toast.js"),m=s("./src/mobile.talk.overlays/autosign.js"),u=s("./src/mobile.startup/Page.js"),h=s("./src/mobile.startup/Button.js");function b(t){this.editorApi=t.api,this.pageGateway=new r(t.api),l.call(this,c.extend(!0,t,{className:"talk-overlay overlay",events:{"focus textarea":"onFocusTextarea","click .save-button":"onSaveClick"}}))}n(b,l,{templatePartials:c.extend({},l.prototype.templatePartials,{content:c.template('\n<div class="content talk-section">\n\t{{{section.text}}}\n\t<div class="comment">\n\t\t<div class="list-header">{{reply}}</div>\n\t\t<div class="comment-content">\n\t\t\t<textarea class="wikitext-editor"></textarea>\n\t\t\t<p class="license">\n\t\t\t\t{{info}}\n\t\t\t\t{{{licenseMsg}}}\n\t\t\t</p>\n\t\t</div>\n\t</div>\n</div>\n\t\t')}),defaults:c.extend({},l.prototype.defaults,{saveButton:new h({block:!0,additionalClassNames:"save-button",progressive:!0,label:c.saveButtonMessage()}),title:void 0,section:void 0,reply:mw.msg("mobile-frontend-talk-reply"),info:mw.msg("mobile-frontend-talk-reply-info")}),preRender:function(){var t=this.options;this.options.headers=[d(t.section?t.section.line:"",[],o.back(),"initial-header")]},postRender:function(){l.prototype.postRender.apply(this),this.$el.find(".talk-section").prepend(a),this.$saveButton=this.options.saveButton.$el,this.$el.find(".comment-content").append(this.$saveButton),this.options.section?(this.hideSpinner(),this._enableComments()):this.renderFromApi(this.options)},_enableComments:function(){this.$commentBox=this.$el.find(".comment"),i.isAnon()?this.$commentBox.remove():this.$textarea=this.$commentBox.find("textarea")},renderFromApi:function(t){var e=this;this.pageGateway.getPage(t.title).then(function(s){var i=new u(s);t.section=i.getSection(t.id),e.render(t),e.hideSpinner()})},onFocusTextarea:function(){this.$textarea.removeClass("error")},onSaveClick:function(){var t=this.$textarea.val(),e=this;function s(){e.$saveButton.prop("disabled",!1)}t?(this.showSpinner(),this.$saveButton.prop("disabled",!0),t="\n\n"+m(t),this.editorApi.postWithToken("csrf",{action:"edit",title:this.options.title,section:this.options.id,appendtext:t,redirect:!0}).then(function(){p.show(mw.msg("mobile-frontend-talk-reply-success")),e.pageGateway.invalidatePage(e.options.title),e.renderFromApi(e.options),s()},function(t,i){var o;o=i.error&&["readonly","blocked","autoblocked"].indexOf(i.error.code)>-1?i.error.info:mw.msg("mobile-frontend-editor-error"),e.hideSpinner(),p.show(o,"toast error"),s()})):this.$textarea.addClass("error")}}),t.exports=b},"./src/mobile.talk.overlays/autosign.js":function(t,e){t.exports=function(t){return/~{3,5}/.test(t)?t:t+" ~~~~"}},"./src/mobile.talk.overlays/makeAddTopicForm.js":function(t,e,s){var i=s("./src/mobile.talk.overlays/AddTopicForm.js"),o=s("./src/mobile.talk.overlays/autosign.js");t.exports=function(t){var e=t.licenseMsg,s=t.onTextInput,a=t.subject,n=t.body,r=t.disabled;return new i({licenseMsg:e,disabled:r,subject:a,body:n,onTextInput:s?function(t,e){e&&(e=o(e)),s.call(this,t,e)}:void 0})}},"./src/mobile.talk.overlays/mobile.talk.overlays.js":function(t,e,s){var i=s("./src/mobile.startup/moduleLoaderSingleton.js"),o=s("./src/mobile.talk.overlays/talkBoard.js"),a=s("./src/mobile.talk.overlays/TalkSectionAddOverlay.js"),n=s("./src/mobile.talk.overlays/TalkSectionOverlay.js");i.define("mobile.talk.overlays/talkBoard",o),i.define("mobile.talk.overlays/TalkSectionAddOverlay",a),i.define("mobile.talk.overlays/TalkSectionOverlay",n)},"./src/mobile.talk.overlays/talkBoard.js":function(t,e,s){var i=s("./src/mobile.startup/util.js"),o=s("./src/mobile.startup/View.js");t.exports=function(t){var e,s=t.length>0?mw.msg("mobile-frontend-talk-explained"):mw.msg("mobile-frontend-talk-explained-empty");return(e=new o({className:"talk-board"})).append([i.parseHTML('<p class="content-header">').text(s),i.parseHTML('<ul class="topic-title-list">').append(t.map(function(t){return i.parseHTML("<li>").append(i.parseHTML("<a>").attr("href","#/talk/"+t.id).text(t.line))}))]),e}}},[["./src/mobile.talk.overlays/mobile.talk.overlays.js",0,1]]]);
//# sourceMappingURL=mobile.talk.overlays.js.map.json