/*
 *  Form validation tests (additional)
 *  ------------------------------------------------------
 *  Project: float.form-validate.js
 *  Description: A plugin that can validate form fields
 *  Author: Aan Zee (frontend@aanzee.nl)
 *  GitHub: https://github.com/AanZee/validate
 *  Version: 0.0.1
 *  License: MIT
 */

;(function ( $, window, undefined) {


	$.FormValidator.addTest('phoneNL', function(value) {
		return /^((\+|00(\s|\s?\-\s?)?)31(\s|\s?\-\s?)?(\(0\)[\-\s]?)?|0)[1-9]((\s|\s?\-\s?)?[0-9]){8}$/.test(value);
	});

	$.FormValidator.addTest('postalcodeNL', function(value, element) {
		return this.optional(element) || /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
	});

}(jQuery, window));