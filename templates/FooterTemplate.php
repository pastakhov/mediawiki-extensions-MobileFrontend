<?php

if ( !defined( 'MEDIAWIKI' ) ) {
        die( -1 );
}

class FooterTemplate extends MobileFrontendTemplate {

	public function getHTML() {
		$skin = RequestContext::getMain()->getSkin();
		$copyright = $skin->getCopyright();

		$regularSite = wfMsg( 'mobile-frontend-regular-site' );

		$termsUsage = wfMsg( 'mobile-frontend-terms-use' );
		$copyrightSymbol = $this->data['copyright-symbol'];

		$license = wfMsg( 'mobile-frontend-footer-license' );
		$disableImages = ( $this->data['isBetaGroupMember'] ) ? wfMsg( 'mobile-frontend-off' ) :
			wfMsg( 'mobile-frontend-disable-images' );
		$enableImages =  ( $this->data['isBetaGroupMember'] ) ? wfMsg( 'mobile-frontend-on' ) :
			wfMsg( 'mobile-frontend-enable-images' );
		$leaveFeedback = wfMsg( 'mobile-frontend-leave-feedback' );

		$leaveFeedbackURL = $this->data['leaveFeedbackURL'];
		$viewNormalSiteURL = $this->data['viewNormalSiteURL'];
		$viewNormalSiteLabel = wfMsg( 'mobile-frontend-view-desktop' );
		$mobileSiteLabel = wfMsg( 'mobile-frontend-view-mobile' );

		if ( $this->data['disableImages'] == 0 ) {
			$imagesToggle = $disableImages;
			$imagesPrefix = $enableImages . " / ";
			$imagesSuffix = "";
			$imagesURL = $this->data['disableImagesURL'];
		} else {
			$imagesToggle = $enableImages;
			$imagesPrefix = "";
			$imagesSuffix = " / " . $disableImages;
			$imagesURL = $this->data['enableImagesURL'];
		}
		$imagesToggleLabelPrefix = wfMsg( 'mobile-frontend-enable-images-prefix' );

		$logoutLink = ( $this->data['logoutHtml'] ) ? ' | ' . $this->data['logoutHtml'] : '';
		$logoutLink = ( $this->data['loginHtml'] ) ? ' | ' . $this->data['loginHtml'] : $logoutLink;

		$feedbackLink = ( $this->data['code'] == 'en' && $this->data['isBetaGroupMember'] ) ? "<a href=\"{$leaveFeedbackURL}\">{$leaveFeedback}</a>" : '';

		$footerDisplayNone = ( $this->data['hideFooter'] ) ? ' style="display: none;" ' : '';

		$skin = RequestContext::getMain()->getSkin();
		$disclaimerLink = $skin->disclaimerLink();
		$privacyLink = $this->getCustomFooterLink( $skin, 'mobile-frontend-privacy-link-text', 'privacypage' );
		$aboutLink = $this->getCustomFooterLink( $skin, 'mobile-frontend-about-link-text', 'aboutpage' );

		$normalFooter = <<<HTML
			<div class='nav' id='footmenu'>
				<div class='mwm-notice'>
				  <a href="{$viewNormalSiteURL}" id="mf-display-toggle">{$regularSite}</a> | <a id="imagetoggle" href="{$imagesURL}">{$imagesToggle}</a> {$feedbackLink} {$logoutLink}
				</div>
				<!-- List item to mimic desktop site environment where copyright appears in list (see bug 30406) -->
				<ul id='copyright'><li>{$copyright}</li></ul>
			</div>
HTML;
		$footerSitename = wfMessage( 'mobile-frontend-footer-sitename' )->escaped();
		if( $this->data['copyright-has-logo'] ) {
			$licenseHTML = <<<HTML
			<img src="{$this->data['wgExtensionAssetsPath']}/MobileFrontend/stylesheets/images/logo-copyright-{$this->data['language-code']}.png"
				class="license" alt="{$footerSitename} {$copyrightSymbol}">
HTML;
		} else {
			$licenseHTML = <<<HTML
			<div class="license">{$footerSitename} {$copyrightSymbol}</div>
HTML;
		}
		
		$footerMore = wfMessage( 'mobile-frontend-footer-more' )->escaped();
		$footerLess = wfMessage( 'mobile-frontend-footer-less' )->escaped();
		$footerContact = wfMessage( 'mobile-frontend-footer-contact' )->escaped();
		$betaFooter = <<<HTML
		<h2 class="section_heading" id="section_footer">
		<!-- TODO: make license icon and text dynamic -->
		{$licenseHTML}
		<span class="toggleCopyright">
			<span class="more">{$footerMore}</span><span class="less">{$footerLess}</span>
		</span>
		</h2>
		<div class="content_block" id="content_footer">
			<ul class="settings">
				<li>
				<span class="left separator"><a href="{$viewNormalSiteURL}">{$viewNormalSiteLabel}</a></span><span class="right">
				{$mobileSiteLabel}</span>
				</li>
				<li>
				<span class="left">{$termsUsage}</span><span class="right">{$imagesToggleLabelPrefix} {$imagesPrefix}<a id="imagetoggle" href="{$imagesURL}#section_footer">{$imagesToggle}</a>{$imagesSuffix}</span>
				</li>
				<li class="notice">
				{$license}
				</li>
			</ul>
			<ul class='links'>
				<li>
					<a href="{$this->data['leaveFeedbackURL']}">{$footerContact}</a>
				</li><li>
					{$privacyLink}
				</li><li>
					{$aboutLink}
				</li><li>
					{$disclaimerLink}
				</li>
			</ul>
		</div>
HTML;
		$footer = ( $this->data['isBetaGroupMember'] ) ? $betaFooter : $normalFooter;
		$footerHtml = <<<HTML
			<div id='footer' {$footerDisplayNone}>
				{$footer}
			</div>

HTML;
		return $footerHtml;
	}
}
