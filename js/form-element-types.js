/*
 *  Form Element types
 *  ------------------------------------------------------
 *  Project: float.form-validate.js
 *  Description: Adapters which extend the functionality
 *  Author: Aan Zee (frontend@aanzee.nl)
 *  GitHub: https://github.com/AanZee/validate
 *  Version: 0.0.1
 *  License: MIT

 */

;(function ( $, window, undefined) {

	/**
	 * Text
	 * ------------------------------------------------------
	 * Simple text input fields inside a form element
	 * this.$input is the text input
	 */
	$.FormValidator.addFormElement('text', {

		/**
		 * @return value
		 */
		getValue: function () {
			return this.$input.val();
		},

		/**
		 * Not to confuse with validate
		 * @param {any} value - returned from getValue method above
		 */
		validation: function (value) {
			// Support HTML5 properties
			var minlength = this.$input.prop('minlength');
			var maxlength = this.$input.prop('maxlength');

			// Required and length
			return [
				{ 'required': $.FormValidator.tests.required(value) },
				{ 'length': $.FormValidator.tests.length(value, minlength, maxlength) }
			];
		},


		loadEvents: function () {
			var _this = this;

			this.$input.on('change keyup', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['required', 'length']
				});
			});
		}
	});

	/**
	 * Number
	 * ------------------------------------------------------
	 * Simple text input fields inside a form element
	 * this.$input is the text input
	 */
	$.FormValidator.addFormElement('number', {
		getValue: function () {
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
				{ 'required': $.FormValidator.tests.required(value) },
				{ 'number': $.FormValidator.tests.number(value) },
				{ 'length': $.FormValidator.tests.length(value, minlength, maxlength) }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('change keyup', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['required', 'length', 'number']
				});
			});
		}
	});

	/**
	 * Radio
	 * ------------------------------------------------------
	 */
	$.FormValidator.addFormElement('radio', {
		getValue: function () {
			return this.$input.filter(':checked').val();
		},

		/**
		 * @param {any} value - returned from getValue method above
		 */
		validation: function (value) {
			// Required and length
			return [
				{ 'required': $.FormValidator.tests.required(value) }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('change', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['required']
				});
			});
		}
	});

	/**
	 * Checkbox
	 * ------------------------------------------------------
	 */
	$.FormValidator.addFormElement('checkbox', {
		/**
		 * @return {bool} is checked
		 */
		getValue: function () {
			return this.$input.filter(':checked').length !== 0;
		},

		/**
		 * @param {any} value - returned from getValue method above
		 */
		validation: function (value) {
			// Required and length
			return [
				{ 'required': !! value }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('change', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['required']
				});
			});
		}
	});


	/**
	 * Email
	 * ------------------------------------------------------
	 */
	$.FormValidator.addFormElement('email', {
		/**
		 * @param {any} value - returned from getValue method above
		 */
		validation: function (value) {

			// Required and length
			return [
				{ 'required': $.FormValidator.tests.required(value) },
				{ 'email': $.FormValidator.tests.email(value) }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('change keyup', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['required', 'email']
				});
			});
		}
	});


	/**
	 *
	 */
	$.FormValidator.addFormElement('phoneNL', {
		/**
		 * @param {any} value - returned from getValue method above
		 */
		validation: function (value) {
			// Support HTML5 properties
			var minlength = this.$input.prop('minlength');
			var maxlength = this.$input.prop('maxlength');

			// Required and length
			return [
				{ 'required': $.FormValidator.tests.required(value) },
				{ 'length': $.FormValidator.tests.length(value, minlength, maxlength) }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('change keyup', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['required']
				});
			});
		}
	});


}(jQuery, window));