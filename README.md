Float Form Validator
========

This plugin can be used to validate forms and is part of Aan Zee's [Float Frontend Library](https://github.com/AanZee/Float)

## Basic repo

Step 1. Clone or download the repo.

Step 2. Include all the script tags in your HTML
```
<script src="../js/form-validate.js"></script>
<script src="../js/form-tests.js"></script>
<script src="../js/form-element-types.js"></script>
```

Step 3. Call the Form validator on your form tag

```
$('.flt-form').formValidate();
```

## Form elements
At the core of the validator are form elements, small components in JS which explain the behaviour of input fields, but not limited to input elements alone. The `FormValidator` finds all the form elements within a form. Form elements can be found in `js/form-element-types.js`.

The default selector for form elements is `[data-form-element-type]`, note that without this selector the `FormValidator` class does nothing to validate your input fiels. In addition, form elements are for now always rows `flt-form__row` and not the actual input field. An advantage of this is the fact you don't necessarily have to use input fields. Another advantage is that within a form element, more than just an input field can be managed such as error messages and classnames.

### Form Element 'text' adapter example
Form elements are implemented by adapters which extend the FormElement class.

```
$.FormValidator.addFormElement('text', {

	/**
	 * Default getValue method
	 * only here as an example
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
				eventType: 'change'
			});
		});
	}
});
```
Form elements need to be registered to the FormValidator with the `addFormElement` method. Under the hood is your object literal used to extend the `FormElement` class. You can only register one adapter under the same name. In the example above the `getValue` method is implemented with the default method.

## Form Element properties guidelines
The default Form element class keeps a couple of guidelines to structure form element. The most interesting properties you can access on the `this` keyword are:

Property | Type | Description
--- | --- | ---
this.element | element | reference to the form element, not the input field
this.$element | jQuery element | to the form element, not the input field
this.$input | jQuery element | set by default to `this.$element.find('input')`
this.$messageContainer | jQuery element | container in which to place messages such as errors

## Form Element methods
Implementing Form element adapters is quite easy, for most use cases you can implement form elements with only a couple of methods.

### Basic most important methods

Method | Arguments | Return type | Description
--- | --- | --- | ---
getValue | none | value {any} | Gets the desired value from you input field(s) or other element(s)
validation | value `any` | Error stack `array` | Takes the value by getValue and checks this value agains validation methods
loadEvents | none | this | Apply events to your input elements, and call `this.validate`

## Validation method in depth
The validation method is at the core of the `FormElement` adapter, every adapter should implement this method. To understand how this method should work, check out the e-mail example.

```
$.FormValidator.addFormElement('email', {
	/**
	 * @param {any} value - returned from getValue method above
	 */
	validation: function (value) {
		// Support HTML5 properties
		var minlength = this.$input.prop('minlength');
		var maxlength = this.$input.prop('maxlength');

		// Build the error stack array
		return [
			{ 'required': $.FormValidator.methods.required(value) },
			{ 'email': $.FormValidator.methods.email(value) }
		];
	},

	// Code ommitted...
});
```

### Building an error stack
A powerful feature is the error stack, which is a list of tests the value should pass. These tests might be form validator methods, or custom functions/expression. The checkbox validation is as simple as:

```
validation: function (value) {
	// value might be true/false
	return [
		{ 'required': !! value }
	];
}
```

The key of the tests such as `required` or `email` are error types which map to an error message. When a form submit is done and the checkbox does not pass the required test, the error message will render *"This field is required"* respectively. When multiple tests do not pass, only the first error in the stack will ever render the message, no multiple messages will render — `required` before `email` in the e-mail example.

### FormValidator.tests - validation tests

Seperate from the form element adapters are validaiton tests, which could be used outside of the scope of form elements. These are simple functions returning a `boolean`, and accepting the value (or possibly more) as an argument. The inbuild validation method for a number is:

```
// ...
number: function (value) {
	return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( value );
}
// ...
```

Inbuild support for: `required`, `length`, `email`, `number`

#### Adding custom form validator tests

Besides the the inbuild validation tests, it's easy to add additional tests by using the `addTest` method:

```
$.FormValidator.addTest("postalcodeNL", function(value, element) {
	return this.optional(element) || /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(value);
});
```

### Advanced methods

Method | Arguments | Return type | Description
--- | --- | --- | ---
setValidState | none | `this` | Sets the valid state on a form element, only visual (includes removal of messages)
setErrorState | none | `this` | Sets the error state on a form element, only visual
setNeutralState | none | `this` | Removes all state of a form element, only visual (includes removal of messages)
initInput | none | `this` | Initializer for `this.$input` by default
initMessages | none | `this` | Initializer for `this.$messageContainer` by default
placeMessage | message `string` | `this` | Puts a string in the message container by default
placeError | errorType `string` | `this` | Creates the error and calls `placeMessage` by default
removeMessages | none | `this` | Clears the message container
_checkErrors | errorStack `object` | errors {array} | Puts errors which are true and pushes them to an array. Be careful implementing this method.
validate | options `object`, callback {function} | `this` | Main validate method which sets `this.isValid` state and valid/neutral/error state. Be careful implementing this method
init | element `element`, options `object` | `this` | Constructor of the FormElement. Be careful implementing this method




