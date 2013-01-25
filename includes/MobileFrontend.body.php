<?php

class ExtMobileFrontend extends ContextSource {

	protected $zeroRatedBanner;

	public function __construct( IContextSource $context ) {
		$this->setContext( $context );
	}

	/**
	 * Attach hooks for MobileFrontend
	 * @TODO move remaining hook hander definitions after all changests merged from
	 *	https://gerrit.wikimedia.org/r/#/q/status:open+project:mediawiki/extensions/MobileFrontend+branch:master+topic:bug/43909,n,z
	 *
	 */
	public function attachHooks() {
		global $wgHooks;
		$wgHooks['UserLoginForm'][] = array( &$this, 'renderLogin' );
		$wgHooks['UserCreateForm'][] = array( &$this, 'renderAccountCreate' );
	}

	/**
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
	 * Work out the site and language name from a database name
	 * @param $site string
	 * @param $lang string
	 * @return string
	 */
	protected function getSite( &$site, &$lang ) {
		global $wgConf;
		wfProfileIn( __METHOD__ );
		$dbr = wfGetDB( DB_SLAVE );
		$dbName = $dbr->getDBname();
		list( $site, $lang ) = $wgConf->siteFromDB( $dbName );
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * @param $out OutputPage
	 * @return bool: Whether processing should be continued
	 */
	protected function beforePageDisplay( $out ) {
		wfProfileIn( __METHOD__ );

		$this->setDefaultLogo();

		$this->disableCaching();
		$this->sendXDeviceVaryHeader();

		wfProfileOut( __METHOD__ );
		return true;
	}

	public static function parseContentFormat( $format ) {
		if ( $format === 'wml' ) {
			return 'WML';
		} elseif ( $format === 'html' ) {
			return 'HTML';
		}
		if ( $format === 'mobile-wap' ) {
			return 'WML';
		}
		return 'HTML';
	}

	/**
	 * Disables caching if the request is coming from a trusted proxy
	 * @return bool
	 */
	private function disableCaching() {
		wfProfileIn( __METHOD__ );

		// Fetch the REMOTE_ADDR and check if it's a trusted proxy.
		// Is this enough, or should we actually step through the entire
		// X-FORWARDED-FOR chain?
		if ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
			$ip = IP::canonicalize( $_SERVER['REMOTE_ADDR'] );
		} else {
			$ip = null;
		}

		/**
		 * Compatibility with potentially new function wfIsConfiguredProxy()
		 * wfIsConfiguredProxy() checks an IP against the list of configured
		 * Squid servers and currently only exists in trunk.
		 * wfIsTrustedProxy() does the same, but also exposes a hook that is
		 * used on the WMF cluster to check and see if an IP address matches
		 * against a list of approved open proxies, which we don't actually
		 * care about.
		 */
		$trustedProxyCheckFunction = ( MFCompatCheck::checkWfIsConfiguredProxy() ) ? 'wfIsConfiguredProxy' : 'wfIsTrustedProxy';
		$request = $this->getRequest();
		if ( $trustedProxyCheckFunction( $ip ) ) {
			$request->response()->header( 'Cache-Control: no-cache, must-revalidate' );
			$request->response()->header( 'Expires: Sat, 26 Jul 1997 05:00:00 GMT' );
			$request->response()->header( 'Pragma: no-cache' );
		}

		wfProfileOut( __METHOD__ );
		return true;
	}

