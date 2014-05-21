/*
 *  Form validation methods (additional)
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
	$.FormValidator.addMethod("phoneNL", function(value, element) {
		return /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test(value);
	});

}(jQuery, window));