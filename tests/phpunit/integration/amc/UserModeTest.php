<?php

use MediaWiki\User\UserIdentity;
use MediaWiki\User\UserOptionsManager;
use MobileFrontend\Amc\Manager;
use MobileFrontend\Amc\UserMode;

/**
 * @coversDefaultClass \MobileFrontend\Amc\UserMode
 * @group MobileFrontend
 */
class UserModeTest extends MediaWikiIntegrationTestCase {

	/**
	 * @param bool $mfAmcConfig
	 * @param bool $shouldDisplayMV
	 * @param bool $isAnon
	 * @param string $userOpt
	 * @param ?UserOptionsManager|null $userOptsManager
	 *
	 * @return UserMode
	 */
	private function createUserMode(
		bool $mfAmcConfig = true,
		bool $shouldDisplayMV = true,
		bool $isAnon = false,
		string $userOpt = '1',
		?UserOptionsManager $userOptsManager = null
	): UserMode {
		$config = $this->createNoOpMock( Config::class, [ 'get' ] );
		$config->method( 'get' )->with( 'MFAdvancedMobileContributions' )
			->willReturn( $mfAmcConfig );

		$user = $this->createNoOpMock( User::class, [ 'isAnon', 'isRegistered', 'getId', 'getName' ] );
		$user->method( 'isAnon' )->willReturn( $isAnon );
		$user->method( 'isRegistered' )->willReturn( !$isAnon );
		$user->method( 'getId' )->willReturn( 1 );
		// XXX: GlobalPreferences extension needs ->getName() on User
		$user->method( 'getName' )->willReturn( 'Xyz' );

		$context = $this->createNoOpMock(
			MobileContext::class,
			[ 'shouldDisplayMobileView', 'getUser' ]
		);
		$context->method( 'shouldDisplayMobileView' )->willReturn( $shouldDisplayMV );
		$context->method( 'getUser' )->willReturn( $user );

		$manager = new Manager( $config, $context );

		if ( $userOptsManager === null ) {
			$userOptsManager = $this->createNoOpMock( UserOptionsManager::class, [ 'getOption' ] );
			$userOptsManager->method( 'getOption' )->willReturn( $userOpt );

		}
		$this->setService( 'UserOptionsManager', $userOptsManager );

		return new UserMode(
			$manager,
			$user,
			$this->getServiceContainer()->getUserOptionsLookup(),
			$userOptsManager
		);
	}

	/**
	 * @covers ::getModeIdentifier
	 */
	public function testGetModeIdentifier() {
		$userMode = $this->createUserMode();
		$modeIdentifier = $userMode->getModeIdentifier();

		$this->assertSame( 'amc', $modeIdentifier );
	}

	/** @return Generator */
	public function provideIsEnabledData(): Generator {
		// Structure: [ $mfAmcConfig, $shouldDisplayMV, $isAnon, $userOpt, $expected ]

		yield 'AMC is disabled for anon users with user options set to 1' => [ true, true, true, '1', false ];
		yield 'AMC is disabled for non-mobile users with user options set to 1' => [ true, false, false, '1', false ];
		yield 'AMC is disabled for non-mobile anon users with user options set to 1' =>
			[ true, false, true, '1', false ];
		yield 'AMC is disabled when config is set to false and user options set to 1' =>
			[ false, true, false, '1', false ];
		yield 'AMC is disabled with config, no mobile view even if user is not anon and options set to 1' =>
			[ false, false, false, '1', false ];
		yield 'AMC is disabled with config false, no mobile view, anon user even when user opts set to 1' =>
			[ false, false, true, '1', false ];
		yield 'AMC is disabled for mobile users with user option set to 0' => [ true, true, false, '0', false ];

		yield 'AMC is enabled for mobile users' => [ true, true, false, '1', true ];
	}

	/**
	 * @covers ::isEnabled
	 * @dataProvider provideIsEnabledData
	 *
	 * @param bool $mfAmcConfig
	 * @param bool $shouldDisplayMV
	 * @param bool $isAnon
	 * @param string $userOpt
	 * @param bool $expected
	 */
	public function testIsEnabled( $mfAmcConfig, $shouldDisplayMV, $isAnon, $userOpt, $expected ) {
		$userMode = $this->createUserMode( $mfAmcConfig, $shouldDisplayMV, $isAnon, $userOpt );
		$isEnabled = $userMode->isEnabled();

		$this->assertSame( $expected, $isEnabled );
	}

	/** @return Generator */
	public function provideSetEnabledData(): Generator {
		yield 'Enable AMC for this user' => [ true ];
		yield 'Disable AMC for this user ' => [ false ];
	}

	/**
	 * @covers ::setEnabled
	 * @covers ::isEnabled
	 * @dataProvider provideSetEnabledData
	 */
	public function testSetEnabled( $isEnabled ) {
		$userMode = $this->createUserMode(
			true,
			true,
			false,
			'1',
			// We want a real UserOptionsManager here so the system
			// can actually save the option
			$this->getServiceContainer()->getUserOptionsManager()
		);
		$userMode->setEnabled( $isEnabled );

		$this->assertSame( $isEnabled, $userMode->isEnabled() );
	}

	/** @return Generator */
	public function provideIsAvailableThrowsData(): Generator {
		yield 'AMC is not available when mobile view is not set and is registered user (config false)' =>
			[ false, false, false ];
		yield 'AMC is not available when mobile view is set and is registered user (config false)' =>
			[ false, true, false ];
		yield 'AMC is not available when mobile view is not set and is anon user (config false)' =>
			[ false, false, true ];
		yield 'AMC is not available when mobile view is set and is anon user (config false)' => [ false, true, true ];
		yield 'AMC is not available when mobile view is not set and is anon user' => [ true, false, false ];
		yield 'AMC is not available when mobile view is not set and is registered user' => [ true, false, true ];
		yield 'AMC is not available when mobile view is set and is anon user (config true)' => [ true, true, true ];
	}

	/**
	 * @covers ::setEnabled
	 * @dataProvider provideIsAvailableThrowsData
	 */
	public function testSetEnabledThrowsIsEnabledTrue( $mfAmcConfig, $shouldDisplayMobileView, $isAnon ) {
		$userMode = $this->createUserMode( $mfAmcConfig, $shouldDisplayMobileView, $isAnon );
		$this->expectException( RuntimeException::class );

		$userMode->setEnabled( true );
	}

	/**
	 * @covers ::setEnabled
	 * @dataProvider provideIsAvailableThrowsData
	 */
	public function testSetEnabledThrowsIsEnabledFalse( $mfAmcConfig, $shouldDisplayMobileView, $isAnon ) {
		$userMode = $this->createUserMode( $mfAmcConfig, $shouldDisplayMobileView, $isAnon );
		$this->expectException( RuntimeException::class );

		$userMode->setEnabled( false );
	}

	/**
	 * @covers ::__construct
	 * @covers ::newForUser
	 */
	public function testNewForUser() {
		$mockUserIdentity = $this->createNoOpMock( UserIdentity::class );
		$userMode = UserMode::newForUser( $mockUserIdentity );

		$this->assertInstanceOf( UserMode::class, $userMode );
	}

}
