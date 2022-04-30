
angular.module('myApp', ['ngSanitize','ngMaterial', 'ngMdIcons'])

	.controller('myCtrl', [function myCtrl () {
		var vm = this;

		// static collection for test/demo
		vm.populations = [
			{ text: "Item 1" },
			{ text: "Item 2",
				children: [
					{ text: "Item 2.1" }
				]
			},
			{ text: "Item 3",
				children: [
					{ text: "Item 3.1",
						children: [
							{ text: "Item 3.1.1",
								children: [
									{ text: "Yet Another Item 3.1.1.1" }
								]
							},
							{ text: "Item 3.1.2" }
						]
					},
					{ text: "Item 3.2",
						children: [
							{ text: "Item 3.2.1" },
							{ text: "Item 3.2.2" }
						]
					},
					{ text: "Item 3.3" }
				]
			}
		];
	}])

	.config(function (ngMdIconServiceProvider) {
		ngMdIconServiceProvider.addShapes({
			'icon-nested-select-vbar':   '<path d="M 19.5 0h1v40h-1z"/>',
			'icon-nested-select-el':     '<path d="M 19.5 0h1v19.5h19.5v1h-20.5z"/>',
			'icon-nested-select-midbar': '<path d="M 19.5 0h1v19.5h19.5v1h-19.5v39h-1z"/>',
			'icon-nested-select-space':  '<g/>',
		}).addViewBoxes({
			'icon-nested-select-vbar':   '0 0 40 40',
			'icon-nested-select-el':     '0 0 40 40',
			'icon-nested-select-midbar': '0 0 40 40',
			'icon-nested-select-space':  '0 0 40 40'
		});
	})

	.component('nestedSelect', {
		bindings: {
			options: '<',
			label: '@',
			onChange: '&'
		},
		template: `
			<md-input-container ng-class="{'md-input-has-value': ($ctrl.hasValue() || $ctrl.fixedMenu), 'md-input-focused': $ctrl.hasFocus()}">
				<label>{{$ctrl.label}}</label>
				<nested-select-selection ng-if="$ctrl.showSelection"
					ng-click="$ctrl.onClickSelection()" ng-class="{'menu-open': $ctrl.showMenu, focused: $ctrl.hasFocus()}"
					class="md-select-value" tabindex="0">
					<span ng-bind="$ctrl.getSelectionText()" >
					</span>
					<span class="md-select-icon"></span>
				</nested-select-selection>
			</md-input-container>
			<nested-select-menu ng-class="{visible: $ctrl.showMenu}" md-whiteframe="2" tabindex="-1">
				<nested-select-header ng-if="$ctrl.placeholder" >
					<input type="search" placeholder="{{$ctrl.placeholder}}"
						ng-model="$ctrl.filter" ng-change="$ctrl.onChangeFilter()" />
					<md-button class="md-icon-button" ng-if="$ctrl.multiple && $ctrl.allowSelectAll"
						ng-click="$ctrl.onClickAll()">
						<md-tooltip>Select All</md-tooltip>
						<ng-md-icon icon="playlist_add_check" style="fill: currentColor"></ng-md-icon>
					</md-button>
				</nested-select-header>
				<md-content ng-class="{filtering: $ctrl.filter.length}">
					<nested-select-options options="$ctrl.options" collapsible="$ctrl.collapsible" multiple="$ctrl.multiple" depth="0" on-change="$ctrl.onOptionChange($event)">
				</md-content>
			</nested-select-menu>
		`,
		controller: function nestedSelect ($scope, $timeout, $element, $attrs, $mdConstant) {
			var $ctrl = this;

			// Lifecycle event handlers

			$ctrl.$onInit = function () {
				$ctrl.filter = "";
				$ctrl.placeholder = $attrs.placeholder;
				$ctrl.multiple = !!$attrs.$attr.multiple;
				$ctrl.collapsible = !!$attrs.$attr.collapsible;
				$ctrl.showSelection = !!$attrs.$attr.showSelection;
				$ctrl.allowSelectAll = !!$attrs.$attr.allowSelectAll;
				$ctrl.fixedMenu = !!$attrs.$attr.fixedMenu;
				$element.on("focusout", $ctrl.onFocusout);
				$element.on("keyup", $ctrl.onKeyup);
			};

			$ctrl.$onChanges = function (changes) {
				if (changes.options) {
					$ctrl.options = angular.copy($ctrl.options);
				} else {
					$ctrl.options = $ctrl.options || [];
				}
				$ctrl.updateHighlightedOptions();
			};

			$ctrl.$postLink = function () {
				var menu = $element.find('nested-select-menu');
				if (menu) {
					menu.css('width', $element[0].clientWidth + 'px');
				}
			};

			// UI event handlers

			$ctrl.onFocusout = function (event) {
				// Because the component includes multiple focusable
				// elements, this handler can be triggered when the
				// user moves from one element to another within
				// the main container. That's not really a focusout
				// event for the whole component, so we want to
				// ignore those interactions.
				if ($element[0].contains(event.relatedTarget)) {
					return;
				}

				$ctrl.closeMenu();

				// Angular doesn't automatically run a digest if
				// the event's target is outside of the component
				// element. This occurs, for example, if the
				// user clicks outside the element.
				$scope.$apply();
			};

			$ctrl.onKeyup = function (event) {
				switch(event.keyCode) {
					case $mdConstant.KEY_CODE.ESCAPE:
						$ctrl.closeMenu();
						document.activeElement.blur();
						$scope.$apply();
						break;
					case $mdConstant.KEY_CODE.RIGHT_ARROW:
					case $mdConstant.KEY_CODE.DOWN_ARROW:
						$ctrl.navigateForward();
						break;
					case $mdConstant.KEY_CODE.LEFT_ARROW:
					case $mdConstant.KEY_CODE.UP_ARROW:
						$ctrl.navigateBackward();
						break;
				}
			};

			$ctrl.onClickSelection = function () {
				$ctrl.toggleMenu();
			};

			$ctrl.onChangeFilter = function () {
				$ctrl.updateHighlights();
				$ctrl.updateHighlightedOptions();
			};

			$ctrl.onClickAll = function () {

				// Don't emit change events for
				// each change but rather keep track
				// of all changes and emit a single event
				// after all options have been processed.
				var hasChanged = false;

				// If all the visible options are already
				// selected, this event de-selects them.
				if ($ctrl.isSelectionComplete()) {
					$ctrl.applyFnToOptions(function deselectOption (opt) {
						if (!opt.suppressed && !opt.muted) {
							$ctrl.deselectOption(opt, true);
							hasChanged = true;
						}
					}, $ctrl.options, true);
				} else {
					$ctrl.applyFnToOptions(function selectOption (opt) {
						if (!opt.suppressed && !opt.muted) {
							$ctrl.selectOption(opt, true);
							hasChanged = true;
						}
					}, $ctrl.options, true);
				}

				// If any options were updated, inform
				// the parent controller that the
				// selection set has changed.
				if (hasChanged) {
					$ctrl.emitChange();
				}
			};

			// Child component event handlers

			$ctrl.onOptionChange = function (event) {
				if (!$ctrl.multiple) {
					if (event.option.selected) {
						$ctrl.applyFnToOptions(function (opt) {
							if (opt !== event.option) {
								$ctrl.deselectOption(opt, true);
							}
						});
						var selection = $element.find('nested-select-selection');
						if (selection.length) {
							$ctrl.setFocus(selection[0]);
						}
					} else {
						$ctrl.clearFocus();
					}
					$ctrl.closeMenu();
				}
				$ctrl.emitChange();
			};

			// Emit events to parent components

			$ctrl.emitChange = function () {
				$ctrl.onChange({$event: {selectedValues: $ctrl.getSelectionValues()}});
			};

			// Utility functions

			$ctrl.applyFnToOptions = function (fn, opts, excludeCollapsed) {
				var opts = opts || $ctrl.options;
				opts.forEach(function applyFnToOption (opt) {
					fn(opt);
					if (opt.children && (!opt.collapsed || !excludeCollapsed)) {
						$ctrl.applyFnToOptions(fn, opt.children, excludeCollapsed);
					}
				});
			};

			$ctrl.isSelectionComplete = function () {
				var all = true;
				$ctrl.applyFnToOptions(function checkOptionSelectedState (opt) {
					all = all && (opt.selected || opt.suppressed || opt.muted);
				}, $ctrl.options, true);
				return all;
			};

			$ctrl.getSelectionText = function () {
				var selection = [];
				$ctrl.applyFnToOptions(function accumulateSelectedText (opt) {
					if (opt.selected) {
						selection.push(opt.text);
					}
				});
				return selection.join(", ");
			};

			$ctrl.getSelectionValues = function () {
				var selection = [];
				$ctrl.applyFnToOptions(function accumulateSelectedValues (opt) {
					if (opt.selected) {
						selection.push(opt.value);
					}
				});
				return selection;
			};

			$ctrl.hasValue = function () {
				var hasValue = false;
				$ctrl.applyFnToOptions(function accumulateSelectedValues (opt) {
					if (opt.selected) {
						hasValue = true;
					}
				});
				return hasValue;
			};

			$ctrl.hasFocus = function () {
				return $element[0].contains(document.activeElement);
			};

			$ctrl.setFocus = function (element, delay) {
				delay = delay || 0;
				// Because the controller is already watching for
				// focus events on the entire component, make sure
				// that Angular doesn't run the digest loop here.
				// Otherwise Angular throws an already in progress
				// error.
				// See https://docs.angularjs.org/error/$rootScope/inprog
				$timeout(function () {
					element.focus();
				}, delay, false);
			};

			$ctrl.clearFocus = function () {
				// Because the controller is already watching for
				// focusout events on the entire component, make sure
				// that Angular doesn't run the digest loop here.
				// Otherwise Angular throws an already in progress
				// error.
				// See https://docs.angularjs.org/error/$rootScope/inprog
				$timeout(function () {
					document.activeElement.blur();
				}, 0, false);
			};

			$ctrl.getFocusableNodes = function () {
				var nodes = Array.prototype.slice.call($element[0].querySelectorAll([
					"nested-select-selection",
					"input",
					"button",
					"md-checkbox"
				].join(",")));

				var hidden = new Set($element[0].querySelectorAll([
					".filtering button",
					"md-checkbox[disabled]",
					"nested-select-options.collapsed button",
					"nested-select-options.collapsed md-checkbox"
				].join(",")));

				return nodes.filter(function (node) {
					return !hidden.has(node);
				});
			};

			$ctrl.getFocusedIndex = function (nodes) {
				var curIdx = -1;
				nodes.some(function (node, idx) {
					if (node === document.activeElement) {
						curIdx = idx;
						return true;
					}
				});
				return curIdx;
			};

			// Component logic

			$ctrl.toggleMenu = function () {
				if ($ctrl.showMenu) {
					$ctrl.closeMenu();
				} else {
					$ctrl.openMenu();
				}
			};

			$ctrl.openMenu = function () {
				$ctrl.showMenu = true;
				var search = $element.find('input');
				if (search.length) {
					$ctrl.setFocus(search[0], 400);
				}
			};

			$ctrl.closeMenu = function () {
				$ctrl.showMenu = $ctrl.fixedMenu;
			};

			$ctrl.updateHighlights = function () {

				var filter = $ctrl.filter;

				if (filter) {

					// Convert the text input from the search element
					// into a regular expression to support features
					// such as case-insensitivity and match highlighting.
					// Since the ultimate result is a regular expression,
					// also give users the ability to enter their own
					// regular expressions directly. User-entered regular
					// expressions start and end with a `/` and have at
					// least one character between them.

					if (filter.match(/^\/.+\/$/)) {

						// Already a regular expression, so just
						// remove the delimiters.
						filter = filter.slice(1, -1);

					} else {

						// Not a regular expression, so escape any
						// characters that a regular expression would
						// view as control characters.
						filter = filter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

					}

					// Add grouping parentheses around the search text
					// so that matching text can be highlighted.
					$ctrl.highlights = new RegExp("(" + filter + ")", "gi");

				} else {

					$ctrl.highlights = false;

				}
			};

			$ctrl.applyHighlightsToOptions = function (opts) {

				// Recurse through the options tree and update
				// each option's status with respect to highlighting.
				// An option is fully suppressed if it is not
				// itself highlighted and has no children that
				// are highlighted. If an option is not itself
				// highlighted but has highlighted children, it
				// is not suppressed but muted.

				// Returns a boolean indicating whether or
				// not any of the options at the current level
				// are highlighted or have highlighted children.
				return opts.reduce(function accumulateHighlights(anyHighlights, opt) {

					// Does the current option have any highlighted children?
					var childHighlights = opt.children && $ctrl.applyHighlightsToOptions(opt.children);

					// Should the current option itself be highlighted?
					var isHighlighted = $ctrl.highlights.test(opt.text);
					// Since regex is global, be sure to reset after test()
					$ctrl.highlights.lastIndex = 0;

					// If highlighting is needed, do it; otherwise just
					// use the plain text.
					if (isHighlighted) {
						opt.highlightedText = opt.text.replace($ctrl.highlights, "<b>$1</b>");
					} else {
						opt.highlightedText = opt.text;
					}

					// Update the option status.
					opt.suppressed = !isHighlighted && !childHighlights;
					opt.muted = !isHighlighted && childHighlights;

					// Update accumulating value by logically ORing
					// the highlight status of the current option and
					// its children
					return anyHighlights || isHighlighted || childHighlights;
				}, false);
			};

			$ctrl.updateHighlightedOptions = function () {
				if ($ctrl.highlights) {

					// If there are highlights to apply, do so
					$ctrl.applyHighlightsToOptions($ctrl.options);

				} else {

					// No highlights to apply so just reset
					// the option status
					$ctrl.applyFnToOptions(function (opt) {
						opt.highlightedText = opt.text;
						opt.suppressed = false;
						opt.muted = false;
					});
				}
			};

			$ctrl.selectOption = function (opt, suppressChange) {
				if (!opt.selected) {
					if (!$ctrl.multiple) {
						$ctrl.applyFnToOptions(function (opt) {
							$ctrl.deselectOption(opt, true);
						});
						$ctrl.closeMenu();
					}
					if (!suppressChange) {
						$ctrl.emitChange();
					}
					opt.selected = true;
				}
			};

			$ctrl.deselectOption = function (opt, suppressChange) {
				var changed = opt.selected;
				opt.selected = false;
				if (changed && !suppressChange) {
					$ctrl.emitChange();
				}
			};

			$ctrl.navigateForward = function () {
				var nodes = $ctrl.getFocusableNodes();
				var curIdx = $ctrl.getFocusedIndex(nodes);
				if (curIdx !== -1 && curIdx < nodes.length - 1) {
					$ctrl.setFocus(nodes[curIdx + 1]);
				}
			};

			$ctrl.navigateBackward = function () {
				var nodes = $ctrl.getFocusableNodes();
				var curIdx = $ctrl.getFocusedIndex(nodes);
				if (curIdx > 0) {
					$ctrl.setFocus(nodes[curIdx - 1]);
				}
			};
		}
	})

	.component('nestedSelectOptions', {
		bindings: {
			options: '<',
			collapsible: '<',
			multiple: '<',
			depth: '<',
			lastSibling: '<',
			onChange: '&'
		},
		template: `
			<nested-select-option ng-repeat="option in $ctrl.options">
				<nested-select-text ng-if="!option.suppressed">
					<nested-select-guide ng-if="$ctrl.showCollapseSpacer(option)" >
						<ng-md-icon class="nested-select-icon" icon="icon-nested-select-space" size="40" style="fill: rgba(0,0,0,0.12)"></ng-md-icon>
					</nested-select-guide>
					<nested-select-guide ng-repeat="guide in $ctrl.countPrefixGuides(option) track by $index">
						<ng-md-icon class="nested-select-icon" icon="{{$ctrl.getPrefixGuideIcon(option, $index)}}" size="40" style="fill: rgba(0,0,0,0.12)"></ng-md-icon>
					</nested-select-guide>
					<nested-select-guide ng-if="$ctrl.showGuide(option)" >
						<ng-md-icon class="nested-select-icon" icon="{{$ctrl.getGuideIcon(option)}}" size="40" style="fill: rgba(0,0,0,0.12)"></ng-md-icon>
					</nested-select-guide>
					<md-button class="md-icon-button nested-select-collapse" ng-if="$ctrl.showCollapse(option)"
						aria-label="collapse/expand" ng-click="$ctrl.onCollapseClick(option)" ng-class="{collapsed: option.collapsed}">
						<ng-md-icon icon="keyboard_arrow_down" style="fill: currentColor"></ng-md-icon>
					</md-button>
					<md-checkbox ng-if="!option.suppressed" ng-model="option.selected" ng-disabled="option.muted" ng-change="$ctrl.onCheckboxChange(option)" aria-label="{{option.text}}">
						<!-- <md-tooltip>{{option.text}}</md-tooltip> -->
						<span ng-bind-html="option.highlightedText"></span>
					</md-checkbox>
				</nested-select-text>
				<nested-select-options ng-if="option.children && option.children.length" options="option.children"
					collapsible="$ctrl.collapsible" multiple="$ctrl.multiple" depth="$ctrl.depth + 1" last-sibling="$ctrl.lastSibling + (+$last)"
					ng-class="{collapsed: option.collapsed}" on-change="$ctrl.onChildChange($event)">
				</nested-select-options>
			</nested-select-option>
		`,
		controller: function nestedSelectOptions ($element, $attrs) {
			var $ctrl = this;
			$ctrl.$onInit = function () {
				$ctrl.collapsed = false;
				$ctrl.lastSibling = $ctrl.lastSibling || "";
			}
			$ctrl.$onChanges = function (changes) {
				if (changes.options && !changes.options.isFirstChange()) {
					$ctrl.options = angular.copy($ctrl.options);
				}
			};

			// Utilities for adding visual guides and buttons

			// Should a spacer be added to account for collapse/expand button?
			$ctrl.showCollapseSpacer = function (opt) {
				return $ctrl.collapsible && $ctrl.depth;
			};

			// How many guides to insert in front of a text label?
			$ctrl.countPrefixGuides = function () {
				// retuns an empty array with the appropriate number of
				// elements so that ng-repeat can iterate over it
				return $ctrl.depth > 0 ? new Array($ctrl.depth - 1) : [];
			};

			// What icon should be used at the current guide depth?
			$ctrl.getPrefixGuideIcon = function (opt, depthIdx) {
				if ($ctrl.multiple || $ctrl.lastSibling[depthIdx + 1] === '1') {
					return "icon-nested-select-space";
				} else {
					return "icon-nested-select-vbar";
				}
			};

			// Should a guide be added for this option?
			$ctrl.showGuide = function (opt) {
				return !$ctrl.showCollapse(opt) && (!$ctrl.multiple && ($ctrl.depth > 0) || $ctrl.collapsible);
			};


			// What icon should be used for the current option's guide?
			$ctrl.getGuideIcon = function (opt) {
				if ($ctrl.collapsible && (!opt.children || opt.children.length === 0) && ($ctrl.depth === 0 || $ctrl.multiple)) {
					return "icon-nested-select-space";
				} else if ($ctrl.options[$ctrl.options.length - 1] === opt) {
					return "icon-nested-select-el";
				} else {
					return "icon-nested-select-midbar";
				}
			};

			// Should the collapse/expand button be included?
			$ctrl.showCollapse = function (opt) {
				return $ctrl.collapsible && opt.children && (opt.children.length > 0);
			};


			$ctrl.onCheckboxChange = function (opt) {
				$ctrl.onChange({$event: {option: opt}});
			};
			$ctrl.onCollapseClick = function (opt) {
				opt.collapsed = !opt.collapsed;
			};
			$ctrl.onChildChange = function (event) {
				$ctrl.onChange({$event: {option: event.option}});
			};
		}
	});

