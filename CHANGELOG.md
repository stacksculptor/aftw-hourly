# Change Log

We are not following semantic versioning in this template app since any change could potentially be
a breaking change for forked customization projects. We are still experimenting with what is a good
way to update this template, but currently, we follow a pattern:

* Major version change (v**X**.0.0): Changes to several pages and other components. Consider
  implementing this without merging upstream (we'll provide instructions).
* Minor version change (v0.**X**.0): New features and changes to a single page. These are likely to
  cause conflicts.
* Patch (v0.0.**X**): Bug fixes and small changes to components.

---

## Upcoming version 2018-11-XX

* [fix] Show Stripe error message on CheckoutPage if payment request fails because of Stripe error.
  Also show error if payment amount is zero. 
  [#960](https://github.com/sharetribe/flex-template-web/pull/960)
* [fix] Remove unused translation keys and update PasswordChangePage title
  [#959](https://github.com/sharetribe/flex-template-web/pull/959)

## [v2.3.2] 2018-11-20

* [fix] Take 2: don't set currentUserHasListings if fetched listing is in draft state.
  [#956](https://github.com/sharetribe/flex-template-web/pull/956)
* [fix] PriceFilter styles
  [#954](https://github.com/sharetribe/flex-template-web/pull/954)

[v2.3.2]: https://github.com/sharetribe/flex-template-web/compare/v2.3.1...v2.3.2

## [v2.3.1] 2018-11-16

* [fix] Don't set currentUserHasListings if fetched listing is in draft state.
  ModalMissingInformation was shown too early for users creating their first listing.
  [#953](https://github.com/sharetribe/flex-template-web/pull/953)
* [change] Add index files of components and containers folder to .prettierignore
  [#952](https://github.com/sharetribe/flex-template-web/pull/952)
* [fix] the alignment of arrows in FieldDateRangeInput and refactoring arrow icon code.
  [#951](https://github.com/sharetribe/flex-template-web/pull/951)
* [change] Remove unnecessary language configuration and improve translations documentation.
  [#950](https://github.com/sharetribe/flex-template-web/pull/950)

[v2.3.1]: https://github.com/sharetribe/flex-template-web/compare/v2.3.0...v2.3.1

## [v2.3.0] 2018-11-13

* [add] Draft listing is used in EditListingWizard, ManageListingCard and ListingPage. From now on
  description panel creates a draft listing and photos panel publishes it. You can also view your
  current draft listings from 'your listings' page.
  [#947](https://github.com/sharetribe/flex-template-web/pull/947)
* [fix] Firefox showed select options with the same color as select itself. Now options have their
  own color set and _placeholder option needs to be disabled_.
  [#946](https://github.com/sharetribe/flex-template-web/pull/946)

[v2.3.0]: https://github.com/sharetribe/flex-template-web/compare/v2.2.0...v2.3.0

## [v2.2.0] 2018-10-31

* [add] SearchPage: adds PriceFilter (and RangeSlider, FieldRangeSlider, PriceFilterForm).

  **Note:** You must define min and max for the filter in `src/marketplace-custom-config.js`.
  Current maximum value for the range is set to 1000 (USD/EUR/currency units). In addition, this
  fixes or removes component examples that don't work in StyleguidePage.

  [#944](https://github.com/sharetribe/flex-template-web/pull/944)

  [v2.2.0]: https://github.com/sharetribe/flex-template-web/compare/v2.1.1...v2.2.0

## [v2.1.1] 2018-10-23

* [add] Added initial documentation about routing and loading data.
  [#941](https://github.com/sharetribe/flex-template-web/pull/941)
* [remove] Removed plain text parts of email templates.
  [#942](https://github.com/sharetribe/flex-template-web/pull/942)
* [add] Add referrer policy due tokens in URL on PasswordResetPage and EmailVerificationPage.
  [#940](https://github.com/sharetribe/flex-template-web/pull/940)
* [add] Added initial documentation about our Redux setup.
  [#939](https://github.com/sharetribe/flex-template-web/pull/939)
* [add] Added a small comment to documentation about the current state of code-splitting.
  [#938](https://github.com/sharetribe/flex-template-web/pull/938)

[v2.1.1]: https://github.com/sharetribe/flex-template-web/compare/v2.1.0...v2.1.1

## [v2.1.0] 2018-10-01

* [change] Improve performance of public pages. Image assets are optimized and lazy loading is
  applied to images in SectionLocation and ListingCard. Read
  [documentation](./docs/improving-performance.md) for implementation details.
  [#936](https://github.com/sharetribe/flex-template-web/pull/936)
* [change] Update sharetribe-scripts. **cssnext** (used previously in sharetribe-scripts) has been
  deprecated. Now **postcss-preset-env** is used instead with stage 3 + custom media queries and
  nesting-rules. If this change breaks your styling, you could still use v1.1.2. The next version of
  [postcss-nesting](https://github.com/jonathantneal/postcss-nesting) (v7.0.0) will no longer
  support nested at-rules (like media queries) - therefore, we didn't update to that version yet.
  [#935](https://github.com/sharetribe/flex-template-web/pull/935)
* [change] Change Mapbox's default font to marketplace font.
  [#934](https://github.com/sharetribe/flex-template-web/pull/934)
* [add] New default design for the landing page's hero section. Now the CTA button's default
  behavior is 'Browse'.
  * `marketplaceH1FontStyles`: changed letter spacing to be more tight.
  * `SectionHero` has now a search page link that should be customized to point to your marketplace
    primary area [#933](https://github.com/sharetribe/flex-template-web/pull/933)

[v2.1.0]: https://github.com/sharetribe/flex-template-web/compare/v2.0.0...v2.1.0

## [v2.0.0] 2018-09-19

* [add] New default map provider (Mapbox) and complete refactoring to all map and geocoding
  components. [#888](https://github.com/sharetribe/flex-template-web/pull/888)

  **Note:** Before updating to version 2.0.0, you should very carefully track customizations that
  you have made to following components:

  * **LocationAutocompleteInput**
  * **Map**
  * **SearchPage** (especially previous `onIdle` function)
  * **SearchMap**
  * **SearchMapPriceLabel**
  * **SearchMapGroupLabel**
  * **SearchMapInfoCard**

  To get a better understanding of what has changed, you should read documents about how to
  [integrate to map providers](./docs/map-providers.md) and especially
  [changing map provider to Google Maps](./docs/google-maps.md)

[v2.0.0]: https://github.com/sharetribe/flex-template-web/compare/v1.4.3...v2.0.0

## [v1.4.3] 2018-09-15

* [fix] fuzzy location didn't change when listing location changed.
  [#931](https://github.com/sharetribe/flex-template-web/pull/931)
* [fix] obfuscatedCoordinatesImpl didn't always return coordinates within given offset radius.
  [#930](https://github.com/sharetribe/flex-template-web/pull/930)
* [fix] LocationAutocompleteInput: blur input when selecting by enter to prevent flash of default
  predictions. [#928](https://github.com/sharetribe/flex-template-web/pull/928)
* [fix] LocationAutocompleteInput: selecting with enter key prevented while fetching predictions.
  [#923](https://github.com/sharetribe/flex-template-web/pull/923)

[v1.4.3]: https://github.com/sharetribe/flex-template-web/compare/v1.4.2...v1.4.3

## [v1.4.2] 2018-09-06

* [add] Reduce character queries on LocationAutocompleteInput to reduce geocoding costs.
  [#883](https://github.com/sharetribe/flex-template-web/pull/883)
* [change] Update git links and improve documentation
  [#911](https://github.com/sharetribe/flex-template-web/pull/911)
* [change] improve env-template to better defaults.
  [#912](https://github.com/sharetribe/flex-template-web/pull/912)
* [fix] Touch event from location autocomplete prediction list ended up causing clicks.
  [#917](https://github.com/sharetribe/flex-template-web/pull/917)
* [change] Disable default predictions in listing wizard
  [#906](https://github.com/sharetribe/flex-template-web/pull/906)

[v1.4.2]: https://github.com/sharetribe/flex-template-web/compare/v1.4.1...v1.4.2

## [v1.4.1] 2018-08-21

* [fix] Fix window resize redirecting to search page with reusable map component
  [#905](https://github.com/sharetribe/flex-template-web/pull/905)

* [change] Maps configuration has been restructured. The new configuration is agnostic of the maps
  provider in use and works with both Google Maps as well as Mapbox.

  The fuzzy location circle has less configuration, but otherwise all the previous settings can be
  set also in the new configuration. See `config.js` for details.

  The default location searches are now enabled in the `.env-template`. For old installations, the
  `REACT_APP_DEFAULT_SEARCHES_ENABLED` env var should be set to `true`. The default searches can
  then be configured in `src/default-location-searches.js`.

  [#900](https://github.com/sharetribe/flex-template-web/pull/900)

[v1.4.1]: https://github.com/sharetribe/flex-template-web/compare/v1.4.0...v1.4.1

## [v1.4.0] 2018-08-17

* [change] Put availability calendar behind a feature flag
  [#902](https://github.com/sharetribe/flex-template-web/pull/902)
* [fix] Drop date time from time slots request query params
  [#901](https://github.com/sharetribe/flex-template-web/pull/901)
* [fix] Make a second time slots request when required
  [#901](https://github.com/sharetribe/flex-template-web/pull/901)
* [add] Map component (used in ListingPage) using Mapbox instead of Google Maps
  [#896](https://github.com/sharetribe/flex-template-web/pull/896)
* [add] Listing availability [#868](https://github.com/sharetribe/flex-template-web/pull/868),
  [#873](https://github.com/sharetribe/flex-template-web/pull/873),
  [#891](https://github.com/sharetribe/flex-template-web/pull/891) &
  [#892](https://github.com/sharetribe/flex-template-web/pull/892)
* [add] Add support for user's current location as a default suggestion in the location autocomplete
  search. [#895](https://github.com/sharetribe/flex-template-web/pull/895)
* [add] Add support for default locations in the LocationAutocompleteInput component. Common
  searches can be configured to show when the input has focus. This reduces typing and Google Places
  geolocation API usage. The defaults can be configured in
  `src/components/LocationAutocompleteInput/GeocoderGoogleMaps.js`.
  [#894](https://github.com/sharetribe/flex-template-web/pull/894)
* [change] Removed the `country` parameter from the search page as it was not used anywhere.
  [#893](https://github.com/sharetribe/flex-template-web/pull/893)

[v1.4.0]: https://github.com/sharetribe/flex-template-web/compare/v1.3.2...v1.4.0

## [v1.3.2] 2018-08-07

* [change] Update the Sharetribe Flex SDK to the 1.0.0 version in NPM. All the `sharetribe-sdk`
  imports are now using the new package name `sharetribe-flex-sdk`.
  [#884](https://github.com/sharetribe/flex-template-web/pull/884)
* [change] Reusable SearchMap. Fixed the original reverted version. (Includes audit exception 678)
  [#882](https://github.com/sharetribe/flex-template-web/pull/882)

[v1.3.2]: https://github.com/sharetribe/flex-template-web/compare/v1.3.1...v1.3.2

## [v1.3.1]

* [fix] Hotfix: reverting the usage of ReusableMapContainer due to production build error.
  [#881](https://github.com/sharetribe/flex-template-web/pull/881)

[v1.3.1]: https://github.com/sharetribe/flex-template-web/compare/v1.3.0...v1.3.1

## [v1.3.0]

* [change] Reusable SearchMap. [#877](https://github.com/sharetribe/flex-template-web/pull/877)
* [fix] Fix a search filters panel bug where selecting an option in a multi select filter ends up
  invoking a mobile filter callback function.
  [#876](https://github.com/sharetribe/flex-template-web/pull/876)
* [change] Use seeded random for client side coordinate obfuscation
  [#874](https://github.com/sharetribe/flex-template-web/pull/874)

[v1.3.0]: https://github.com/sharetribe/flex-template-web/compare/v1.2.2...v1.3.0

## [v1.2.2]

* [change] Change static map to dynamic map when clicked.
  [#871](https://github.com/sharetribe/flex-template-web/pull/871)

[v1.2.2]: https://github.com/sharetribe/flex-template-web/compare/v1.2.1...v1.2.2

## [v1.2.1]

* [fix] Lazy load map only if the map is near current viewport.
  [#871](https://github.com/sharetribe/flex-template-web/pull/871)

[v1.2.1]: https://github.com/sharetribe/flex-template-web/compare/v1.2.0...v1.2.1

## [v1.2.0]

* [change] Use Google's static map on ListingPage. This is a reaction to pricing change of Google
  Maps APIs. [#869](https://github.com/sharetribe/flex-template-web/pull/869)
* [change] Use sessionTokens and fields for Autocomplete calls to Google Maps. This is a reaction to
  pricing change of Google Maps APIs.
  [#867](https://github.com/sharetribe/flex-template-web/pull/867)
* [change] Change TransactionPage state management in loadData.
  [#863](https://github.com/sharetribe/flex-template-web/pull/863),
  [#865](https://github.com/sharetribe/flex-template-web/pull/865) &
  [#866](https://github.com/sharetribe/flex-template-web/pull/866)
* [fix] Fix submit button state on contact details page.
  [#864](https://github.com/sharetribe/flex-template-web/pull/864)
* [fix] Fix listing page host section layout bug.
  [#862](https://github.com/sharetribe/flex-template-web/pull/862)
* [fix] Fix initial message input clearing too early in checkout page.
  [#861](https://github.com/sharetribe/flex-template-web/pull/861)
* [fix] Fix setting Topbar search input initial value.
* [change] Update Redux to v4 [#859](https://github.com/sharetribe/flex-template-web/pull/859)
* [fix] Fix setting Topbar search input initial value
  [#857](https://github.com/sharetribe/flex-template-web/pull/857)

[v1.2.0]: https://github.com/sharetribe/flex-template-web/compare/v1.1.0...v1.2.0

## [v1.1.0]

* [fix] Improve slug creation (slashes were breaking rendering in some environments)
  [#850](https://github.com/sharetribe/flex-template-web/pull/850)
* [fix] Anonymous user should see contact link on UserCard
  [#851](https://github.com/sharetribe/flex-template-web/pull/851)
* [fix] Persisting booking request details across authentication
  [#852](https://github.com/sharetribe/flex-template-web/pull/852)
* [change] Footer styles changed to more generic (no disappearing columns etc.) If you have made
  changes to Footer, consider extracting it to different component before update.
  [#853](https://github.com/sharetribe/flex-template-web/pull/853)
* [change] Logo customization refactored to be easier. Check CheckoutPage, TopbarDesktop and Footer
  after update. [#854](https://github.com/sharetribe/flex-template-web/pull/854)
* [fix] Fix showing reviews from banned users.
  [#855](https://github.com/sharetribe/flex-template-web/pull/855)

[v1.1.0]: https://github.com/sharetribe/flex-template-web/compare/v1.0.0...v1.1.0

## [v1.0.0]

* [change] Migrate remaining Redux Forms to Final Form. Also now all the form components can be
  found in the src/forms folder. Remove redux-form from the dependencies.
  [#845](https://github.com/sharetribe/flex-template-web/pull/845)
* [fix] Extract and fix missing information reminder modal from Topbar
  [#846](https://github.com/sharetribe/flex-template-web/pull/846)
* [fix] Add missing styles for ModalMissingInformation from Topbar
  [#847](https://github.com/sharetribe/flex-template-web/pull/847)
* [fix] API does not return all image variants anymore, this adds correct variants to update contact
  details call. [#848](https://github.com/sharetribe/flex-template-web/pull/848)

[v1.0.0]: https://github.com/sharetribe/flex-template-web/compare/v0.3.1...v1.0.0

## [v0.3.1]

* [change] Change lodash import syntax to reduce bundle size (-15.14 KB)
  [#839](https://github.com/sharetribe/flex-template-web/pull/839)
* [fix] Use https instead of git to access SDK repo for Heroku build (now that the repo is public).
  TODO: create SDK releases instead of using direct refs to single commit.
  [#841](https://github.com/sharetribe/flex-template-web/pull/841)
* [fix] Typo fix for background-color
  [#842](https://github.com/sharetribe/flex-template-web/pull/842)

[v0.3.1]: https://github.com/sharetribe/flex-template-web/compare/v0.3.0...v0.3.1

## [v0.3.0]

* Remove custom touched handling from `FieldCheckboxGroup` as it has has become obsolete now that
  Final Form is replacing Redux Form.
  [#837](https://github.com/sharetribe/flex-template-web/pull/837)
* Create Stripe account directly instead of passing payout details to Flex API (deprecated way).
  [#836](https://github.com/sharetribe/flex-template-web/pull/836)

[v0.3.0]: https://github.com/sharetribe/flex-template-web/compare/v0.2.0...v0.3.0

## v0.2.0

* Starting a change log for Flex Template for Web.

