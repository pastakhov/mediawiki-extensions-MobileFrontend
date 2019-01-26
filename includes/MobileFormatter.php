<?php

use HtmlFormatter\HtmlFormatter;
use MobileFrontend\ContentProviders\IContentProvider;
use MobileFrontend\Transforms\MoveLeadParagraphTransform;
use MobileFrontend\Transforms\AddMobileTocTransform;
use MobileFrontend\Transforms\NoTransform;
use MobileFrontend\Transforms\LegacyMainPageTransform;
use MobileFrontend\Transforms\LazyImageTransform;

/**
 * Converts HTML into a mobile-friendly version
 */
class MobileFormatter extends HtmlFormatter {
	/**
	 * Class name for collapsible section wrappers
	 */
	const STYLE_COLLAPSIBLE_SECTION_CLASS = 'collapsible-block';

	/**
	 * Whether scripts can be added in the output.
	 * @var boolean $scriptsEnabled
	 */
	private $scriptsEnabled = true;

	/**
	 * The current revision id of the Title being worked on
	 * @var integer $revId
	 */
	private $revId;

	/** @var array $topHeadingTags Array of strings with possible tags,
		can be recognized as top headings. */
	public $topHeadingTags = [];

	/**
	 * @var LazyImageTransform $lazyTransform
	 */
	protected $lazyTransform;

	/**
	 * Saves a Title Object
	 * @var Title $title
	 */
	protected $title;

	/**
	 * Whether the table of contents is needed on this page
	 * @var boolean $isTOCEnabled
	 */
	protected $isTOCEnabled = false;

	/**
	 * Are sections expandable?
	 * @var boolean $expandableSections
	 */
	protected $expandableSections = false;
	/**
	 * Whether actual page is the main page and should be special cased
	 * @var boolean $mainPage
	 */
	protected $mainPage = false;

	/**
	 * Name of the transformation option
	 * @const string SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX
	 */
	const SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX = 'showFirstParagraphBeforeInfobox';

	/**
	 * @param string $html Text to process
	 * @param Title $title Title to which $html belongs
	 */
	public function __construct( $html, Title $title ) {
		parent::__construct( $html );

		$this->title = $title;
		$this->revId = $title->getLatestRevID();
		$config = MobileContext::singleton()->getMFConfig();
		$this->topHeadingTags = $config->get( 'MFMobileFormatterHeadings' );

		$this->lazyTransform = new LazyImageTransform(
			$config->get( 'MFLazyLoadSkipSmallImages' )
		);
	}

	/**
	 * Disables the generation of script tags in output HTML.
	 */
	public function disableScripts() {
		$this->scriptsEnabled = false;
	}

	/**
	 * Creates and returns a MobileFormatter
	 *
	 * @param MobileContext $context in which the page is being rendered. Needed to access page title
	 *  and MobileFrontend configuration.
	 * @param IContentProvider $provider
	 * @param bool $enableSections (optional)
	 *  whether to wrap the content of sections
	 *
	 * @return MobileFormatter
	 */
	public static function newFromContext( MobileContext $context,
		IContentProvider $provider,
		$enableSections = false
	) {
		$mfSpecialCaseMainPage = $context->getMFConfig()->get( 'MFSpecialCaseMainPage' );

		$title = $context->getTitle();
		$isMainPage = $title->isMainPage();
		$isFilePage = $title->inNamespace( NS_FILE );
		$html = self::wrapHTML( $provider->getHTML() );
		$formatter = new MobileFormatter( $html, $title );
		if ( $isMainPage ) {
			$formatter->enableExpandableSections( !$mfSpecialCaseMainPage );
		} else {
			$formatter->enableExpandableSections( $enableSections );
		}

		$formatter->setIsMainPage( $isMainPage && $mfSpecialCaseMainPage );
		$formatter->enableTOCPlaceholder( strpos( $html, 'toclevel' ) !== false );

		return $formatter;
	}

	/**
	 * Mark whether a placeholder table of contents should be included at the end of the lead
	 * section
	 * @param bool $flag should TOC be included?
	 */
	public function enableTOCPlaceholder( $flag = true ) {
		$this->isTOCEnabled = $flag;
	}

	/**
	 * Set support of page for expandable sections to $flag (standard: true)
	 * @todo kill with fire when there will be minimum of pre-1.1 app users remaining
	 * @param bool $flag should expandable sections be supported?
	 */
	public function enableExpandableSections( $flag = true ) {
		$this->expandableSections = $flag;
	}

	/**
	 * Change mainPage (is this the main page) to $value (standard: true)
	 * This enables special casing for the main page.
	 * @deprecated
	 * @param bool $value
	 */
	public function setIsMainPage( $value = true ) {
		$this->mainPage = $value;
	}

