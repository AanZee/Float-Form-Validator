/*
 *  Project: float.form-validate.js
 *  Description: A plugin that can validate form fields
 *  Author: Aan Zee (frontend@aanzee.nl)
 *  GitHub: https://github.com/AanZee/validate
 *  Version: 0.0.1
 *  License: MIT
 */

;(function ( $, window, undefined ) {

	/**
	 * Form Validator
	 * @constructor
	 * @param {object} element - The HTML element the validator should be bound to
	 * @param {object} options - An option map
	 */
	function FormValidator(element, options) {
		this.form = element;
		this.$form = $(element);

		// Extend the defaults with the passed options
		this.settings = $.extend( true, {}, FormValidator.defaults, options );

		// Set the messages
		this.settings.messages = FormValidator.messages;

		// Defined form field array
		this.formElements = [];

		// Run the initializer


		this.init();
	}

	/**
	 * Default plugin settings
	 */
	FormValidator.defaults = {
		// A data selector is required
		formElementDataSelector: '[data-form-element-type]',
		rowClass: 'form--row',
		messagePlacementClass: 'form--mainbox',

		// Used if the chosen message type is not supported
		messageType: 'note',

		// Used if the chosen error is not supported
		errorType: 'generic',

		// Used to check if debug messages should be displayed
		debug: false
	};

	// Static holder of formElements, might be better private
	// since there is an addFormElement method
	FormValidator.formElements = {};

	FormValidator.messages = {
		generic: 'An error occurred',
		required: 'This field is required',
		email: 'This is not a correct email address',
		number: 'This is not a correct number'
	};

	FormValidator.containerTemplates = {
		icons: function () {
			return '<div class="icon-holder"><i class="icon-check"></i><i class="icon-exclamation"></i></div>';
		},
		message: function () {
			return '<div class="messages"></div>';
		}
	};

	FormValidator.messageTemplates = {
		note: function (text) {
			return '<p class="message message-note">' + text + '</p>';
		},
		error: function (text) {
			return '<p class="message message-error">' + text + '</p>';
		}
	};

	FormValidator.tests = {
		/**
		 * Checks for empty values, only supports text
		 * @param {string} value
		 * @return {bool}
		 */
		required: function (value) {
			return $.trim(value).length > 0;
		},

		/**
		 * Checks if length of value is correct
		 * @param {string} value
		 * @param {int} minlength
		 * @param {int} maxlength
		 * @return {bool}
		 */
		length: function (value, minlength, maxlength) {
			if (typeof minlength === 'number' && value.length < minlength) { return false; }
			if (typeof maxlength === 'number' && value.length > maxlength) { return false; }

			return true;
		},

		email: function (value) {
			return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test( value );
		},

		number: function (value) {
			return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
		}

	};

	/**
	 * Static method
	 * add validation method
	 * @param {string} type
	 * @param {function} fn
	 */
	FormValidator.addTest = function (type, fn) {
		if (this.tests[type]) {
			throw new Error('(FormValidator.addMethod): test with type "' + type + '" is already registered as a validation method');
		} else {
			this.tests[type] = fn;
		}
	};

	/**
	 * Static method
	 * add validation method
	 * @param {string} type
	 * @param {string} message
	 */
	FormValidator.addMessage = function (type, message) {
		if (this.messages[type]) {
			throw new Error('(FormValidator.addMessage): message with type "' + type + '" is already registered as a message');
		} else {
			this.messages[type] = message;
		}
	};

	/**
	 * Static method
	 * @param {string} type - text,email etc.
	 * @return {bool} is FormElement supported?
	 */
	FormValidator.isFormElementSupported = function ( type ) {
		return !! ( this.formElements[type] );
	};

	/**
	 * Object.create polyfill
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
	 */
	if (typeof Object.create !== 'function') {
		(function () {
			var F = function () {};
				Object.create = function (o) {
					if (arguments.length > 1) {
						throw new Error('Second argument not supported');
					}
					if (o === null) {
						throw new Error('Cannot set a null [[Prototype]]');
					}
					if (typeof o !== 'object') {
						throw new TypeError('Argument must be an object');
					}
					F.prototype = o;
					return new F();
				};
		})();
	}

	/**
	 * Static method
	 * add form element types
	 * @param {string} type
	 * @param {object} adapter - methods used by FormElement
	 */
	FormValidator.addFormElement = function (type, adapter) {
		if (this.formElements[type]) {
			throw new Error('(FormValidator.addFormElement): form element with type "' + type + '" is already registered as a Form Element type');
		} else {
			// Register the adapter by creating a function which extends FormElement
			// creating a new function with the type wanted
			this.formElements[type] = function () {
				// Call the super
				FormElement.call(this);
				// Extend this with the adapter
				$.extend(this, adapter);
				this.type = type;
			};

			// Inherit from FormElement
			this.formElements[type].prototype = Object.create(FormElement.prototype);
		}
	};

	/**
	 * Static method
	 * TODO: Shouldn't be static because uses the defaults
	 * @param {string} errorType
	 * @param {string} messageType
	 * @return {string}
	 */
	FormValidator.createMessage = function (errorType, messageType) {
		var messageTemplate, message;

		// Get the message template with the messageType given or revert to the default
		if ( this.messageTemplates.hasOwnProperty( messageType ) ) {
			messageTemplate = this.messageTemplates[ messageType ];
		} else {
			messageTemplate = this.messageTemplates[ this.defaults.messageType ];
		}

		// Get the wanted message or get the default
		if ( this.messages.hasOwnProperty( errorType ) ) {
			message = this.messages[ errorType ];
		} else {
			message = this.messages[ this.defaults.errorType ];
		}

		return messageTemplate( message );
	};

	/**
	 * Static method
	 * TODO: Shouldn't be static because uses the defaults
	 * @param {string} errorType
	 * @param {string} messageType
	 * @return {string}
	 */
	FormValidator.createContainer = function (containerType) {
		var containerTemplate = function() { return ''; };

		// Get the container template with the containerType given
		if ( this.containerTemplates.hasOwnProperty( containerType ) ) {
			containerTemplate = this.containerTemplates[ containerType ];
		}

		return containerTemplate();
	};

	FormValidator.setDefaults = function( settings ) {
		$.extend( FormValidator.defaults, settings );
	};

	/**
	 * Initializer
	 */
	FormValidator.prototype.init = function () {
		// Form element types are registerd on this object
		this.formElements = {};

		// Add novalidate if HTML5
		this.$form.attr( 'novalidate', 'novalidate' );

		// Add aria rules for screen readers
		this.$form.find('[required]').attr('aria-required', 'true');

		// Load all fields
		this.$formElements = this.findElements();

		// Load events
		this.loadEvents();

		this.setIsProcessed(false);
	};

	/**
	 * Init all form elements
	 */
	FormValidator.prototype.findElements = function() {
		return this.$form.find( this.settings.formElementDataSelector ).formElement(this.settings, this);
	};

	FormValidator.prototype.setIsProcessed = function( isProcessed ) {
		this.isProcessed = isProcessed;
	};

	FormValidator.prototype.getIsProcessed = function() {
		return this.isProcessed;
	};

	/**
	 * Inits all the events on the elements
	 */
	FormValidator.prototype.loadEvents = function() {
		var _this = this;

		// Form submit
		this.$form.on('submit', function (e) {
			if(_this.settings.debug) {
				console.log('(FormValidator.loadEvents): form submit', _this);
			}

			if (_this.settings.debug && window.console) {
				console.info('Validating form: ', _this.$form);
			}

			var errors = [];


			// Fire the validate method on our form elements
			_this.$formElements.formElement('validate', {
				eventType: 'formSubmit'
			}, function () {
				if ( ! this.isValid) {
					errors.push(this);
				}
			});

			_this.setIsProcessed(true);

			if (errors.length > 0) {
				// show top message
				e.preventDefault();
			}
		});

	};

	/** jQuery plugin wrapper */
	$.fn.formValidate = function ( options ) {
		var args = arguments;
		// Check the type of the options var
		if (options === undefined || typeof options === 'object') {
			// If no options are passed, or the options var is an object
			// it means that this is a 'normal' validator call
			return this.each(function () {
				// Check if this element already has a validator class loaded
				if (!$.data(this, 'formValidate')) {
					// If not, create the class and save it to the element
					$.data(this, 'formValidate', new FormValidator( this, options ));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			// If the options var is a string (and it's not a reference to a private or init function)
			// it means that this is a call to one of the public functions
			return this.each(function () {
				// Fetch the instance
				var instance = $.data(this, 'formValidate');

				// Check if this is a correct instance and if the function exists
				if (instance instanceof FormValidator && typeof instance[options] === 'function') {
					// If so, call that function
					instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
				}

				// Allow instances to be destroyed via the 'destroy' method
				if (options === 'destroy') {
					// TODO: destroy instance classes, etc
					$.data(this, 'formValidate', null);
				}
			});
		}
	};

	/** Also publish the class in the $ namespace */
	$.FormValidator = FormValidator;

	/**
	 * Form Element
	 * @constructor
	 */
	function FormElement () {}

	FormElement.defaults = {
		rowErrorClass: 'is-error',
		rowValidClass: 'is-valid',
		messageContainerClass: 'messages'
	};

	/**
	 * @param {object} element - The HTML form element
	 * @param {object} options - An option map
	 * @return this
	 */
	FormElement.prototype.init = function (element, options, validator) {
		// Save both references to the element
		this.element = element;
		this.$element = $(element);

		// Define the validator that has loaded this element
		this.validator = validator;

		// Extend the defaults with the passed options and the Form
		this.settings = $.extend( true, {}, FormElement.defaults, options);

		// Create empty errors
		this.errors = [];

		// Initial valid state
		this.isValid = false;

		// Seperate some initializers so they can easily be extended by the adapters
		this.initInput();
		this.initMessages();
		this.loadEvents();

		// TODO: implement reveal pattern with private methods
		return this;
	};

	/**
	 * Can be used to implement more advanced elements
	 * @return this
	 */
	FormElement.prototype.initInput = function () {
		// Get the input of this form element
		this.$input = this.$element.find('input');

		return this;
	};

	FormElement.prototype.initMessages = function () {
		var $messagePlacement = this.$element;

		// Check if a message placement class has been set and if an child element with that class can be found
		if( this.settings.messagePlacementClass !== '' && this.$element.find('.' + this.settings.messagePlacementClass).length )  {
			// If so, use that element to place the message container in
			$messagePlacement = this.$element.find('.' + this.settings.messagePlacementClass);
		}

		// Get the message container
		this.$iconContainer = $(FormValidator.createContainer('icons')).appendTo( $messagePlacement );
		this.$messageContainer = $(FormValidator.createContainer('message')).appendTo( $messagePlacement );

		return this;
	};

	/**
	 * @return value
	 */
	FormElement.prototype.getValue = function () {
		return this.$input.val();
	};

	/**
	 * @param {string} errorType - required etc.
	 */
	FormElement.prototype.placeError = function (errorType) {
		return this.placeMessage( FormValidator.createMessage(errorType, 'error'), 'error');
	};

	FormElement.prototype.placeNote = function (errorType) {
		return this.placeMessage( FormValidator.createMessage(errorType, 'note'), 'note');
	}

	/**
	 * @param {string} message - html of the message
	 */
	FormElement.prototype.placeMessage = function (message, messageType) {
		if (this.settings.debug) {
			console.log('(FormElement.placeMessage)(debug): ' + message);
		}

		this.$messageContainer.html(message);

		return this;
	};

	FormElement.prototype.removeMessages = function () {
		this.$messageContainer.empty();
		return this;
	};

	/**
	 * @param {object} errorStack - { 'errorName' : bool }
	 * @return {array} errors
	 */
	FormElement.prototype._checkErrors = function (errorStack) {
		return $.map(errorStack, function (obj) {
			for (var key in obj) {
				if ( ! obj[key]) {
					return key;
				}
			}
		});
	};

	FormElement.prototype.setValidState = function () {
		this.removeMessages();

		this.$element
			.addClass( this.settings.rowValidClass )
			.removeClass( this.settings.rowErrorClass );

		return this;
	};

	FormElement.prototype.setErrorState = function () {
		this.$element
			.addClass( this.settings.rowErrorClass )
			.removeClass( this.settings.rowValidClass );

		return this;
	};

	/**
	 * @return this
	 */
	FormElement.prototype.setNeutralState = function () {
		this.removeMessages();

		this.$element
			.removeClass( this.settings.rowErrorClass )
			.removeClass( this.settings.rowValidClass );

		return this;
	};

	FormElement.prototype.loadEvents = function () {
		if(this.settings.debug) {
			console.log('(FormElement.prototype.loadEvents): not implemented by the adapter');
		}
		return this;
	};

	/**
	 *  @param {object} options - { eventType: string, placeErrorsWhenInvalid: array }
	 */
	FormElement.prototype.validate = function (options, callback) {
		// Get the error stack from the validation method
		var errorStack = this.validation( this.getValue() );

		// Turn map into array
		var errors = this.errors = this._checkErrors(errorStack);

		if (this.settings.debug) {
			console.log('(FormElement.validate)(debug): options: ', options, ' errors: ', errors);
		}

		if ( errors.length > 0) {
			// Change state only on validate
			this.isValid = false;

			// There are errors, neutralize first
			this.setNeutralState();

			// Decide if the error should be showed

			// NOTE: Check formSubmitSettings
			// if (options.placeErrorsWhenInvalid && (this.validator.getIsProcessed() && $.inArray(errors[0], options.placeErrorsWhenInvalid) > -1)
			// 	|| (options.eventType === 'formSubmit' && this.formSubmitSettings && $.inArray(errors[0], this.formSubmitSettings.placeErrorsWhenInvalid)) ) {
			if (options.placeErrorsWhenInvalid && (this.validator.getIsProcessed() && $.inArray(errors[0], options.placeErrorsWhenInvalid) > -1) || (options.eventType === 'formSubmit') ) {

				// Place the error only when the first error in the stack triggers the error
				if (this.settings.debug) {
					console.log('(FormElement.validate)(debug): Place errors because errors[0] "' + errors[0] + '" is in options.placeErrorsWhenInvalid: ', options.placeErrorsWhenInvalid);
				}

				this.setErrorState();

				// Place only the most relevant error, first on the stack
				this.placeError( errors[0] );
			}

			// Decide a note should be showed


			// To do: Fix Note function
			// if ((options.placeNoteWhenInvalid && $.inArray(errors[0], options.placeNoteWhenInvalid) > -1) || ( options.eventType === 'formSubmit' && this.formSubmitSettings && $.inArray(errors[0], this.formSubmitSettings.placeNoteWhenInvalid) ) ) {

			// 	// Place the note only when the first error in the stack triggers the error
			// 	if (this.settings.debug) {
			// 		console.log('(FormElement.validate)(debug): Place note because errors[0] "' + errors[0] + '" is in options.placeNoteWhenInvalid: ', options.placeNoteWhenInvalid);
			// 	}

			// 	// Place only the most relevant error, first on the stack
			// 	this.placeNote( errors[0] );
			// }

		} else {
			// Change state only on validate
			this.isValid = true;

			// The form element is valid
			this.setValidState();
		}

		if (callback && typeof callback === 'function') {
			callback.apply(this);
		}

		return this;
	};

	/**
	 * jQuery inspiredplugin wrapper for form elements
	 * ------------------------------------------------------
	 * Instead of always returning the FormElement, the subclass such
	 * as text/email is created if the type is available
	 */
	$.fn.formElement = function (options, validator) {
		var args = arguments;
		// Check the type of the options var
		if (options === undefined || typeof options === 'object') {

			// If no options are passed, or the options var is an object
			// it means that this is a 'normal' validator call
			return this.each(function () {

				// Get the form element type
				var type = $(this).data('form-element-type');

				// Check if this element already has a validator class loaded
				if ( ! $.data(this, 'formElement')) {
					// If not, create the class and save it to the element

					if ( $.FormValidator.isFormElementSupported( type ) ) {
						// Create the desired form element if supported
						if (typeof options === 'object' && options.debug) {
							console.log('($.fn.formElement): FormElement type is supported "' + type + '"');
						}
						$.data( this, 'formElement', (new $.FormValidator.formElements[ type ]()).init(this, options, validator) );

					} else {
						if (typeof options === 'object' && options.debug) {
							console.error('($.fn.formElement): FormElement type "' + type + '" is not supported default FormElement used');
						}
						$.data( this, 'formElement', new FormElement().init(this, options, validator) );
					}

				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			// If the options var is a string (and it's not a reference to a private or init function)
			// it means that this is a call to one of the public functions
			return this.each(function () {
				// Fetch the instance
				var instance = $.data(this, 'formElement');

				// Check if this is a correct instance and if the function exists
				if (instance instanceof FormElement && typeof instance[options] === 'function') {
					// If so, call that function
					instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
				}

				// Allow instances to be destroyed via the 'destroy' method
				if (options === 'destroy') {
					// TODO: destroy instance classes, etc
					$.data(this, 'formElement', null);
				}
			});
		}
	};

}(jQuery, window));