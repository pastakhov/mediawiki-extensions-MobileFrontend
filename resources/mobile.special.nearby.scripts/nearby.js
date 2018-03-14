/* global jQuery */
( function ( M, config, msg, loader, $ ) {
	/** @ignore @event Nearby#Nearby-postRender */
	var NEARBY_EVENT_POST_RENDER = 'Nearby-postRender',
		LocationProvider = M.require( 'mobile.nearby/LocationProvider' ),
		LoadingOverlay = mw.mobileFrontend.require( 'mobile.startup/LoadingOverlay' ),
		Icon = M.require( 'mobile.startup/Icon' ),
		endpoint = mw.config.get( 'wgMFNearbyEndpoint' ),
		router = require( 'mediawiki.router' ),
		Nearby = M.require( 'mobile.nearby/Nearby' ),
		util = M.require( 'mobile.startup/util' ),
		$infoContainer = $( '#mf-nearby-info-holder' ),
		$icon,
		nearby,
		options = {
			el: $( '#mw-mf-nearby' ),
			funnel: 'nearby',
			onItemClick: function ( ev ) {
				if ( !util.isModifiedEvent( ev ) && !isPageOrCoordFragment( router.getPath() ) ) {
					// Change the URL fragment to the clicked element so that back
					// navigation can retain the item position. This behavior is
					// unwanted for results displayed around a page or coordinate since
					// that information is stored in the hash and would be overwritten.
					router.navigate( $( this ).attr( 'id' ) );
				}
			}
		},
		$refreshButton = $( '#secondary-button' ).parent(),
		overlay = new LoadingOverlay( {} );

	/**
	 * @param {string} fragment The URL fragment.
	 * @return {boolean} True if the current URL is based around page or
	 *                   coordinates (as opposed to current location or search).
	 *                   e.g.: Special:Nearby#/page/San_Francisco and
	 *                   Special:Nearby#/coord/0,0.
	 * @ignore
	 */
	function isPageOrCoordFragment( fragment ) {
		return fragment.match( /^(\/page|\/coord)/ );
	}

	/**
	 * @param {string} fragment The URL fragment.
	 * @return {boolean} True if the current URL doesn't contain an invalid
	 *                   identifier expression, such as the slash in
	 *                   Special:Nearby#/search, and probably contains the
	 *                   target identifier to scroll to.
	 * @ignore
	 */
	function isFragmentIdentifier( fragment ) {
		return fragment && fragment.indexOf( '/' ) === -1;
	}

	/**
	 * Create and inject Refresh icon.
	 *
	 * @param {string} container
	 * @param {Function} refreshCurrentLocation
	 * @return {jQuery}
	 * @ignore
	 */
	function createRefreshIcon( container, refreshCurrentLocation ) {
		var $icon,
			$iconContainer,
			icon;
		// Create refresh button on the header
		icon = new Icon( {
			name: 'refresh',
			id: 'secondary-button',
			additionalClassNames: 'main-header-button',
			// refresh button doesn't perform any action related
			// to the form when button attribute is used
			el: $( '<button>' ).attr( 'type', 'button' ),
			title: msg( 'mobile-frontend-nearby-refresh' ),
			label: msg( 'mobile-frontend-nearby-refresh' )
		} );
		$iconContainer = $( '<div>' );

		$icon = icon.$el.on( 'click', refreshCurrentLocation )
			.appendTo( $iconContainer );

		$iconContainer.appendTo( '.header' );
		return $icon;
	}

	/**
	 * Initialize or instantiate Nearby with options
	 * @method
	 * @ignore
	 * @param {Object} opt
	 */
	function refresh( opt ) {
		// check, if the api object (options.api) is already created and set
		if ( options.api === undefined ) {
			// decide, what api module to use to retrieve the pages
			if ( endpoint ) {
				loader.using( 'mobile.foreignApi' ).done( function () {
					var JSONPForeignApi = M.require( 'mobile.foreignApi/JSONPForeignApi' );
					options.api = new JSONPForeignApi( endpoint );
				} );
			} else {
				options.api = new mw.Api();
			}
		}
		// make sure, that the api object (if created above) is added to the options object used
		// in the Nearby module
		opt = util.extend( {}, opt, options );

		if ( !nearby ) {
			nearby = new Nearby( opt );
			// todo: use the local emitter when refresh() doesn't recreate the
			//       OO.EventEmitter by calling the super's constructor.
			M.on( NEARBY_EVENT_POST_RENDER, function () {
				var fragment = router.getPath(), el;
				if ( isFragmentIdentifier( fragment ) ) {
					// The hash is expected to be an identifier selector (unless the
					// user entered rubbish).
					el = nearby.$( '#' + fragment );
					if ( el[0] && el[0].nodeType ) {
						$( window ).scrollTop( el.offset().top );
					}
				}
				overlay.hide();
			} );
		}
		nearby.refresh( opt );
	}

	/**
	 * Refresh the current view using browser geolocation api
	 * @ignore
	 */
	function refreshCurrentLocation() {
		overlay.show();
		refresh( options );
	}

	$icon = createRefreshIcon( '.header', refreshCurrentLocation );
	// Remove user button
	if ( $refreshButton.length ) {
		$refreshButton.remove();
	}

	// Routing on the nearby view

	/*
	 * #/coords/lat,long
	 */
	router.route( /^\/coord\/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/, function ( lat, lon ) {
		// TODO this is bad, route shouldn't have side effects but otherwise mediawiki router
		// cannot refresh the page. We need to store those so when user hits $refreshButton
		// we reload the results
		options.latitude = lat;
		options.longitude = lon;

		$infoContainer.remove();
		$( 'body' ).removeClass( 'nearby-accept-pending' );
		$icon.show();
		// Search with coordinates
		refresh( options );
	} );

	/*
	 * #/page/PageTitle
	 */
	router.route( /^\/page\/(.+)$/, function ( pageTitle ) {
		$icon.hide();
		overlay.hide();
		refresh( util.extend( {}, options, {
			pageTitle: mw.Uri.decode( pageTitle )
		} ) );
	} );

	$icon.hide();
	router.checkRoute();
	$( '#showArticles' ).on( 'click', function () {
		overlay.show();
		LocationProvider.getCurrentPosition().then( function ( geo ) {
			router.navigate( '#/coord/' + geo.latitude + ',' + geo.longitude );
		} ).catch( function ( error ) {
			overlay.hide();
			// We want to show the Alert dialog to make sure user sees it
			switch ( error ) {
				case 'permission':
					// eslint-disable-next-line no-alert
					alert( mw.msg( 'mobile-frontend-nearby-permission-denied' ) );
					break;
				case 'location':
					// eslint-disable-next-line no-alert
					alert( mw.msg( 'mobile-frontend-nearby-location-unavailable' ) );
					break;
				default:
					// timeout or undefined, do nothing for now
			}
		} );
	} );

}( mw.mobileFrontend, mw.config, mw.msg, mw.loader, jQuery ) );