	/**
	 * Performs various transformations to the content to make it appropiate for mobile devices.
	 * @param bool $removeDefaults Whether default settings at $wgMFRemovableClasses should be used
	 * @param bool $removeReferences Whether to remove references from the output
	 * @param bool $removeImages Whether to move images into noscript tags
	 * @param bool $showFirstParagraphBeforeInfobox Whether the first paragraph from the lead
	 *  section should be shown before all infoboxes that come earlier.
	 * @return array
	 */
	public function filterContent(
		$removeDefaults = true, $removeReferences = false, $removeImages = false,
		$showFirstParagraphBeforeInfobox = false
	) {
		$ctx = MobileContext::singleton();
		$config = $ctx->getMFConfig();
		$doc = $this->getDoc();

		$isSpecialPage = $this->title->isSpecialPage();
		$mfRemovableClasses = $config->get( 'MFRemovableClasses' );
		$removableClasses = $mfRemovableClasses['base'];
		if ( $ctx->isBetaGroupMember() ) {
			$removableClasses = array_merge( $removableClasses, $mfRemovableClasses['beta'] );
		}

		// Don't remove elements in special pages
		if ( !$isSpecialPage && $removeDefaults ) {
			$this->remove( $removableClasses );
		}

		if ( $this->removeMedia ) {
			$this->doRemoveImages();
		}

		// Apply all removals before continuing with transforms (see T185040 for example)
		$removed = parent::filterContent();
		$transformOptions = [
			'images' => $removeImages,
			'references' => $removeReferences,
			self::SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX => $showFirstParagraphBeforeInfobox
		];
		// Sectionify the content and transform it if necessary per section
		if ( !$this->mainPage && $this->expandableSections ) {
			list( $headings, $subheadings ) = $this->getHeadings( $doc );
			$this->makeHeadingsEditable( $subheadings );
			$this->makeSections( $doc, $headings, $transformOptions );
		} else {
			// Otherwise apply the per-section transformations to the document as a whole
			$this->filterContentInSection( $doc, $doc, 0, $transformOptions );
		}
		if ( $transformOptions['references'] ) {
			$this->doRewriteReferencesLinksForLazyLoading( $doc );
		}
		return $removed;
	}

	/**
	 * Apply filtering per element (section) in a document.
	 * @param DOMElement|DOMDocument $el
	 * @param DOMDocument $doc
	 * @param int $sectionNumber Which section is it on the document
	 * @param array $options options about the transformations per section
	 */
	private function filterContentInSection(
		$el, DOMDocument $doc, $sectionNumber, array $options = []
	) {
		if ( !$this->removeMedia && $options['images'] && $sectionNumber > 0 ) {
			$this->lazyTransform->apply( $el );
		}
		if ( $options['references'] ) {
			$this->doRewriteReferencesListsForLazyLoading( $el, $doc );
		}
	}

	/**
	 * Replaces any references links with a link to Special:MobileCite
	 *
	 * @param DOMDocument $doc Document to create and replace elements in
	 */
	private function doRewriteReferencesLinksForLazyLoading( DOMDocument $doc ) {
		$citePath = "$this->revId";

		$xPath = new DOMXPath( $doc );
		$nodes = $xPath->query(
			// sup.reference > a
			'//sup[contains(concat(" ", normalize-space(./@class), " "), " reference ")]/a[1]' );

		foreach ( $nodes as $node ) {
			$fragment = $node->getAttribute( 'href' );
			$node->setAttribute(
				'href',
				SpecialPage::getTitleFor( 'MobileCite', $citePath )->getLocalUrl() . $fragment
			);
		}
	}

	/**
	 * Replaces any references list with a link to Special:MobileCite
	 *
	 * @param DOMElement|DOMDocument $el Element or document to rewrite references in.
	 * @param DOMDocument $doc Document to create elements in
	 */
	private function doRewriteReferencesListsForLazyLoading( $el, DOMDocument $doc ) {
		$citePath = "$this->revId";
		$isReferenceSection = false;

		// Accessing by tag is cheaper than class
		$nodes = $el->getElementsByTagName( 'ol' );
		// PHP's DOM classes are recursive
		// but since we are manipulating the DOMList we have to
		// traverse it backwards
		// see http://php.net/manual/en/class.domnodelist.php
		for ( $i = $nodes->length - 1; $i >= 0; $i-- ) {
			$list = $nodes->item( $i );

			// Use class to decide it is a list of references
			if ( strpos( $list->getAttribute( 'class' ), 'references' ) !== false ) {
				// Only mark the section as a reference container if we're transforming a section, not the
				// document.
				$isReferenceSection = $el instanceof DOMElement;

				$parent = $list->parentNode;
				$placeholder = $doc->createElement( 'a',
					wfMessage( 'mobile-frontend-references-list' ) );
				$placeholder->setAttribute( 'class', 'mf-lazy-references-placeholder' );
				// Note to render a reference we need to know only its reference
				// Note: You can have multiple <references> tag on the same page, we render all of these in
				// the special page together.
				$placeholder->setAttribute( 'href',
					SpecialPage::getTitleFor( 'MobileCite', $citePath )->getLocalUrl() );
				$parent->replaceChild( $placeholder, $list );
			}
		}

		// Mark section as having references
		if ( $isReferenceSection ) {
			$el->setAttribute( 'data-is-reference-section', '1' );
		}
	}

