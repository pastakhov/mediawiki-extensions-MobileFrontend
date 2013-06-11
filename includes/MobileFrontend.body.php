<?php

class ExtMobileFrontend extends ContextSource {

	protected $zeroRatedBanner;

	public function __construct( IContextSource $context ) {
		$this->setContext( $context );
	}

	/**
	 * FIXME: Move to ZeroRatedMobileAccess extension
	 * @return string
	 */
	public function getZeroRatedBanner() {
		$zeroRatedBanner = $this->zeroRatedBanner ? str_replace( 'display:none;', '', $this->zeroRatedBanner ) : '';

		if ( $zeroRatedBanner ) {
			if ( strstr( $zeroRatedBanner, 'id="zero-rated-banner"><span' ) ) {
				$zeroRatedBanner = str_replace( 'id="zero-rated-banner"><span', 'id="zero-rated-banner"><span', $zeroRatedBanner );
			}
		}
		return $zeroRatedBanner;
	}

	/**
	 * @param $out OutputPage
	 */
	protected function beforePageDisplay( $out ) {
		wfProfileIn( __METHOD__ );

		$this->setDefaultLogo();

		$this->sendHeaders();

		wfProfileOut( __METHOD__ );
	}

	private function sendHeaders() {
		global $wgMFVaryResources;

		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$xDevice = MobileContext::singleton()->getXDevice();
		$request = $this->getRequest();
		$xWap = $request->getHeader( 'X-WAP' );
		if ( $xDevice !== '' && !$wgMFVaryResources ) {
			$request->response()->header( "X-Device: {$xDevice}" );
			$out->addVaryHeader( 'X-Device' );
		} elseif ( $xWap ) {
			$out->addVaryHeader( 'X-WAP' );
			$request->response()->header( "X-WAP: $xWap" );
		}
		$out->addVaryHeader( 'Cookie' );
		// @todo: these should be set by Zero
		$out->addVaryHeader( 'X-CS' );
		$out->addVaryHeader( 'X-Subdomain' );
		$out->addVaryHeader( 'X-Images' );
		wfProfileOut( __METHOD__ );
	}

	/**
	 * @param OutputPage $out
	 *
	 * @return string
	 */
	public function DOMParse( OutputPage $out ) {
		wfProfileIn( __METHOD__ );

		$this->beforePageDisplay( $out );
		$html = $out->getHTML();

		wfProfileIn( __METHOD__ . '-formatter-init' );
		$context = MobileContext::singleton();
		$wmlContext = $context->getContentFormat() == 'WML' ? new WmlContext( $context ) : null;
		$formatter = new MobileFormatter( MobileFormatter::wrapHTML( $html ), $this->getTitle(),
			$context->getContentFormat(), $wmlContext
		);
		if ( $context->isBetaGroupMember() ) {
			$formatter->disableBackToTop();
		}

		$ns = $this->getTitle()->getNamespace();
		$isMainPage = $this->getTitle()->isMainPage();
		$isFilePage = $ns === NS_FILE;
		$doc = $formatter->getDoc();
		wfProfileOut( __METHOD__ . '-formatter-init' );

		wfProfileIn( __METHOD__ . '-zero' );
		$zeroRatedBannerElement = $doc->getElementById( 'zero-rated-banner' );

		if ( !$zeroRatedBannerElement ) {
			$zeroRatedBannerElement = $doc->getElementById( 'zero-rated-banner-red' );
		}

		if ( $zeroRatedBannerElement ) {
			$this->zeroRatedBanner = $doc->saveXML( $zeroRatedBannerElement, LIBXML_NOEMPTYTAG );
		}
		wfProfileOut( __METHOD__ . '-zero' );

		if ( $context->getContentTransformations() ) {
			wfProfileIn( __METHOD__ . '-filter' );
			if ( !$isFilePage ) {
				$formatter->removeImages( $context->imagesDisabled() );
			}
			$formatter->filterContent();
			wfProfileOut( __METHOD__ . '-filter' );
		}

		wfProfileIn( __METHOD__ . '-getText' );
		if ( !$context->isAlphaGroupMember() ) {
			$formatter->setIsMainPage( $isMainPage );
		}

		if ( $context->getContentFormat() == 'HTML'
			&& $this->getRequest()->getText( 'search' ) == '' )
		{
			$formatter->enableExpandableSections( !$isMainPage );
		}
		$contentHtml = $formatter->getText();
		wfProfileOut( __METHOD__ . '-getText' );

		wfProfileOut( __METHOD__ );
		return $contentHtml;
	}

	/**
	 * Sets up the default logo image used in mobile view if none is set
	 */
	public function setDefaultLogo() {
		global $wgMobileFrontendLogo, $wgExtensionAssetsPath, $wgMFCustomLogos;
		wfProfileIn( __METHOD__ );
		if ( $wgMobileFrontendLogo === false ) {
			$wgMobileFrontendLogo = $wgExtensionAssetsPath . '/MobileFrontend/images/mw.png';
		}

		if ( MobileContext::singleton()->isBetaGroupMember() && isset( $wgMFCustomLogos['logo'] ) ) {
			$wgMobileFrontendLogo = $wgMFCustomLogos['logo'];
		}
		wfProfileOut( __METHOD__ );
	}
}
