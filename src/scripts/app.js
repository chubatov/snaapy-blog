;(function ($) {
    'use strict';

    $(function () {
        var langs = { true: 'ENG', false: 'عربي' };
        var $switcher = $('[name="lang-switcher"]');
        var activeLang = $switcher.data('active-lang') === 'en';
        var language;

        $switcher.bootstrapSwitch({
            inverse: true,
            state: !activeLang,
            labelText: langs[!activeLang],
            onText: langs[activeLang],
            offText: langs[activeLang],

            onSwitchChange: function(e) {
                e.preventDefault();
            }
        });
    });
})(jQuery);