	/**
	 * Replaces images with [annotations from alt]
	 */
	private function doRemoveImages() {
		$doc = $this->getDoc();
		$domElemsToReplace = [];
		foreach ( $doc->getElementsByTagName( 'img' ) as $element ) {
			$domElemsToReplace[] = $element;
		}
		/** @var DOMElement $element */
		foreach ( $domElemsToReplace as $element ) {
			$alt = $element->getAttribute( 'alt' );
			if ( $alt === '' ) {
				$alt = '[' . wfMessage( 'mobile-frontend-missing-image' )->inContentLanguage()->text() . ']';
			} else {
				$alt = '[' . $alt . ']';
			}
			$replacement = $doc->createElement( 'span', htmlspecialchars( $alt ) );
			$replacement->setAttribute( 'class', 'mw-mf-image-replacement' );
			$element->parentNode->replaceChild( $replacement, $element );
		}
	}

	/**
	 * Performs final transformations to mobile format and returns resulting HTML
	 *
	 * @param DOMElement|string|null $element ID of element to get HTML from or
	 *   false to get it from the whole tree
	 * @return string Processed HTML
	 */
	public function getText( $element = null ) {
		if ( $this->mainPage ) {
			$transform = new LegacyMainPageTransform();
			$doc = $this->getDoc();
			$transform->apply( $doc->getElementsByTagName( 'body' )->item( 0 ) );
		}

		return parent::getText( $element );
	}

	/**
	 * Splits the body of the document into sections demarcated by the $headings elements.
	 * Also moves the first paragraph in the lead section above the infobox.
	 *
	 * All member elements of the sections are added to a <code><div></code> so
	 * that the section bodies are clearly defined (to be "expandable" for
	 * example).
	 *
	 * @param DOMDocument $doc representing the HTML of the current article. In the HTML the sections
	 *  should not be wrapped.
	 * @param DOMElement[] $headings The headings returned by
	 *  {@see MobileFormatter::getHeadings}
	 * @param array $transformOptions Options to pass when transforming content per section
	 */
	protected function makeSections( DOMDocument $doc, array $headings, array $transformOptions ) {
		$noTransform = new NoTransform();
		$tocTransform = $this->isTOCEnabled ? new AddMobileTocTransform() : $noTransform;
		$leadTransform = $transformOptions[ self::SHOW_FIRST_PARAGRAPH_BEFORE_INFOBOX ] ?
				new MoveLeadParagraphTransform( $this->title, $this->revId ) : $noTransform;

		// Find the parser output wrapper div
		$xpath = new DOMXPath( $doc );
		$containers = $xpath->query( 'body/div[@class="mw-parser-output"][1]' );
		if ( !$containers->length ) {
			// No wrapper? This could be an old parser cache entry, or perhaps the
			// OutputPage contained something that was not generated by the parser.
			// Try using the <body> as the container.
			$containers = $xpath->query( 'body' );
			if ( !$containers->length ) {
				throw new Exception( "HTML lacked body element even though we put it there ourselves" );
			}
		}

		$container = $containers->item( 0 );
		$containerChild = $container->firstChild;
		$firstHeading = reset( $headings );
		$firstHeadingName = $firstHeading ? $firstHeading->nodeName : false;
		$sectionNumber = 0;
		$sectionBody = $this->createSectionBodyElement( $doc, $sectionNumber, false );

		while ( $containerChild ) {
			$node = $containerChild;
			$containerChild = $containerChild->nextSibling;

			// If we've found a top level heading, insert the previous section if
			// necessary and clear the container div.
			// Note well the use of DOMNode#nodeName here. Only DOMElement defines
			// DOMElement#tagName.  So, if there's trailing text - represented by
			// DOMText - then accessing #tagName will trigger an error.
			if ( $node->nodeName === $firstHeadingName ) {
				// The heading we are transforming is always 1 section ahead of the
				// section we are currently processing
				$this->prepareHeading( $doc, $node, $sectionNumber + 1, $this->scriptsEnabled );
				if ( $sectionBody->hasChildNodes() ) {
					// Apply transformations to the section body
					$this->filterContentInSection( $sectionBody, $doc, $sectionNumber, $transformOptions );
				}
				// Insert the previous section body and reset it for the new section
				$container->insertBefore( $sectionBody, $node );

				if ( $sectionNumber === 0 ) {
					$tocTransform->apply( $sectionBody );
					$leadTransform->apply( $sectionBody );
				}
				$sectionNumber += 1;
				$sectionBody = $this->createSectionBodyElement( $doc, $sectionNumber, $this->scriptsEnabled );
				continue;
			}

			// If it is not a top level heading, keep appending the nodes to the
			// section body container.
			$sectionBody->appendChild( $node );
		}

		// If the document had the lead section only:
		if ( $sectionNumber == 0 ) {
			$leadTransform->apply( $sectionBody );
		}

		if ( $sectionBody->hasChildNodes() ) {
			// Apply transformations to the last section body
			$this->filterContentInSection( $sectionBody, $doc, $sectionNumber, $transformOptions );
		}
		// Append the last section body.
		$container->appendChild( $sectionBody );
	}

