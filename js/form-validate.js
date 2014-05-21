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
		messages: {},
		groups: {},
		rules: {},
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		rowClass: "flt-form__row",

		// Used if the chosen message type is not supported
		messageType: "note",

		// Used if the chosen error is not supported
		errorType: "generic"
	};


	FormValidator.messages = {
		generic: "An error occurred",
		required: "This field is required",
		email: "This is not a (correct) email address"
	};

	FormValidator.messageTemplates = {
		error: function (text) {
			return '<div class="flt-form__error-box"><p class="flt-form__error-message">' + text + '</p></div>';
		}
	};

	FormValidator.methods = {
		/**
		 * Checks for empty values
		 * @param {string} value
		 */
		required: function(value) {
			return $.trim(value).length > 0;
		},

		/**
		 * Checks if length of value is correct
		 * @param {string} value
		 * @param {int} minlength
		 * @param {int} maxlength
		 */
		length: function (value, minlength, maxlength) {
			if (typeof minlength === "number" && value.length < minlength) { return false; }
			if (typeof maxlength === "number" && value.length > maxlength) { return false; }

			return true;
		}
	};

	FormValidator.formElements = {};


	/**
	 * Text
	 * ------------------------------------------------------
	 * Simple text input fields inside a form element
	 * this.$input is the text input
	 */
	FormValidator.formElements['text'] = {
		getValue: function () {
			debugger
			return this.$input.val();
		},
		/**
		 * @param {any} value - returned from getValue method above
		 */
		validation: function (value) {
			var minlength = this.$input.prop('minlength');
			var maxlength = this.$input.prop('maxlength');

			// Required and length
			return [
				{ 'required': FormValidator.methods.required(value) },
				{ 'length': FormValidator.methods.length(value, minlength, maxlength) }
			];
		},
		loadEvents: function () {
			var _this = this;

			this.$input.on('change', function () {
				_this.validate({ eventType: 'change', placeErrors: false });
			});

			this.$input.on('blur', function () {
				_this.validate({ eventType: 'blur', placeErrors: true });
			});
		}
	};


	// http://jqueryvalidation.org/jQuery.validator.setDefaults/
	FormValidator.setDefaults = function( settings ) {
		$.extend( FormValidator.defaults, settings );
	};


	/**
	 * Initializer
	 */
	FormValidator.prototype.init = function () {

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
	 * Static method
	 */
	FormValidator.createMessage = function (errorType, messageType) {

		// Get the message template with the messageType given or revert to the default
		var messageTemplate = this.messageTemplates[messageType] || this.messageTemplates[ this.settings.messageType ];

		var message = this.messages[errorType] || this.messages[ this.settings.errorType ];

		return messageTemplate( message );
	};

	/**
	 * Inits all the elements
	 */
	FormValidator.prototype.findElements = function() {
		var _this = this;
		var foundNames = {};

		return this.$form.find('.flt-form__element').formElement();

		// return this.$form.find('input, select, textarea')
		// 			.not(":submit, :reset, :image, [disabled]")
		// 			.filter(function() {
		// 				// Check if the element has a name, if not, log an error
		// 				if (!this.name && _this.settings.debug && window.console ) {
		// 					console.error( "The form element %o has no name assigned", this);
		// 				}

		// 				// select only the first element for each name, and only those with rules specified
		// 				if ( foundNames[this.name] ) {
		// 					return false;
		// 				}

		// 				// If the name didn't exist in the found names, add it to the obj
		// 				foundNames[this.name] = $(this);
		// 				return true;
		// 			});
	};


	/**
	 * Inits all the events on the elements
	 */
	FormValidator.prototype.loadEvents = function() {
		var _this = this;

		// Form submit
		this.$form.on('submit', function (e) {
			if (_this.settings.debug && window.console) {
				console.info('Validating form: ', _this.$form);
			}

			// Fire the validate method on our form elements
			_this.$formElements.formElement('validate', {
				eventType: 'formSubmit'
			});


			// // remove errors
			// $('.flt-form__error-box').remove()
			// $('.flt-form__fieldset-error').removeClass('flt-form__fieldset-error');

			// for(var i=0; i < _this.elements.length; i++) {
			// 	// $(_this.elements[i]).val(_this.settings.messages.required);
			// 	var $element = $(_this.elements[i]);
			// 	var $formRow = $element.closest('.' + _this.settings.rowClass);
			// 	var $errorElement = $formRow.find('[data-error-placement]');

			// 	var errorElement = $errorElement.attr('data-error-placement');
			// 	var formRowError = $formRow.attr('data-error-placement');

			// 	if ($element.hasClass('flt-form__input-validate')) {

			// 		if (typeof formRowError !== 'undefined' && formRowError !== false ) {
			// 			_this.setErrors($formRow, formRowError);
			// 		} else {
			// 			_this.setErrors($errorElement, errorElement);
			// 		}

			// 	}
			// }

			return false;
		});

	};


	FormValidator.prototype.setErrors = function($element, insert) {
		var _this = this;
		var $error = $('<div class="flt-form__error-box"><p class="flt-form__error-message">' + _this.settings.messages.required + '</p></div>');

		$element.closest('.flt-form__fieldset').addClass('flt-form__fieldset-error');

		switch(insert) {
			case 'append':
				$element.append($error);
				break;
			case 'after':
				$element.after($error);
				break;
			case 'before':
				$element.before($error);
				break;
			default:
				$element.prepend($error);
		}

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
	$.validator = FormValidator;


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
			this.typeMethods = FormValidator.formElements[elementType];
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

		this.init();
	}

	FormElement.prototype.getValue = function () {
		var _this = this;
		return this.typeMethods.getValue.apply(_this);
	};

	FormElement.prototype.init = function () {
		var _this = this;
		// load events
		this.typeMethods.loadEvents.apply(_this);
	};

	/**
	 * @param {string} errorType - required etc.
	 */
	FormElement.prototype.placeError = function (errorType) {
		console.log(errorType);
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

	/**
	 * @param {object} errorStack - { 'errorName' : bool }
	 */
	FormElement.prototype._checkErrors = function (errorStack) {
		return $.map(errorStack, function (obj) {
			for (var key in obj) {
				console.log(key, ! obj[key]);
				if ( ! obj[key]) return key;
			}
		});
	};

	// @param {object} options - { eventType: string }
	FormElement.prototype.validate = function (options) {
		var _this = this;

		if (this.settings.debug) {
			console.log('(FormElement.validate)(debug): ', options);
		}

		var errorStack = this.typeMethods.validation.apply(_this, [this.typeMethods.getValue.apply(_this)] );

		// Turn map into array
		var errors = this._checkErrors(errorStack);
		console.log(errors);

		if (errors.length > 0 && options.placeErrors) {
			this.placeError( errors[0] );
		}

	};

	FormElement.defaults = {
		debug: true,
		messageContainerClass: 'flt-form__messages'
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
				if (instance instanceof FormValidator && typeof instance[options] === 'function') {
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