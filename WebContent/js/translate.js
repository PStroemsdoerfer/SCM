$(document).ready(function() {
    $("#de").click(function() {
		window.localStorage.setItem("language", "de");
        i18n.setLng('de', function(t) {});
        i18n.init(function(t) {
            // translate nav
            $("body").i18n();
            $("#verweise").i18n();
            // programatical access
            var appName = t("app.name");
        });
    });

    $("#en").click(function() {
		window.localStorage.setItem("language", "en");
        i18n.setLng('en', function(t) {});
        i18n.init(function(t) {
            // translate nav
            $("body").i18n();
            // programatical access
            var appName = t("app.name");
        });
    });

});

i18n.setLng(!window.localStorage.language ? "de" : window.localStorage.language, function(t) {});
i18n.init(function(t) {
    // translate nav
    $("body").i18n();

    // programatical access
    var appName = t("app.name");
});