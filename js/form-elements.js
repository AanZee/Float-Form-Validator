/*
 *  Form Element types
 *  ------------------------------------------------------
 *  Project: float.form-validate.js
 *  Description: A plugin that can validate form fields
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
		getValue: function () {
			return this.$input.val();
		},

		/**
		 * @param {any} value - returned from getValue method above
		 */
		validation: function (value) {
			// Support HTML5 properties
			var minlength = this.$input.prop('minlength');
			var maxlength = this.$input.prop('maxlength');

			// Required and length
			return [
				{ 'required': $.FormValidator.methods.required(value) },
				{ 'length': $.FormValidator.methods.length(value, minlength, maxlength) }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('keydown', function () {
				if ( ! _this.isValid) _this.setNeutralState();
			});

			this.$input.on('change', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['length']
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
				{ 'required': $.FormValidator.methods.required(value) },
				{ 'number': $.FormValidator.methods.number(value) },
				{ 'length': $.FormValidator.methods.length(value, minlength, maxlength) }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('keydown', function () {
				if ( ! _this.isValid) _this.setNeutralState();
			});

			this.$input.on('change', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['number', 'length']
				});
			});
		}
	});

	/**
	 * Radio
	 * ------------------------------------------------------
	 * Simple text input fields inside a form element
	 * this.$input is the text input
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
				{ 'required': $.FormValidator.methods.required(value) }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('change', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['number', 'length']
				});
			});
		}
	});


	/**
	 * Email
	 * ------------------------------------------------------
	 */
	$.FormValidator.addFormElement('email', {
		getValue: function () {
			return this.$input.val();
		},

		/**
		 * @param {any} value - returned from getValue method above
		 */
		validation: function (value) {
			// Support HTML5 properties
			var minlength = this.$input.prop('minlength');
			var maxlength = this.$input.prop('maxlength');

			// Required and length
			return [
				{ 'required': $.FormValidator.methods.required(value) },
				{ 'email': $.FormValidator.methods.email(value) }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('keydown', function () {
				if ( ! _this.isValid) _this.setNeutralState();
			});

			this.$input.on('change', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['email']
				});
			});
		}
	});


	/**
	 *
	 */
	$.FormValidator.addFormElement('phoneNL', {
		getValue: function () {
			return this.$input.val();
		},

		/**
		 * @param {any} value - returned from getValue method above
		 */
		validation: function (value) {
			// Support HTML5 properties
			var minlength = this.$input.prop('minlength');
			var maxlength = this.$input.prop('maxlength');

			// Required and length
			return [
				{ 'required': $.FormValidator.methods.required(value) },
				{ 'phoneNL': $.FormValidator.methods.email(value) }
			];
		},

		loadEvents: function () {
			var _this = this;

			this.$input.on('keydown', function () {
				if ( ! _this.isValid) _this.setNeutralState();
			});

			this.$input.on('change', function () {
				_this.validate({
					eventType: 'change',
					placeErrorsWhenInvalid: ['phoneNL']
				});
			});
		}
	});


}(jQuery, window));