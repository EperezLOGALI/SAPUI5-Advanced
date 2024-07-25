// @ts-nocheck
sap.ui.define([
    //"sap/ui/core/mvc/Controller",
    "logaligroup/employee/controller/Base.controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof logaligroup.employee.controller} Base
     * @param {typeof sap.ui.model.Filter} Filter 
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Base, Filter, FilterOperator) {
        "use strict";

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        }

        function onFilter() {

            var oJSONCountries = this.getView().getModel("jsonCountries").getData();
            var filters = [];

            if (oJSONCountries.EmployeeId !== "") {

                filters.push(new Filter("EmployeeID", FilterOperator.EQ, oJSONCountries.EmployeeId));
            }
            if (oJSONCountries.CountryKey !== "") {

                filters.push(new Filter("Country", FilterOperator.EQ, oJSONCountries.CountryKey));
            }

            var oList = this.getView().byId("tableEmployee");
            var oBinding = oList.getBinding("items");
            oBinding.filter(filters);

        }

        function onClearFilter() {

            var oModel = this.getView().getModel("jsonCountries");

            oModel.setProperty("/EmployeeId", "");
            oModel.setProperty("/CountryKey", "");
        }

        function showPostalCode(oEvent) {

            var itemPressed = oEvent.getSource();
            var oContext = itemPressed.getBindingContext("jsonEmployees");
            var objectContext = oContext.getObject();

            sap.m.MessageToast.show(objectContext.PostalCode);

        };

        function onShowCity() {
            var oJSONConfig = this.getView().getModel("jsonConfig");
            oJSONConfig.setProperty("/visibleCity", true);
            oJSONConfig.setProperty("/vBtnShowCity", false);
            oJSONConfig.setProperty("/vBtnHideCity", true);
        };

        function onHideCity() {
            var oJSONConfig = this.getView().getModel("jsonConfig");
            oJSONConfig.setProperty("/visibleCity", false);
            oJSONConfig.setProperty("/vBtnShowCity", true);
            oJSONConfig.setProperty("/vBtnHideCity", false);
        };

        function showOrders(oEvent) {

            //get selected controller
            var iconPressed = oEvent.getSource();
            //get context
            var oContext = iconPressed.getBindingContext("odataNorthwind");

            if (!this._oDialogOrders) {
                this._oDialogOrders = sap.ui.xmlfragment("logaligroup.employee.fragment.DialogOrders", this);
                this.getView().addDependent(this._oDialogOrders);
            };

            //Dialog binding to context to have accesss to selected data
            this._oDialogOrders.bindElement("odataNorthwind>" + oContext.getPath());
            this._oDialogOrders.open();
        };

        function onCloseOrders() {

            this._oDialogOrders.close();
        };

        function showEmployee(oEvent) {

            var path = oEvent.getSource().getBindingContext("odataNorthwind").getPath();
            this._bus.publish("flexible", "showEmployee", path);
        };

        var Main = Base.extend("logaligroup.employee.controller.MasterEmployee", {});

        //        return Controller.extend("logaligroup.employee.controller.MainView", {

        // Main.prototype.onValidate = function () {
        //     var inputEmployee = this.byId("inputEmployee");
        //     var valueEmployee = inputEmployee.getValue();

        //     if (valueEmployee.length === 6) {
        //         //inputEmployee.setDescription("OK");
        //         this.getView().byId("labelCountry").setVisible(true);
        //         this.getView().byId("slCountry").setVisible(true);
        //     } else {
        //         //inputEmployee.setDescription("Not OK");
        //         this.getView().byId("labelCountry").setVisible(false);
        //         this.getView().byId("slCountry").setVisible(false);
        //     }
        // };

        Main.prototype.onInit = onInit;
        Main.prototype.onFilter = onFilter;
        Main.prototype.onClearFilter = onClearFilter;
        Main.prototype.showPostalCode = showPostalCode;
        Main.prototype.onShowCity = onShowCity;
        Main.prototype.onHideCity = onHideCity;
        Main.prototype.showOrders = showOrders;
        Main.prototype.onCloseOrders = onCloseOrders;
        Main.prototype.showEmployee = showEmployee;
        return Main;
    });
