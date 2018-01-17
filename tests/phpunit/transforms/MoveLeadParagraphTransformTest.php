<?php

use MobileFrontend\Transforms\MoveLeadParagraphTransform;

/**
 * @group MobileFrontend
 */
class MoveLeadParagraphTransformTest extends MediaWikiTestCase {
	public static function wrap( $html ) {
		return "<!DOCTYPE HTML>
<html><body>$html</body></html>
";
	}

	public function testGetInfoboxContainer() {
		$doc = new DOMDocument();
		$wrappedInfobox = $doc->createElement( 'table' );
		$wrappedInfobox->setAttribute( 'class', 'infobox' );
		$stack = $doc->createElement( 'div' );
		$stack->setAttribute( 'class', 'mw-stack' );
		$stack->appendChild( $wrappedInfobox );
		$bodyNode = $doc->createElement( 'body' );
		$pNode = $doc->createElement( 'p' );
		$infobox = $doc->createElement( 'table' );
		$infobox->setAttribute( 'class', 'infobox' );
		$anotherInfobox = $doc->createElement( 'table' );
		$anotherInfobox->setAttribute( 'class', 'infobox' );
		$section = $doc->createElement( 'div' );
		$section->appendChild( $anotherInfobox );

		$bodyNode->appendChild( $stack );
		$bodyNode->appendChild( $pNode );
		$bodyNode->appendChild( $infobox );
		$bodyNode->appendChild( $section );

		$this->assertEquals(
			MoveLeadParagraphTransform::getInfoboxContainer( $pNode ),
			false,
			'The paragraph is not inside a .infobox or .mw-stack element'
		);
		$this->assertEquals(
			MoveLeadParagraphTransform::getInfoboxContainer( $wrappedInfobox ),
			$stack,
			'If an infobox is wrapped by a known wrapper element, the wrapper element is returned'
		);
		$this->assertEquals(
			MoveLeadParagraphTransform::getInfoboxContainer( $stack ),
			$stack
		);
		$this->assertEquals(
			MoveLeadParagraphTransform::getInfoboxContainer( $stack, '/infobox-container/' ),
			false,
			'Only .infobox-container elements can now wrap infoboxes so the stack does not resolve'
		);
		$this->assertEquals(
			MoveLeadParagraphTransform::getInfoboxContainer( $infobox ),
			$infobox
		);
		$this->assertEquals(
			MoveLeadParagraphTransform::getInfoboxContainer( $anotherInfobox ),
			$anotherInfobox,
			'Even though the infobox is wrapped, the wrapper element is not a valid container,' .
				' thus the infobox itself is considered the infobox'
		);
	}

	/**
	 * @dataProvider provideTransform
	 *
	 * @param string $html
	 * @param string $expected
	 */
	public function testTransform( $html, $expected,
		$reason = 'Move lead paragraph unexpected result'
	) {
		$transform = new MoveLeadParagraphTransform( 'A', 1 );
		$doc = new DOMDocument();
		$doc->loadHTML( self::wrap( $html ) );
		$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		$this->assertEquals( $doc->saveHTML(), self::wrap( $expected ), $reason );
	}

	public function provideTransform() {
		$infobox = '<table class="infobox">1</table>';
		$anotherInfobox = '<table class="infobox">2</table>';
		$stackInfobox = "<div class=\"mw-stack\">$infobox</div>";
		$emptyStack = '<div class="mw-stack">Empty</div>';
		$multiStackInfobox = "<div class=\"mw-stack\">$infobox$anotherInfobox</div>";
		$paragraph = '<p>first paragraph</p>';
		$emptyP = '<p></p>';

		return [
			[
				'<div><table class="mf-infobox"></table></div><p>one</p>',
				'<div><table class="mf-infobox"></table></div><p>one</p>'
			],
			[
				"$infobox$paragraph",
				"$paragraph$infobox",
			],
			[
				"$emptyP$infobox$paragraph",
				"$emptyP$paragraph$infobox",
				'Empty paragraphs are ignored'
			],
			[
				"$stackInfobox$paragraph",
				"$paragraph$stackInfobox",
				'T170006: If the infobox is wrapped in a known container it can be moved',
			],
			[
				"$emptyStack$paragraph",
				"$emptyStack$paragraph",
				'T170006: However if no infobox inside don\'t move.'
			],
			[
				"$infobox$emptyStack$paragraph",
				"$paragraph$infobox$emptyStack",
				'T170006: When a stack and an infobox, ignore mw-stack',
			],
			[
				"$multiStackInfobox$paragraph",
				"$paragraph$multiStackInfobox",
				'T170006: Multiple infoboxes will also be moved'
			],
		];
	}
}
