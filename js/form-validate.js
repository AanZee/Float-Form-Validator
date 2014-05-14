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
        this.elements = [];

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
        rowClass: "flt-form__row"
    };


    FormValidator.messages = {
    	required: "This field is required",
    	email: "This is not a (correct) email address"
    };


    FormValidator.methods = {
    	/**
    	 * Checks for empty values
    	 * @param {string} value 
    	 */
    	required: function(value) {
    		return $.trim(value).length > 0;
    	}
    }


    // http://jqueryvalidation.org/jQuery.validator.setDefaults/
    FormValidator.setDefaults = function( settings ) {
    	$.extend( FormValidator.defaults, settings );
    };


    /**
     * Initializer
     */
    FormValidator.prototype.init = function () {

        //Add novalidate if HTML5
        this.$form.attr( "novalidate", "novalidate" );

        // Add aria rules for screen readers
        this.$form.find("[required]").attr("aria-required", "true");

        // Load all fields
        this.elements = this.findElements();

        // Load events
        this.loadEvents();
    };


    /**
     * Inits all the elements
     */
    FormValidator.prototype.findElements = function() {
    	var _this = this;
    	var foundNames = {};

    	return  this.$form.find('input, select, textarea')
					.not(":submit, :reset, :image, [disabled]")
					.filter(function() {
						// Check if the element has a name, if not, log an error
						if (!this.name && _this.settings.debug && window.console ) {
							console.error( "The form element %o has no name assigned", this);
						}

						// select only the first element for each name, and only those with rules specified
						if ( foundNames[this.name] ) {
							return false;
						}

						// If the name didn't exist in the found names, add it to the obj
						foundNames[this.name] = $(this);
						return true;
					});
    };


    /**
     * Inits all the events on the elements
     */
    FormValidator.prototype.loadEvents = function() {
    	var _this = this;

        // Form submit
        this.$form.on('submit', function(e) {
        	if(_this.settings.debug && window.console) {
        		console.info('Validating form: ', _this.$form);
        	}

        	for(var i=0; i < _this.elements.length; i++) {
        		// $(_this.elements[i]).val(_this.settings.messages.required);
                var $element = $(_this.elements[i]);
                var $formRow = $element.closest('.' + _this.settings.rowClass);
                var $errorElement = $formRow.find('[data-error-placement]');

                var errorElement = $errorElement.attr('data-error-placement');
                var formRowError = $formRow.attr('data-error-placement');

                if (typeof formRowError !== 'undefined' && formRowError !== false ) {
                    _this.setErrors($formRow, formRowError);
                } else {
                    _this.setErrors($errorElement, errorElement);
                }
        	}
        });

    };


    FormValidator.prototype.setErrors = function($element, insert) {
        var _this = this;
        var $error = $('<p class="flt-form__error-message">' + _this.settings.messages.required + '</p>')
        
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

}(jQuery, window));