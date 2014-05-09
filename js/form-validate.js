;(function($, undefined) {


	$.fn.formValidate = function(options) {


		var $forms = $(this);
		var htmlLang = $('html').attr('lang');
		var settings = $.extend({
			language: htmlLang || 'en'
		}, options );

		var languages = {
			en: {
				required: 'This is a required field'
			},
			nl: {
				required: 'Dit is een verplicht veld'
			},
			de: {
				required: 'Dies ist ein Pflichtfeld'
			}
		};

		var text = languages[settings.language];


		var formValidateController = {


			init: function() {

			},


			submitValidation: function($form) {

			}

			
		};


		$(document).ready( function() {
			formValidateController.init();
		});


		$forms.submit(function(e) {
			var $form = $(this);
			formValidateController.submitValidation($form);
		});


	};


}(jQuery));