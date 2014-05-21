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

		console.log(this);

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
		formElementDataSelector: '[data-form-element]',
		rowClass: "flt-form__row",

		// Used if the chosen message type is not supported
		messageType: "note",

		// Used if the chosen error is not supported
		errorType: "generic"
	};

	// Static holder of formElements, might be better private
	// since there is an addFormElement method
	FormValidator.formElements = {};

	FormValidator.messages = {
		generic: "An error occurred",
		required: "This field is required",
		email: "This is not a correct email address",
		number: "This is not a correct number"
	};

	FormValidator.messageTemplates = {
		note: function (text) {
			return '<p class="flt-form__message-note">' + text + '</p>';
		},
		error: function (text) {
			return '<p class="flt-form__message-error">' + text + '</p>';
		}
	};

	FormValidator.methods = {
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
			if (typeof minlength === "number" && value.length < minlength) { return false; }
			if (typeof maxlength === "number" && value.length > maxlength) { return false; }

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
	FormValidator.addMethod = function (type, fn) {
		if (this.methods[type]) {
			throw new Error('(FormValidator.addMethod): method with type "' + type + '" is already registered as a validation method');
		} else {
			this.methods[type] = fn;
		}
	};

	/**
	 * Static method
	 * add form element types
	 * @param {string} type
	 * @param {object} object - methods used by FormElement
	 */
	FormValidator.addFormElement = function (type, object) {
		if (this.formElements[type]) {
			throw new Error('(FormValidator.addFormElement): form element with type "' + type + '" is already registered as a Form Element type');
		} else {
			this.formElements[type] = object;
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
			console.log(this.messages, this.defaults.errorType);
			message = this.messages[ this.defaults.errorType ];
		}

		return messageTemplate( message );
	};

	// http://jqueryvalidation.org/jQuery.validator.setDefaults/
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
		this.$form.attr( "novalidate", "novalidate" );

		// Add aria rules for screen readers
		this.$form.find("[required]").attr("aria-required", "true");

		// Load all fields
		this.$formElements = this.findElements();

		// Load events
		this.loadEvents();
	};

	/**
	 * Init all form elements
	 */
	FormValidator.prototype.findElements = function() {
		return this.$form.find( this.settings.formElementDataSelector).formElement();
	};

	/**
	 * Inits all the events on the elements
	 */
	FormValidator.prototype.loadEvents = function() {
		var _this = this;

		// Form submit
		this.$form.on('submit', function (e) {
			console.log('(FormValidator.loadEvents): form submit', _this);

			if (_this.settings.debug && window.console) {
				console.info('Validating form: ', _this.$form);
			}

			var errors = [];

			// Fire the validate method on our form elements
			_this.$formElements.formElement('validate', {
				eventType: 'formSubmit'
			}, function () {
				if ( ! this.isValid) errors.push(this);
			});

			if (errors.length > 0) {
				// show top message
				return false;
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


	FormElement.defaults = {
		debug: true,
		rowErrorClass: "flt-form__row-error",
		rowValidClass: "flt-form__row-valid",
		messageContainerClass: 'flt-form__messages'
	};

	/**
	 * Form Element
	 * @constructor
	 * @param {object} element - The HTML form element
	 * @param {object} options - An option map
	 */
	function FormElement (element, options) {
		this.$element = $(element);

		var elementType = this.$element.data('form-element');

		// If the implemntation exists for the element type
		if ( FormValidator.formElements[elementType] ) {
			this.adapter = FormValidator.formElements[elementType];
		} else {
			throw new Error('(FormElement): elementType of "' + elementType + '" is not supported');
		}

		// Extend the defaults with the passed options and the Form
		this.settings = $.extend( true, {}, FormElement.defaults, options);

		// Get the input of this form element
		this.$input = this.$element.find('input');

		// Get the message container
		this.$messageContainer = this.$element.find('.' + this.settings.messageContainerClass);

		this.errors = [];

		// Initial valid state
		this.isValid = false;

		this.init();
	}

	FormElement.prototype.getValue = function () {
		var _this = this;
		// Proxy for getValue
		return this.adapter.getValue.apply(_this);
	};

	FormElement.prototype.init = function () {
		var _this = this;
		// load events
		this.adapter.loadEvents.apply(_this);
	};

	/**
	 * @param {string} errorType - required etc.
	 */
	FormElement.prototype.placeError = function (errorType) {
		this.placeMessage( FormValidator.createMessage(errorType, 'error') );
	};

	/**
	 * @param {string} message - html of the message
	 */
	FormElement.prototype.placeMessage = function (message) {
		if (this.settings.debug) {
			console.log('(FormElement.placeMessage)(debug): ' + message);
		}
		this.$messageContainer.html(message);
	};

	FormElement.prototype.removeMessages = function () {
		this.$messageContainer.empty();
	};

	/**
	 * @param {object} errorStack - { 'errorName' : bool }
	 */
	FormElement.prototype._checkErrors = function (errorStack) {
		return $.map(errorStack, function (obj) {
			for (var key in obj) {
				if ( ! obj[key]) return key;
			}
		});
	};

	FormElement.prototype.setValidState = function () {
		this.removeMessages();

		this.$element
			.addClass( this.settings.rowValidClass )
			.removeClass( this.settings.rowErrorClass );
	};

	FormElement.prototype.setErrorState = function () {
		this.$element
			.addClass( this.settings.rowErrorClass )
			.removeClass( this.settings.rowValidClass );
	};

	FormElement.prototype.setNeutralState = function () {
		this.removeMessages();

		this.$element
			.removeClass( this.settings.rowErrorClass )
			.removeClass( this.settings.rowValidClass );
	};

	/**
	 *  @param {object} options - { eventType: string, placeErrorsWhenInvalid: array }
	 */
	FormElement.prototype.validate = function (options, callback) {
		var _this = this;

		// Get the error stack from the validation method
		var errorStack = this.adapter.validation.apply(_this, [this.adapter.getValue.apply(_this)] );

		// Turn map into array
		var errors = this._checkErrors(errorStack);

		if (this.settings.debug) {
			console.log('(FormElement.validate)(debug): options: ', options, ' errors: ', errors);
		}

		if ( errors.length > 0) {
			// Change state only on validate
			this.isValid = false;

			// There are errors, neutralize first
			this.setNeutralState();

			if ($.inArray(errors[0], options.placeErrorsWhenInvalid) > -1 || options.eventType === 'formSubmit' ) {
				// Place the error only when the first error in the stack triggers the error

				if (this.settings.debug) {
					console.log('(FormElement.validate)(debug): Place errors because errors[0] "' + errors[0] + '" is in options.placeErrorsWhenInvalid: ', options.placeErrorsWhenInvalid);
				}

				this.setErrorState();

				// Place only the most relevant error, first on the stack
				this.placeError( errors[0] );
			}

		} else {
			// Change state only on validate
			this.isValid = true;

			// The form element is valid
			this.setValidState();
		}

		if (callback && typeof callback === 'function') callback.apply(this);
	};

	/**
	 * jQuery plugin wrapper for form elements
	 */
	$.fn.formElement = function (options) {
		var args = arguments;
		// Check the type of the options var
		if (options === undefined || typeof options === 'object') {
			// If no options are passed, or the options var is an object
			// it means that this is a 'normal' validator call
			return this.each(function () {
				// Check if this element already has a validator class loaded
				if ( ! $.data(this, 'formElement')) {
					// If not, create the class and save it to the element
					$.data(this, 'formElement', new FormElement( this, options ));
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