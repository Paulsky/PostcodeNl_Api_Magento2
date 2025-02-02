define([
    'ko',
    'Magento_Ui/js/lib/knockout/template/renderer',
    'Flekto_Postcode/js/lib/postcode-eu-autocomplete-address',
], function (ko, renderer, AutocompleteAddress) {
    'use strict';

    ko.bindingHandlers.initIntlAutocomplete = {
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            if (viewModel.intlAutocompleteInstance !== null || !ko.unwrap(valueAccessor())) {
                return; // Autocomplete instance already created or element not visible.
            }

            viewModel.intlAutocompleteInstance = new AutocompleteAddress(element, {
                autocompleteUrl: viewModel.settings.base_url + 'postcode-eu/V1/international/autocomplete',
                addressDetailsUrl: viewModel.settings.base_url + 'postcode-eu/V1/international/address',
                context: viewModel.countryCode || 'NL',
                autoFocus: true,
            });

            element.addEventListener('autocomplete-select', function (e) {
                if (e.detail.precision === 'Address') {
                    viewModel.loading(true);

                    viewModel.intlAutocompleteInstance.getDetails(e.detail.context, function (result) {
                        viewModel.address(result[0]);
                        viewModel.toggleFields(true);
                        viewModel.loading(false);
                        viewModel.validate();
                    });
                }
            });

            element.addEventListener('autocomplete-error', function (e) {
                console.error('Autocomplete XHR error', e);
                viewModel.toggleFields(true);
                viewModel.loading(false);
                viewModel.error($t('An error has occurred while retrieving address data. Please contact us if the problem persists.'));
            });

            // Clear the previous values when searching for a new address.
            element.addEventListener('autocomplete-search', viewModel.resetInputAddress.bind(viewModel));
        }
    };

    renderer.addAttribute('initIntlAutocomplete');

});