	/**
	 * Prepare section headings, add required classes and onclick actions
	 *
	 * @param DOMDocument $doc
	 * @param DOMElement $heading
	 * @param integer $sectionNumber
	 * @param bool $isCollapsible
	 */
	private function prepareHeading(
		DOMDocument $doc, DOMElement $heading, $sectionNumber, $isCollapsible
	) {
		$className = $heading->hasAttribute( 'class' ) ? $heading->getAttribute( 'class' ) . ' ' : '';
		$heading->setAttribute( 'class', $className . 'section-heading' );
		if ( $isCollapsible ) {
			$heading->setAttribute( 'onclick', 'javascript:mfTempOpenSection(' . $sectionNumber . ')' );
		}

		// prepend indicator - this avoids a reflow by creating a placeholder for a toggling indicator
		$indicator = $doc->createElement( 'div' );
		$indicator->setAttribute( 'class', MobileUI::iconClass( '', 'element', 'indicator' ) );
		$heading->insertBefore( $indicator, $heading->firstChild );
	}

	/**
	 * Creates a Section body element
	 *
	 * @param DOMDocument $doc
	 * @param int $sectionNumber
	 * @param bool $isCollapsible
	 *
	 * @return DOMElement
	 */
	private function createSectionBodyElement( DOMDocument $doc, $sectionNumber, $isCollapsible ) {
		$sectionClass = 'mf-section-' . $sectionNumber;
		if ( $isCollapsible ) {
			// TODO: Probably good to rename this to the more generic 'section'.
			// We have no idea how the skin will use this.
			$sectionClass .= ' ' . self::STYLE_COLLAPSIBLE_SECTION_CLASS;
		}

		// FIXME: The class `/mf\-section\-[0-9]+/` is kept for caching reasons
		// but given class is unique usage is discouraged. [T126825]
		$sectionBody = $doc->createElement( 'div' );
		$sectionBody->setAttribute( 'class', $sectionClass );
		$sectionBody->setAttribute( 'id', 'mf-section-' . $sectionNumber );
		return $sectionBody;
	}

	/**
	 * Marks the headings as editable by adding the <code>in-block</code>
	 * class to each of them, if it hasn't already been added.
	 *
	 * FIXME: <code>in-block</code> isn't semantic in that it isn't
	 * obviously connected to being editable.
	 *
	 * @param DOMElement[] $headings Heading elements
	 */
	protected function makeHeadingsEditable( array $headings ) {
		foreach ( $headings as $heading ) {
			$class = $heading->getAttribute( 'class' );
			if ( strpos( $class, 'in-block' ) === false ) {
				$heading->setAttribute(
					'class',
					ltrim( $class . ' in-block' )
				);
			}
		}
	}

	/**
	 * Gets all headings in the document in rank order.
	 *
	 * Note well that the rank order is defined by the
	 * <code>MobileFormatter#topHeadingTags</code> property.
	 *
	 * @param DOMDocument $doc
	 * @return array A two-element array where the first is the highest
	 *  rank headings and the second is all other headings
	 */
	private function getHeadings( DOMDocument $doc ) {
		$headings = $subheadings = [];

		foreach ( $this->topHeadingTags as $tagName ) {
			$allTags = $doc->getElementsByTagName( $tagName );
			$elements = [];
			foreach ( $allTags as $el ) {
				if ( $el->parentNode->getAttribute( 'class' ) !== 'toctitle' ) {
					$elements[] = $el;
				}
			}

			if ( !$headings ) {
				$headings = $elements;
			} else {
				$subheadings = array_merge( $subheadings, $elements );
			}
		}

		return [ $headings, $subheadings ];
	}
}
