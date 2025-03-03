<?php

use MediaWiki\Auth\AuthenticationRequest;
use MediaWiki\Auth\AuthManager;
use MediaWiki\ChangeTags\Taggable;
use MediaWiki\Extension\AbuseFilter\Variables\VariableHolder;
use MediaWiki\MediaWikiServices;
use MediaWiki\ResourceLoader as RL;
use MediaWiki\ResourceLoader\ResourceLoader;
use MobileFrontend\Api\ApiParseExtender;
use MobileFrontend\ContentProviders\DefaultContentProvider;
use MobileFrontend\Models\MobilePage;
use MobileFrontend\Transforms\LazyImageTransform;
use MobileFrontend\Transforms\MakeSectionsTransform;

/**
 * Hook handlers for MobileFrontend extension
 *
 * Hook handler method names should be in the form of:
 *	on<HookName>()
 * For instance, the hook handler for the 'RequestContextCreateSkin' would be called:
 *	onRequestContextCreateSkin()
 *
 * If your hook changes the behaviour of the Minerva skin, you are in the wrong place.
 * Any changes relating to Minerva should go into Minerva.hooks.php
 */
class MobileFrontendHooks {
	private const MOBILE_PREFERENCES_SECTION = 'rendering/mobile';
	public const MOBILE_PREFERENCES_SPECIAL_PAGES = 'mobile-specialpages';
	public const MOBILE_PREFERENCES_EDITOR = 'mobile-editor';
	private const ENABLE_SPECIAL_PAGE_OPTIMISATIONS = '1';
	// This should always be kept in sync with @width-breakpoint-tablet
	// in resources/src/mediawiki.less/mediawiki.ui/variables.less
	private const DEVICE_WIDTH_TABLET = '720px';

	/**
	 * Enables the global booleans $wgHTMLFormAllowTableFormat and $wgUseMediaWikiUIEverywhere
	 * for mobile users.
	 */
	private static function enableMediaWikiUI() {
		// FIXME: Temporary variables, will be deprecated in core in the future
		global $wgHTMLFormAllowTableFormat, $wgUseMediaWikiUIEverywhere;

		$mobileContext = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );

