sap.ui.define([], function () {

    function dateFormat(date) {

        var timeDay = 24 * 60 * 60 * 1000;

        if (date) {

            var dateNow = new Date();
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "yyyy/MM/dd"});
            var dateNowformat = new Date(dateFormat.format(dateNow));
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            //var oResourceBundle = this.getView().getmodel("i18n").getResourceBundle();

            switch(true) {
                case date.getTime() === dateNowformat.getTime():
                    return oResourceBundle.getText("today");

                case date.getTime() === dateNowformat.getTime() + timeDay:
                    return oResourceBundle.getText("tomorrow");

                case date.getTime() === dateNowformat.getTime() - timeDay:
                    return oResourceBundle.getText("yesterday");
                    
                default:
                    return "";
            }
        }

    }

    return {
            dateFormat : dateFormat
    };

});