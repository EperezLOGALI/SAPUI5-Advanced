// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.Filter} Filter 
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */

    function (Controller) {
        return Controller.extend("logaligroup.employee.controller.Main", {

            onInit: function () {

                var oView = this.getView();
                //var i18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle(); //logaligroup.employee.i18n.i18n
    
                var oJSONModelEmpl = new sap.ui.model.json.JSONModel();
                oJSONModelEmpl.loadData("./localService/mockdata/Employees.json", false);
                oView.setModel(oJSONModelEmpl, "jsonEmployees");
    
                var oJSONModelCountries = new sap.ui.model.json.JSONModel();
                oJSONModelCountries.loadData("./localService/mockdata/Countries.json", false);
                oView.setModel(oJSONModelCountries, "jsonCountries");

                var oJSONModelLayout = new sap.ui.model.json.JSONModel();
                oJSONModelLayout.loadData("./localService/mockdata/Layout.json", false);
                oView.setModel(oJSONModelLayout, "jsonLayout");
    
                var oJSONModelConfig = new sap.ui.model.json.JSONModel({
                    visibleID: true,
                    visibleName: true,
                    visibleCountry: true,
                    visibleCity: false,
                    vBtnShowCity: true,
                    vBtnHideCity: false,
                });
    
                oView.setModel(oJSONModelConfig, "jsonConfig");
                
                this._bus = sap.ui.getCore().getEventBus();

                this._bus.subscribe("flexible", "showEmployee", this.showEmployeeDetails, this);
            },

            showEmployeeDetails: function(category, nameEvent, path) {

                var detailView = this.getView().byId("detailEmployeeView");
                detailView.bindElement("jsonEmployees>" + path);

                this.getView().getModel("jsonLayout").setProperty("/ActiveKey", "TwoColumnsMidExpanded");

                var incidenceModel = new sap.ui.model.json.JSONModel([]);
                detailView.setModel(incidenceModel, "incidenceModel");
                detailView.byId("tableIncidence").removeAllContent();
            }
        });

    });