		if ( $mobileContext->shouldDisplayMobileView() ) {
			// Force non-table based layouts (see T65428)
			$wgHTMLFormAllowTableFormat = false;
			// Turn on MediaWiki UI styles so special pages with form are styled.
			// FIXME: Remove when this becomes the default.
			$wgUseMediaWikiUIEverywhere = true;
		}
	}

	/**
	 * Obtain the default mobile skin
	 *
	 * @param Config $config
	 * @throws SkinException If a factory function isn't registered for the skin name
	 * @return Skin
	 */
	protected static function getDefaultMobileSkin( Config $config ): Skin {
		$defaultSkin = $config->get( 'DefaultMobileSkin' );

		if ( !$defaultSkin ) {
			$defaultSkin = $config->get( 'DefaultSkin' );
		}

		$factory = MediaWikiServices::getInstance()->getSkinFactory();
		return $factory->makeSkin( Skin::normalizeKey( $defaultSkin ) );
	}

	/**
	 * RequestContextCreateSkin hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RequestContextCreateSkin
	 *
	 * @param IContextSource $context The RequestContext object the skin is being created for.
	 * @param Skin|null|string &$skin A variable reference you may set a Skin instance or string
	 *                                key on to override the skin that will be used for the context.
	 * @return bool
	 */
	public static function onRequestContextCreateSkin( $context, &$skin ) {
		$services = MediaWikiServices::getInstance();

		/** @var MobileContext $mobileContext */
		$mobileContext = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );

		$mobileContext->doToggling();
		if ( !$mobileContext->shouldDisplayMobileView() ) {
			return true;
		}

		// enable wgUseMediaWikiUIEverywhere
		self::enableMediaWikiUI();

		// Handle any X-Analytics header values in the request by adding them
		// as log items. X-Analytics header values are serialized key=value
		// pairs, separated by ';', used for analytics purposes.
		$xanalytics = $mobileContext->getRequest()->getHeader( 'X-Analytics' );
		if ( $xanalytics ) {
			$xanalytics_arr = explode( ';', $xanalytics );
			if ( count( $xanalytics_arr ) > 1 ) {
				foreach ( $xanalytics_arr as $xanalytics_item ) {
					$mobileContext->addAnalyticsLogItemFromXAnalytics( $xanalytics_item );
				}
			} else {
				$mobileContext->addAnalyticsLogItemFromXAnalytics( $xanalytics );
			}
		}

		// log whether user is using beta/stable
		$mobileContext->logMobileMode();

		// Allow overriding of skin by useskin e.g. useskin=vector&useformat=mobile or by
		// setting the mobileskin preferences (api only currently)
		$userOption = $services->getUserOptionsLookup()->getOption(
			$context->getUser(), 'mobileskin'
		);
		$userSkin = $context->getRequest()->getVal( 'useskin', $userOption );
		if ( $userSkin && Skin::normalizeKey( $userSkin ) === $userSkin ) {
			$skin = $services->getSkinFactory()->makeSkin( $userSkin );
		} else {
			$skin = self::getDefaultMobileSkin( $config );
		}

		$hookContainer = $services->getHookContainer();
		$hookContainer->run( 'RequestContextCreateSkinMobile', [ $mobileContext, $skin ] );

		return false;
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforeInitialize
	 *
	 * @param mixed $title
	 * @param mixed $unused
	 * @param OutputPage $out
	 */
	public static function onBeforeInitialize( $title, $unused, OutputPage $out ) {
		// Set the mobile target.
		// Note that it is NOT SAFE to look at Title, Skin or User from this hook (the title may
		// be invalid here, and is not yet rewritten, normalised, or replaced by other hooks).
		// May only look at WebRequest.
		$context = MobileContext::singleton();
		if ( $context->shouldDisplayMobileView() ) {
			$out->setTarget( 'mobile' );
		}
	}

	/**
	 * MediaWikiPerformAction hook handler (enable mwui for all pages)
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/MediaWikiPerformAction
	 *
	 * @param OutputPage $output
	 * @param Article $article
	 * @param Title $title Page title
	 * @param User $user User performing action
	 * @param RequestContext $request
	 * @param MediaWiki $wiki
	 */
	public static function onMediaWikiPerformAction( $output, $article, $title,
		$user, $request, $wiki
	) {
		self::enableMediaWikiUI();
	}

	/**
	 * Update the footer
	 * @param Skin $skin
	 * @param string $key the current key for the current group (row) of footer links.
	 *   e.g. `info` or `places`.
	 * @param array &$footerLinks an empty array that can be populated with new links.
	 *   keys should be strings and will be used for generating the ID of the footer item
	 *   and value should be an HTML string.
	 */
	public static function onSkinAddFooterLinks( Skin $skin, string $key, array &$footerLinks ) {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );

		if ( $key === 'places' ) {
			if ( $context->shouldDisplayMobileView() ) {
				$terms = MobileFrontendSkinHooks::getTermsLink( $skin );
				if ( $terms ) {
					$footerLinks['terms-use'] = $terms;
				}
				$footerLinks['desktop-toggle'] = MobileFrontendSkinHooks::getDesktopViewLink( $skin, $context );
			} else {
				// If desktop site append a mobile view link
				$footerLinks['mobileview'] =
					MobileFrontendSkinHooks::getMobileViewLink( $skin, $context );
			}
		}
	}

	/**
	 * SkinAfterBottomScripts hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinAfterBottomScripts
	 *
	 * Adds an inline script for lazy loading the images in Grade C browsers.
	 *
	 * @param Skin $skin
	 * @param string &$html bottomScripts text. Append to $text to add additional
	 *                      text/scripts after the stock bottom scripts.
	 */
	public static function onSkinAfterBottomScripts( Skin $skin, &$html ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );

		// TODO: We may want to enable the following script on Desktop Minerva...
		// ... when Minerva is widely used.
		if ( $context->shouldDisplayMobileView() &&
			$featureManager->isFeatureAvailableForCurrentUser( 'MFLazyLoadImages' )
		) {
			$html .= Html::inlineScript( ResourceLoader::filter( 'minify-js',
				LazyImageTransform::gradeCImageSupport()
			), $skin->getOutput()->getCSP()->getNonce() );
		}
	}

	/**
	 * BeforeDisplayNoArticleText hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforeDisplayNoArticleText
	 *
	 * @param Article $article The (empty) article
	 * @return bool This hook can abort
	 */
	public static function onBeforeDisplayNoArticleText( $article ) {
		/** @var MobileContext $context */
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$displayMobileView = $context->shouldDisplayMobileView();

		$title = $article->getTitle();

		// if the page is a userpage
		// @todo: Upstream to core (T248347).
		if ( $displayMobileView &&
			$title->inNamespaces( NS_USER ) &&
			!$title->isSubpage()
		) {
			$out = $article->getContext()->getOutput();
			$userpagetext = ExtMobileFrontend::blankUserPageHTML( $out, $title );
			if ( $userpagetext ) {
				// Replace the default message with ours
				$out->addHTML( $userpagetext );
				return false;
			}
		}

		return true;
	}

	/**
	 * OutputPageBeforeHTML hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/OutputPageBeforeHTML
	 *
	 * Applies MobileFormatter to mobile viewed content
	 *
	 * @param OutputPage $out the OutputPage object to which wikitext is added
	 * @param string &$text the HTML to be wrapped inside the #mw-content-text element
	 */
	public static function onOutputPageBeforeHTML( $out, &$text ) {
		// This hook can be executed more than once per page view if the page content is composed from
		// multiple sources! Anything that doesn't depend on $text should use onBeforePageDisplay.

		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$title = $out->getTitle();
		$config = $services->getService( 'MobileFrontend.Config' );
		$displayMobileView = $context->shouldDisplayMobileView();

		if ( !$title ) {
			return;
		}

		$options = $config->get( 'MFMobileFormatterOptions' );
		$excludeNamespaces = $options['excludeNamespaces'] ?? [];
		// Perform a few extra changes if we are in mobile mode
		$namespaceAllowed = !$title->inNamespaces( $excludeNamespaces );

		$provider = new DefaultContentProvider( $text );
		$originalProviderClass = DefaultContentProvider::class;
		$services->getHookContainer()->run( 'MobileFrontendContentProvider', [
			&$provider, $out
		] );

		$isParse = ApiParseExtender::isParseAction(
			$context->getRequest()->getText( 'action' )
		);

		if ( get_class( $provider ) === $originalProviderClass ) {
			// This line is important to avoid the default content provider running unnecessarily
			// on desktop views.
			$useContentProvider = $displayMobileView;
			$runMobileFormatter = $displayMobileView && (
				// T245160 - don't run the mobile formatter on old revisions.
				// Note if not the default content provider we ignore this requirement.
				$title->getLatestRevID() > 0 ||
				// Always allow the formatter in ApiParse
				$isParse
			);
		} else {
			// When a custom content provider is enabled, always use it.
			$useContentProvider = true;
			$runMobileFormatter = $displayMobileView;
		}

		if ( $namespaceAllowed && $useContentProvider ) {
			$text = ExtMobileFrontend::domParseWithContentProvider(
				$provider, $out, $runMobileFormatter
			);
		}
	}

	/**
	 * Modifies the `<body>` element's attributes.
	 *
	 * By default, the `class` attribute is set to the output's "bodyClassName"
	 * property.
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @param string[] &$bodyAttrs
	 */
	public static function onOutputPageBodyAttributes( OutputPage $out, Skin $skin, &$bodyAttrs ) {
		$userMode = MediaWikiServices::getInstance()->getService( 'MobileFrontend.AMC.UserMode' );
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$isMobile = $context->shouldDisplayMobileView();

		if ( $isMobile && !$userMode->isEnabled() ) {
			$bodyAttrs['class'] .= ' mw-mf-amc-disabled';
		}

		if ( $isMobile ) {
			// Add a class to the body so that TemplateStyles (which can only
			// access html and body) and gadgets have something to check for.
			// @stable added in 1.38
			$bodyAttrs['class'] .= ' mw-mf';
		}
	}

	/**
	 * BeforePageRedirect hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageRedirect
	 *
	 * Ensures URLs are handled properly for select special pages.
	 * @param OutputPage $out
	 * @param string &$redirect URL string, modifiable
	 * @param string &$code HTTP code (eg '301' or '302'), modifiable
	 */
	public static function onBeforePageRedirect( $out, &$redirect, &$code ) {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$shouldDisplayMobileView = $context->shouldDisplayMobileView();
		if ( !$shouldDisplayMobileView ) {
			return;
		}

		// T45123: force mobile URLs only for local redirects
		if ( $context->isLocalUrl( $redirect ) ) {
			$out->addVaryHeader( 'X-Subdomain' );
			$redirect = $context->getMobileUrl( $redirect );
		}
	}

	/**
	 * DifferenceEngineViewHeader hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/DifferenceEngineViewHeader
	 *
	 * Redirect Diff page to mobile version if appropriate
	 *
	 * @param DifferenceEngine $diff DifferenceEngine object that's calling
	 */
	public static function onDifferenceEngineViewHeader( $diff ) {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );

		$oldRevRecord = $diff->getOldRevision();
		$newRevRecord = $diff->getNewRevision();

		// Only do redirects to MobileDiff if user is in mobile view and it's not a special page
		if ( $context->shouldDisplayMobileView() &&
			!$context->getTitle()->isSpecialPage() &&
			self::shouldMobileFormatSpecialPages( $context->getUser() )
		) {
			$output = $context->getOutput();
			$newRevId = $newRevRecord->getId();

			// Pass other query parameters, e.g. 'unhide' (T263937)
			$otherParams = $diff->getContext()->getRequest()->getValues();
			unset( $otherParams['diff'] );
			unset( $otherParams['oldid'] );
			// We pass diff/oldid through the page title, so we must unset any parameters
			// that override the title (but don't override diff/oldid)
			unset( $otherParams['title'] );
			unset( $otherParams['curid'] );

			$redirectUrl = SpecialPage::getTitleFor( 'MobileDiff', (string)$newRevId )->getFullURL( $otherParams );

			// The MobileDiff page currently only supports showing a single revision, so
			// only redirect to MobileDiff if we are sure this isn't a multi-revision diff.
			if ( $oldRevRecord ) {
				// Get the revision immediately before the new revision
				$prevRevRecord = MediaWikiServices::getInstance()
					->getRevisionLookup()
					->getPreviousRevision( $newRevRecord );
				if ( $prevRevRecord ) {
					$prevRevId = $prevRevRecord->getId();
					$oldRevId = $oldRevRecord->getId();
					if ( $prevRevId === $oldRevId ) {
						$output->redirect( $redirectUrl );
					}
				}
			} else {
				$output->redirect( $redirectUrl );
			}
		}
	}

	/**
	 * ResourceLoaderSiteStylesModulePages hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderSiteStylesModulePages
	 *
	 * @param string $skin
	 * @param array &$pages to sort modules from.
	 */
	public static function onResourceLoaderSiteStylesModulePages( $skin, &$pages ) {
		$ctx = MobileContext::singleton();
		$ucaseSkin = ucfirst( $skin );
		if ( $ctx->shouldDisplayMobileView() ) {
			$services = MediaWikiServices::getInstance();
			$config = $services->getService( 'MobileFrontend.Config' );
			unset( $pages['MediaWiki:Common.css'] );
			unset( $pages['MediaWiki:Print.css'] );
			// MediaWiki:<skinname>.css suffers from the same problems as MediaWiki:Common.css
			// in that it has traditionally been written for desktop skins and is bloated.
			// We have always removed this on mobile for this reason.
			// If we loaded this there is absolutely no point in MediaWiki:Mobile.css! (T248415)
			unset( $pages["MediaWiki:$ucaseSkin.css"] );
			if ( $config->get( 'MFSiteStylesRenderBlocking' ) ) {
				$pages['MediaWiki:Mobile.css'] = [ 'type' => 'style' ];
			}
		}
	}

	/**
	 * ResourceLoaderSiteModulePages hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderSiteModulePages
	 *
	 * @param string $skin
	 * @param array &$pages to sort modules from.
	 */
	public static function onResourceLoaderSiteModulePages( $skin, &$pages ) {
		$ctx = MobileContext::singleton();
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
		if ( $ctx->shouldDisplayMobileView() ) {
			unset( $pages['MediaWiki:Common.js'] );
			$pages['MediaWiki:Mobile.js'] = [ 'type' => 'script' ];
			if ( !$config->get( 'MFSiteStylesRenderBlocking' ) ) {
				$pages['MediaWiki:Mobile.css'] = [ 'type' => 'style' ];
			}
		}
	}

	/**
	 * GetCacheVaryCookies hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetCacheVaryCookies
	 *
	 * @param OutputPage $out
	 * @param array &$cookies array of cookies name, add a value to it
	 *                        if you want to add a cookie that have to vary cache options
	 */
	public static function onGetCacheVaryCookies( $out, &$cookies ) {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$mobileUrlTemplate = $context->getMobileUrlTemplate();

		// Enables mobile cookies on wikis w/o mobile domain
		$cookies[] = MobileContext::USEFORMAT_COOKIE_NAME;
		// Don't redirect to mobile if user had explicitly opted out of it
		$cookies[] = MobileContext::STOP_MOBILE_REDIRECT_COOKIE_NAME;

		if ( $context->shouldDisplayMobileView() || !$mobileUrlTemplate ) {
			// beta cookie
			$cookies[] = MobileContext::OPTIN_COOKIE_NAME;
		}
	}

	/**
	 * Varies the parser cache if responsive images should have their variants
	 * stripped from the parser output, since the transformation happens during
	 * the parse.
	 *
	 * See `$wgMFStripResponsiveImages` and `$wgMFResponsiveImageWhitelist` for
	 * more detail about the stripping of responsive images.
	 *
	 * See https://www.mediawiki.org/wiki/Manual:Hooks/PageRenderingHash for more
	 * detail about the `PageRenderingHash` hook.
	 *
	 * @param string &$confstr Reference to the parser cache key
	 * @param User $user The user that is requesting the page
	 * @param array &$forOptions The options used to generate the parser cache key
	 */
	public static function onPageRenderingHash( &$confstr, User $user, &$forOptions ) {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		if ( $context->shouldStripResponsiveImages() ) {
			$confstr .= '!responsiveimages=0';
		}
	}

	/**
	 * Generate config for usage inside MobileFrontend
	 * This should be used for variables which:
	 *  - vary with the html
	 *  - variables that should work cross skin including anonymous users
	 *  - used for both, stable and beta mode (don't use
	 *    MobileContext::isBetaGroupMember in this function - T127860)
	 *
	 * @return array
	 */
	public static function getResourceLoaderMFConfigVars() {
		$vars = [];
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );
		$pageProps = $config->get( 'MFQueryPropModules' );
		$searchParams = $config->get( 'MFSearchAPIParams' );
		// Avoid API warnings and allow integration with optional extensions.
		if ( ExtensionRegistry::getInstance()->isLoaded( 'PageImages' ) ) {
			$pageProps[] = 'pageimages';
			$searchParams = array_merge_recursive( $searchParams, [
				'piprop' => 'thumbnail',
				'pithumbsize' => MobilePage::SMALL_IMAGE_WIDTH,
				'pilimit' => 50,
			] );
		}

		// Get the licensing agreement that is displayed in the uploading interface.
		$vars += [
			// Page.js
			'wgMFMobileFormatterHeadings' => $config->get( 'MFMobileFormatterOptions' )['headings'],
			// extendSearchParams
			'wgMFSearchAPIParams' => $searchParams,
			'wgMFQueryPropModules' => $pageProps,
			// SearchGateway.js
			'wgMFSearchGenerator' => $config->get( 'MFSearchGenerator' ),
			// PhotoListGateway.js, SearchGateway.js
			'wgMFThumbnailSizes' => [
				'tiny' => MobilePage::TINY_IMAGE_WIDTH,
				'small' => MobilePage::SMALL_IMAGE_WIDTH,
			],
			'wgMFEnableJSConsoleRecruitment' => $config->get( 'MFEnableJSConsoleRecruitment' ),
			// Browser.js
			'wgMFDeviceWidthTablet' => self::DEVICE_WIDTH_TABLET,
			// toggle.js
			'wgMFCollapseSectionsByDefault' => $config->get( 'MFCollapseSectionsByDefault' ),
			// extendSearchParams.js
			'wgMFTrackBlockNotices' => $config->get( 'MFTrackBlockNotices' ),
		];
		return $vars;
	}

	/**
	 * @param MobileContext $context
	 * @param Config $config
	 * @return array
	 */
	private static function getWikibaseStaticConfigVars(
		MobileContext $context, Config $config
	) {
		$features = array_keys( $config->get( 'MFDisplayWikibaseDescriptions' ) );
		$result = [ 'wgMFDisplayWikibaseDescriptions' => [] ];
		$featureManager = MediaWikiServices::getInstance()
			->getService( 'MobileFrontend.FeaturesManager' );

		$descriptionsEnabled = $featureManager->isFeatureAvailableForCurrentUser(
			'MFEnableWikidataDescriptions'
		);

		foreach ( $features as $feature ) {
			$result['wgMFDisplayWikibaseDescriptions'][$feature] = $descriptionsEnabled &&
				$context->shouldShowWikibaseDescriptions( $feature, $config );
		}

		return $result;
	}

	/**
	 * Should special pages be replaced with mobile formatted equivalents?
	 *
	 * @param User $user for which we need to make the decision based on user prefs
	 * @return bool whether special pages should be substituted with
	 *   mobile friendly equivalents
	 */
	public static function shouldMobileFormatSpecialPages( $user ) {
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
		$enabled = $config->get( 'MFEnableMobilePreferences' );

		if ( !$enabled ) {
			return true;
		}
		if ( !$user->isSafeToLoad() ) {
			// if not isSafeToLoad
			// assume an anonymous session
			// (see I2a6ef640d328106c88331da7c53785486e16a353)
			return true;
		}

		$userOption = $services->getUserOptionsLookup()->getOption(
			$user,
			self::MOBILE_PREFERENCES_SPECIAL_PAGES,
			self::ENABLE_SPECIAL_PAGE_OPTIMISATIONS
		);

		return $userOption === self::ENABLE_SPECIAL_PAGE_OPTIMISATIONS;
	}

	/**
	 * Hook for SpecialPage_initList in SpecialPageFactory.
	 *
	 * @param array &$list list of special page classes
	 */
	public static function onSpecialPageInitList( &$list ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$userMode = $services->getService( 'MobileFrontend.AMC.UserMode' );
		$user = $context->getUser();
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );

		// Perform substitutions of pages that are unsuitable for mobile
		// FIXME: Upstream these changes to core.
		if ( $context->shouldDisplayMobileView() &&
			self::shouldMobileFormatSpecialPages( $user )
		) {

			if ( $user->isSafeToLoad() &&
				!$featureManager->isFeatureAvailableForCurrentUser( 'MFUseDesktopSpecialWatchlistPage' )
			) {
				// Replace the standard watchlist view with our custom one
				$list['Watchlist'] = SpecialMobileWatchlist::class;
				$list['EditWatchlist'] = SpecialMobileEditWatchlist::class;
			}
		}
	}

	/**
	 * ListDefinedTags and ChangeTagsListActive hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ListDefinedTags
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ChangeTagsListActive
	 *
	 * @param array &$tags The list of tags. Add your extension's tags to this array.
	 */
	public static function onListDefinedTags( &$tags ) {
		$tags[] = 'mobile edit';
		$tags[] = 'mobile web edit';
	}

	/**
	 * RecentChange_save hook handler that tags mobile changes
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/RecentChange_save
	 *
	 * ManualLogEntryBeforePublish hook handler that tags actions logged when user uses mobile mode
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ManualLogEntryBeforePublish
	 *
	 * @param Taggable $taggable Object to tag
	 */
	public static function onTaggableObjectCreation( Taggable $taggable ) {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$userAgent = $context->getRequest()->getHeader( "User-agent" );
		if ( $context->shouldDisplayMobileView() ) {
			$taggable->addTags( [ 'mobile edit' ] );
			// Tag as mobile web edit specifically, if it isn't coming from the apps
			if ( strpos( $userAgent, 'WikipediaApp/' ) !== 0 ) {
				$taggable->addTags( [ 'mobile web edit' ] );
			}
		}
	}

	/**
	 * AbuseFilter-generateUserVars hook handler that adds a user_mobile variable.
	 * Altering the variables generated for a specific user
	 *
	 * @see hooks.txt in AbuseFilter extension
	 * @param VariableHolder $vars object to add vars to
	 * @param User $user
	 * @param RecentChange|null $rc If the variables should be generated for an RC entry, this
	 *  is the entry. Null if it's for the current action being filtered.
	 */
	public static function onAbuseFilterGenerateUserVars( $vars, $user, RecentChange $rc = null ) {
		if ( !$rc ) {
			$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
			$vars->setVar( 'user_mobile', $context->shouldDisplayMobileView() );
		} else {
			$dbr = wfGetDB( DB_REPLICA );
			$tags = ChangeTags::getTags( $dbr, $rc->getAttribute( 'rc_id' ) );
			$val = (bool)array_intersect( $tags, [ 'mobile edit', 'mobile web edit' ] );
			$vars->setVar( 'user_mobile', $val );
		}
	}

	/**
	 * AbuseFilter-builder hook handler that adds user_mobile variable to list
	 *  of valid vars
	 *
	 * @param array &$builder Array in AbuseFilter::getBuilderValues to add to.
	 */
	public static function onAbuseFilterBuilder( &$builder ) {
		$builder['vars']['user_mobile'] = 'user-mobile';
	}

	/**
	 * Invocation of hook SpecialPageBeforeExecute
	 *
	 * We use this hook to ensure that login/account creation pages
	 * are redirected to HTTPS if they are not accessed via HTTPS and
	 * $wgSecureLogin == true - but only when using the
	 * mobile site.
	 *
	 * @param SpecialPage $special
	 * @param string $subpage subpage name
	 */
	public static function onSpecialPageBeforeExecute( SpecialPage $special, $subpage ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );

		$isMobileView = $context->shouldDisplayMobileView();
		$taglines = $context->getConfig()->get( 'MFSpecialPageTaglines' );
		$name = $special->getName();

		if ( $isMobileView ) {
			$out = $special->getOutput();
			$out->addModuleStyles(
				[ 'mobile.special.styles' ]
			);
			if ( $name === 'Userlogin' || $name === 'CreateAccount' ) {
				$out->addModules( 'mobile.special.userlogin.scripts' );
			}
			if ( array_key_exists( $name, $taglines ) ) {
				self::setTagline( $out, $out->msg( $taglines[$name] )->parse() );
			}
		}
	}

	/**
	 * UserLoginComplete hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/UserLoginComplete
	 *
	 * Used here to handle watchlist actions made by anons to be handled after
	 * login or account creation.
	 *
	 * @param User &$currentUser the user object that was created on login
	 * @param string &$injected_html From 1.13, any HTML to inject after the login success message.
	 */
	public static function onUserLoginComplete( &$currentUser, &$injected_html ) {
		$services = MediaWikiServices::getInstance();
		$context = $services->getService( 'MobileFrontend.Context' );
		if ( !$context->shouldDisplayMobileView() ) {
			return;
		}

		// If 'watch' is set from the login form, watch the requested article
		$campaign = $context->getRequest()->getVal( 'campaign' );
		$returnto = $context->getRequest()->getVal( 'returnto' );
		$returntoquery = $context->getRequest()->getVal( 'returntoquery' );

		// The user came from one of the drawers that prompted them to login.
		// We must watch the article per their original intent.
		if ( $campaign === 'mobile_watchPageActionCta' || $returntoquery === 'article_action=watch' ) {
			$title = Title::newFromText( $returnto );
			// protect against watching special pages (these cannot be watched!)
			if ( $title !== null && !$title->isSpecialPage() ) {
				$services->getWatchlistManager()->addWatch( $currentUser, $title );
			}
		}
	}

	/**
	 * BeforePageDisplay hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
	 *
	 * @param OutputPage &$out
	 * @param Skin &$skin Skin object that will be used to generate the page, added in 1.13.
	 */
	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
		$context = MobileContext::singleton();
		$services = MediaWikiServices::getInstance();
		$config = $services->getService( 'MobileFrontend.Config' );
		$mfEnableXAnalyticsLogging = $config->get( 'MFEnableXAnalyticsLogging' );
		$mfNoIndexPages = $config->get( 'MFNoindexPages' );
		$isCanonicalLinkHandledByCore = $config->get( 'EnableCanonicalServerLink' );
		$mfMobileUrlTemplate = $context->getMobileUrlTemplate();
		$displayMobileView = $context->shouldDisplayMobileView();

		$title = $skin->getTitle();

		// an canonical/alternate link is only useful, if the mobile and desktop URL are different
		// and $wgMFNoindexPages needs to be true
		if ( $mfMobileUrlTemplate && $mfNoIndexPages ) {
			$link = false;

			if ( !$displayMobileView ) {
				// add alternate link to desktop sites - bug T91183
				$desktopUrl = $title->getFullURL();
				$link = [
					'rel' => 'alternate',
					'media' => 'only screen and (max-width: ' . self::DEVICE_WIDTH_TABLET . ')',
					'href' => $context->getMobileUrl( $desktopUrl ),
				];
			} elseif ( !$isCanonicalLinkHandledByCore ) {
				$link = [
					'rel' => 'canonical',
					'href' => $title->getFullURL(),
				];
			}

			if ( $link ) {
				$out->addLink( $link );
			}
		}

		// set the vary header to User-Agent, if mobile frontend auto detects, if the mobile
		// view should be delivered and the same url is used for desktop and mobile devices
		// Bug: T123189
		if (
			$config->get( 'MFVaryOnUA' ) &&
			$config->get( 'MFAutodetectMobileView' ) &&
			!$config->get( 'MobileUrlTemplate' )
		) {
			$out->addVaryHeader( 'User-Agent' );
		}

		// Set X-Analytics HTTP response header if necessary
		if ( $displayMobileView ) {
			$analyticsHeader = ( $mfEnableXAnalyticsLogging ? $context->getXAnalyticsHeader() : false );
			if ( $analyticsHeader ) {
				$resp = $out->getRequest()->response();
				$resp->header( $analyticsHeader );
			}

			// in mobile view: always add vary header
			$out->addVaryHeader( 'Cookie' );

			if ( $config->get( 'MFEnableManifest' ) ) {
				$out->addLink(
					[
						'rel' => 'manifest',
						'href' => wfAppendQuery(
							wfScript( 'api' ),
							[ 'action' => 'webapp-manifest' ]
						)
					]
				);
			}

			// In mobile mode, MediaWiki:Common.css/MediaWiki:Common.js is not loaded.
			// We load MediaWiki:Mobile.css/js instead
			// We load mobile.init so that lazy loading images works on all skins
			$out->addModules( [ 'mobile.init' ] );
			$out->addModuleStyles( [ 'mobile.init.styles' ] );

			// Allow modifications in mobile only mode
			$hookContainer = $services->getHookContainer();
			$hookContainer->run( 'BeforePageDisplayMobile', [ &$out, &$skin ] );
		}

		// T204691
		$theme = $config->get( 'MFManifestThemeColor' );
		if ( $theme && $displayMobileView ) {
			$out->addMeta( 'theme-color', $theme );
		}

		if ( $displayMobileView ) {
			// Adds inline script to allow opening of sections while JS is still loading
			$nonce = $out->getCSP()->getNonce();
			$out->prependHTML( MakeSectionsTransform::interimTogglingSupport( $nonce ) );
		}
	}

	/**
	 * AfterBuildFeedLinks hook handler. Remove all feed links in mobile view.
	 *
	 * @param array &$tags Added feed links
	 */
	public static function onAfterBuildFeedLinks( array &$tags ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );
		if ( $context->shouldDisplayMobileView() && !$config->get( 'MFRSSFeedLink' ) ) {
			$tags = [];
		}
	}

	/**
	 * Register default preferences for MobileFrontend
	 *
	 * @param array &$defaultUserOptions Reference to default options array
	 */
	public static function onUserGetDefaultOptions( &$defaultUserOptions ) {
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );
		if ( $config->get( 'MFEnableMobilePreferences' ) ) {
			$defaultUserOptions += [
				self::MOBILE_PREFERENCES_SPECIAL_PAGES => self::ENABLE_SPECIAL_PAGE_OPTIMISATIONS,
			];
		}
	}

	/**
	 * GetPreferences hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/GetPreferences
	 *
	 * @param User $user User whose preferences are being modified
	 * @param array &$preferences Preferences description array, to be fed to an HTMLForm object
	 */
	public static function onGetPreferences( $user, &$preferences ) {
		$config = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Config' );
		$definition = [
			'type' => 'api',
			'default' => '',
		];
		$preferences[SpecialMobileWatchlist::FILTER_OPTION_NAME] = $definition;
		$preferences[SpecialMobileWatchlist::VIEW_OPTION_NAME] = $definition;
		$preferences[MobileContext::USER_MODE_PREFERENCE_NAME] = $definition;
		$preferences[self::MOBILE_PREFERENCES_EDITOR] = $definition;

		if ( $config->get( 'MFEnableMobilePreferences' ) ) {
			$preferences[ self::MOBILE_PREFERENCES_SPECIAL_PAGES ] = [
				'type' => 'check',
				'label-message' => 'mobile-frontend-special-pages-pref',
				'help-message' => 'mobile-frontend-special-pages-pref',
				'section' => self::MOBILE_PREFERENCES_SECTION
			];
		}
	}

	/**
	 * Gadgets::allowLegacy hook handler
	 *
	 * @return bool
	 */
	public static function onAllowLegacyGadgets() {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		return !$context->shouldDisplayMobileView();
	}

	/**
	 * CentralAuthLoginRedirectData hook handler
	 * Saves mobile host so that the CentralAuth wiki could redirect back properly
	 *
	 * @see CentralAuthHooks::doCentralLoginRedirect in CentralAuth extension
	 * @param \MediaWiki\Extension\CentralAuth\User\CentralAuthUser $centralUser
	 * @param array &$data Redirect data
	 */
	public static function onCentralAuthLoginRedirectData( $centralUser, &$data ) {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$server = $context->getConfig()->get( 'Server' );
		if ( $context->shouldDisplayMobileView() ) {
			$data['mobileServer'] = $context->getMobileUrl( $server );
		}
	}

	/**
	 * CentralAuthSilentLoginRedirect hook handler
	 * Points redirects from CentralAuth wiki to mobile domain if user has logged in from it
	 * @see SpecialCentralLogin in CentralAuth extension
	 * @param \MediaWiki\Extension\CentralAuth\User\CentralAuthUser $centralUser
	 * @param string &$url to redirect to
	 * @param array $info token information
	 */
	public static function onCentralAuthSilentLoginRedirect( $centralUser, &$url, $info ) {
		if ( isset( $info['mobileServer'] ) ) {
			$mobileUrlParsed = wfParseUrl( $info['mobileServer'] );
			$urlParsed = wfParseUrl( $url );
			$urlParsed['host'] = $mobileUrlParsed['host'];
			$url = wfAssembleUrl( $urlParsed );
		}
	}

	/**
	 * Sets a tagline for a given page that can be displayed by the skin.
	 *
	 * @param OutputPage $outputPage
	 * @param string $desc
	 */
	private static function setTagline( OutputPage $outputPage, $desc ) {
		$outputPage->setProperty( 'wgMFDescription', $desc );
	}

	/**
	 * Finds the wikidata tagline associated with the page
	 *
	 * @param ParserOutput $po
	 * @param callable $fallbackWikibaseDescriptionFunc A fallback to provide Wikibase description.
	 * Function takes wikibase_item as a first and only argument
	 * @return ?string the tagline as a string, or else null if none is found
	 */
	public static function findTagline( ParserOutput $po, $fallbackWikibaseDescriptionFunc ) {
		$desc = $po->getPageProperty( 'wikibase-shortdesc' );
		$item = $po->getPageProperty( 'wikibase_item' );
		if ( $desc === null && $item && $fallbackWikibaseDescriptionFunc ) {
			return $fallbackWikibaseDescriptionFunc( $item );
		}
		return $desc;
	}

	/**
	 * OutputPageParserOutput hook handler
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/OutputPageParserOutput
	 *
	 * @param OutputPage $outputPage the OutputPage object to which wikitext is added
	 * @param ParserOutput $po
	 */
	public static function onOutputPageParserOutput( $outputPage, ParserOutput $po ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );
		$title = $outputPage->getTitle();
		$descriptionsEnabled = !$title->isMainPage() &&
			$title->getNamespace() === NS_MAIN &&
			$featureManager->isFeatureAvailableForCurrentUser(
				'MFEnableWikidataDescriptions'
			) && $context->shouldShowWikibaseDescriptions( 'tagline', $config );

		// Only set the tagline if the feature has been enabled and the article is in the main namespace
		if ( $context->shouldDisplayMobileView() && $descriptionsEnabled ) {
			$desc = self::findTagline( $po, static function ( $item ) {
				return ExtMobileFrontend::getWikibaseDescription( $item );
			} );
			if ( $desc ) {
				self::setTagline( $outputPage, $desc );
			}
		}
	}

	/**
	 * HTMLFileCache::useFileCache hook handler
	 * Disables file caching for mobile pageviews
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/HTMLFileCache::useFileCache
	 *
	 * @return bool
	 */
	public static function onHTMLFileCacheUseFileCache() {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		return !$context->shouldDisplayMobileView();
	}

	/**
	 * Removes the responsive image's variants from the parser output if
	 * configured to do so and the thumbnail's MIME type isn't whitelisted.
	 *
	 * See https://www.mediawiki.org/wiki/Manual:Hooks/ThumbnailBeforeProduceHTML
	 * for more detail about the `ThumbnailBeforeProduceHTML` hook.
	 *
	 * @param ThumbnailImage $thumbnail
	 * @param array &$attribs The attributes of the DOMElement being contructed
	 *  to represent the thumbnail
	 * @param array &$linkAttribs The attributes of the DOMElement being
	 *  constructed to represent the link to original file
	 */
	public static function onThumbnailBeforeProduceHTML( $thumbnail, &$attribs, &$linkAttribs ) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );
		if ( $context->shouldStripResponsiveImages() ) {
			$file = $thumbnail->getFile();
			if ( !$file || !in_array( $file->getMimeType(),
					$config->get( 'MFResponsiveImageWhitelist' ) ) ) {
				// Remove all responsive image 'srcset' attributes, except
				// from SVG->PNG renderings which usually aren't too huge,
				// or other whitelisted types.
				// Note that in future, srcset may be used for specifying
				// small-screen-friendly image variants as well as density
				// variants, so this should be used with caution.
				unset( $attribs['srcset'] );
			}
		}

		// Native image lazy loading is only being experimented on desktop for now
		if ( $context->shouldDisplayMobileView() ) {
			unset( $attribs['loading'] );
		}
	}

	/**
	 * LoginFormValidErrorMessages hook handler to promote MF specific error message be valid.
	 *
	 * @param array &$messages Array of already added messages
	 */
	public static function onLoginFormValidErrorMessages( &$messages ) {
		$messages = array_merge( $messages,
			[
				// watchstart sign up CTA
				'mobile-frontend-watchlist-signup-action',
				// Watchlist and watchstar sign in CTA
				'mobile-frontend-watchlist-purpose',
				// Edit button sign in CTA
				'mobile-frontend-edit-login-action',
				// Edit button sign-up CTA
				'mobile-frontend-edit-signup-action',
				'mobile-frontend-donate-image-login-action',
				// default message
				'mobile-frontend-generic-login-new',
			]
		);
	}

	/**
	 * Handler for MakeGlobalVariablesScript hook.
	 * For values that depend on the current page, user or request state.
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/MakeGlobalVariablesScript
	 * @param array &$vars Variables to be added into the output
	 * @param OutputPage $out OutputPage instance calling the hook
	 */
	public static function onMakeGlobalVariablesScript( array &$vars, OutputPage $out ) {
		$services = MediaWikiServices::getInstance();
		$userMode = $services->getService( 'MobileFrontend.AMC.UserMode' );
		$featureManager = $services->getService( 'MobileFrontend.FeaturesManager' );
		$config = $services->getService( 'MobileFrontend.Config' );

		// If the device is a mobile, Remove the category entry.
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		if ( $context->shouldDisplayMobileView() ) {
			$outreach = $services->getService( 'MobileFrontend.AMC.Outreach' );
			unset( $vars['wgCategories'] );
			$vars['wgMFMode'] = $context->isBetaGroupMember() ? 'beta' : 'stable';
			$vars['wgMFAmc'] = $userMode->isEnabled();
			$vars['wgMFAmcOutreachActive'] = $outreach->isCampaignActive();
			$vars['wgMFAmcOutreachUserEligible'] = $outreach->isUserEligible();
			$vars['wgMFLazyLoadImages'] =
				$featureManager->isFeatureAvailableForCurrentUser( 'MFLazyLoadImages' );
		}
		// Needed by mobile.startup and mobile.special.watchlist.scripts.
		// Needs to know if in beta mode or not and needs to load for Minerva desktop as well.
		// Ideally this would be inside ResourceLoaderFileModuleWithMFConfig but
		// sessions are not allowed there.
		$vars += self::getWikibaseStaticConfigVars( $context, $config );
	}

	/**
	 * Handler for TitleSquidURLs hook to add copies of the cache purge
	 * URLs which are transformed according to the wgMobileUrlTemplate, so
	 * that both mobile and non-mobile URL variants get purged.
	 *
	 * @see * https://www.mediawiki.org/wiki/Manual:Hooks/TitleSquidURLs
	 * @param Title $title the article title
	 * @param array &$urls the set of URLs to purge
	 */
	public static function onTitleSquidURLs( Title $title, array &$urls ) {
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		foreach ( $urls as $url ) {
			$newUrl = $context->getMobileUrl( $url );
			if ( $newUrl !== false && $newUrl !== $url ) {
				$urls[] = $newUrl;
			}
		}
	}

	/**
	 * Handler for the AuthChangeFormFields hook to add a logo on top of
	 * the login screen. This is the AuthManager equivalent of changeUserLoginCreateForm.
	 * @param AuthenticationRequest[] $requests AuthenticationRequest objects array
	 * @param array $fieldInfo Field description as given by AuthenticationRequest::mergeFieldInfo
	 * @param array &$formDescriptor A form descriptor suitable for the HTMLForm constructor
	 * @param string $action One of the AuthManager::ACTION_* constants
	 */
	public static function onAuthChangeFormFields(
		array $requests, array $fieldInfo, array &$formDescriptor, $action
	) {
		$services = MediaWikiServices::getInstance();
		/** @var MobileContext $context */
		$context = $services->getService( 'MobileFrontend.Context' );
		$config = $services->getService( 'MobileFrontend.Config' );
		$logos = RL\SkinModule::getAvailableLogos( $config );
		$mfLogo = $logos['icon'] ?? false;

		// do nothing in desktop mode
		if (
			$context->shouldDisplayMobileView() && $mfLogo
			&& in_array( $action, [ AuthManager::ACTION_LOGIN, AuthManager::ACTION_CREATE ], true )
		) {
			$logoHtml = Html::rawElement( 'div', [ 'class' => 'watermark' ],
				Html::element( 'img', [ 'src' => $mfLogo, 'alt' => '' ] ) );
			$formDescriptor = [
				'mfLogo' => [
					'type' => 'info',
					'default' => $logoHtml,
					'raw' => true,
				],
			] + $formDescriptor;
		}
	}

	/**
	 * Add the base mobile site URL to the siteinfo API output.
	 * @param ApiQuerySiteinfo $module
	 * @param array &$result Api result array
	 */
	public static function onAPIQuerySiteInfoGeneralInfo( ApiQuerySiteinfo $module, array &$result ) {
		global $wgCanonicalServer;
		$context = MediaWikiServices::getInstance()->getService( 'MobileFrontend.Context' );
		$result['mobileserver'] = $context->getMobileUrl( $wgCanonicalServer );
	}
}