	private function sendXDeviceVaryHeader() {
		wfProfileIn( __METHOD__ );
		$out = $this->getOutput();
		$xDevice = MobileContext::singleton()->getXDevice();
		if ( $xDevice !== '' ) {
			$this->getRequest()->response()->header( "X-Device: {$xDevice}" );
			$out->addVaryHeader( 'X-Device' );
		}
		$out->addVaryHeader( 'Cookie' );
		$out->addVaryHeader( 'X-Carrier' );
		$out->addVaryHeader( 'X-Subdomain' );
		$out->addVaryHeader( 'X-Images' );
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * Invocation of hook UserLoginForm
	 * @param QuickTemplate $template Login form template object
	 * @return bool
	 */
	public function renderLogin( &$template ) {
		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			$template = new UserLoginMobileTemplate( $template );
			$this->prepareLoginWatchData( $template );
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * Invocation of hook UserCreateForm
	 * @param QuickTemplate $template Account creation form template object
	 * @return bool
	 */
	public function renderAccountCreate( &$template ) {
		wfProfileIn( __METHOD__ );
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			$template = new UserAccountCreateMobileTemplate( $template );
			$this->prepareLoginWatchData( $template );
		}
		wfProfileOut( __METHOD__ );
		return true;
	}

	/**
	 * Prepare template data if an anon is attempting to log in after watching an article
	 *
	 * @param QuickTemplate $template
	 */
	private function prepareLoginWatchData( $template ) {
		if ( $this->getRequest()->getVal( 'returntoquery' ) == 'article_action=watch' &&
			!is_null( $this->getRequest()->getVal( 'returnto' ) ) ) {
			$template->set( 'watch', $this->getRequest()->getVal( 'returnto' ) );
		}
	}

	/**
	 * @param OutputPage $out
	 *
	 * @return string
	 */
	public function DOMParse( OutputPage $out ) {
		wfProfileIn( __METHOD__ );

		if ( !$this->beforePageDisplay( $out ) ) {
			return false;
		}
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

		$isFilePage = $this->getTitle()->getNamespace() === NS_FILE;
		$formatter->enableRemovableSections( $context->isBetaGroupMember() && !$isFilePage );
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
			$formatter->whitelistIds( 'zero-language-search' );
			$formatter->filterContent();
			wfProfileOut( __METHOD__ . '-filter' );
		}

		wfProfileIn( __METHOD__ . '-getText' );
		$formatter->setIsMainPage( $this->getTitle()->isMainPage() );
		if ( $context->getContentFormat() == 'HTML'
			&& $this->getRequest()->getText( 'search' ) == '' )
		{
			$formatter->enableExpandableSections();
		}
		$contentHtml = $formatter->getText();
		wfProfileOut( __METHOD__ . '-getText' );

		if ( $this->getRequest()->getText( 'format' ) === 'json' ) {
			# There used to be an antiquated API
			# @todo: Remove in March 2013
			wfProfileIn( __METHOD__ . '-json' );
			wfDebugLog( 'json-hack', $this->getRequest()->getHeader( 'User-Agent' ) . "\n" );
			$this->getRequest()->response()->header( 'HTTP/1.1 404 Not Found' );
			$t = SpecialPage::getTitleFor( 'ApiSandbox' );
			$url = htmlentities( $t->getFullURL() );
			# Was used only on English Wikipedia, so assuming that ApiSandbox is present
			echo "<html><head><title>Not Found</title></head><body><h1>HTTP 404 Not Found</h1>This API has been deprecated.
			Use <a href='$url#action=mobileview'>our normal API</a>.</body></html>";
			$contentHtml = false;
			wfProfileOut( __METHOD__ . '-json' );
		}

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
			$wgMobileFrontendLogo = $wgExtensionAssetsPath . '/MobileFrontend/stylesheets/common/images/mw.png';
		}

		if ( MobileContext::singleton()->isBetaGroupMember() ) {
			$this->getSite( $site, $lang );
			if ( is_array( $wgMFCustomLogos ) && isset( $wgMFCustomLogos['site'] ) ) {
				if ( isset( $wgMFCustomLogos['site'] ) && $site == $wgMFCustomLogos['site'] ) {
					if ( isset( $wgMFCustomLogos['logo'] ) ) {
						$wgMobileFrontendLogo = $wgMFCustomLogos['logo'];
					}
				}
			}
		}
		wfProfileOut( __METHOD__ );
	}

	/**
	 * Prepares module definitions for mobile SpecialPages
	 *
	 * @param array $specialModuleStubs
	 * 	the key is the name of the special page you want to target (lowercased)
	 * 	the value of the array is an array with 3 recognised keys:
	 * 		- alias: names another key in $specialModuleStubs that this special page shares resources for
	 * 		- css: boolean that identifies there is a corresponding stylesheet for this module in stylesheets/specials/<modulename>.css where modulename is the key (special page name lowercased)
	 * 		- js: boolean that identifies there is a corresponding javascript file for this module in javascripts/specials/<modulename>.css  where modulename is the key
	 * @return array
	 *	Formatted and mergable with $wgResourceModules
	 */
	public static function generateMobileSpecialPageModules( $specialModuleStubs ) {
		$modules = array();
		foreach( $specialModuleStubs as $moduleName => $moduleMakeup ) {
			$module = array(
				'dependencies' => array( 'mobile.startup' ),
				'raw' => true,
				'localBasePath' => dirname( __DIR__ ),
				'remoteExtPath' => 'MobileFrontend',
				'targets' => 'mobile',
			);

			if ( isset( $moduleMakeup[ 'messages' ] ) ) {
				$module[ 'messages' ] = $moduleMakeup[ 'messages' ];
			}

			// allow special pages to use the same stylesheets / scripts as other special pages
			if ( isset( $moduleMakeup[ 'alias' ] ) ) {
				$resourceName = $moduleMakeup[ 'alias' ];
				$moduleMakeup = $specialModuleStubs[ $resourceName ];
			} else {
				$resourceName = $moduleName;
			}

			if ( isset( $moduleMakeup[ 'js' ] ) ) {
				$id = 'mobile.' . $moduleName . '.scripts';
				$modules[$id] = $module;
				$modules[$id]['scripts'] = array( "javascripts/specials/$resourceName.js" );
			}

			if ( isset( $moduleMakeup[ 'css' ] ) ) {
				$id = 'mobile.' . $moduleName . '.styles';
				$modules[$id] = $module;
				$modules[$id][ 'styles' ] = array( "stylesheets/specials/$resourceName.css" );
			}
		}
		return $modules;
	}
}

class MobileFrontendSiteModule extends ResourceLoaderSiteModule {
	protected function getPages( ResourceLoaderContext $context ) {
		global $wgMobileSiteResourceLoaderModule;
		return $wgMobileSiteResourceLoaderModule;
	}

	public function isRaw() {
		return true;
	}
}
