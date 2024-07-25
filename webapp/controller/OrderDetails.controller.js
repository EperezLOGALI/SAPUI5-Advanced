sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
  ],
  function (Controller, History) {
    "use strict";

    function _onObjectMarched(oEvent) {

      this.getView().bindElement({
        path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
        model: "odataNorthwind"
      });
    }

    return Controller.extend("logaligroup.employee.controller.OrderDetails", {
      onInit: function () {

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMarched, this);
      },

      onBack: function (oEvent) {

        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteMain", true);
          window.history.go(-1);
        }
      },

      onClearSignature: function (oEvent) {
        var signature = this.byId("signature");
        signature.clear();
      },

      factoryOrderDetails: function (listId, oContext) {

        var contextObj = oContext.getObject();
        contextObj.Currency = "EUR";
        var unitsInStock = oContext.getModel().getProperty("/Products(" + contextObj.ProductID + ")/UnitsInStock");

        if (contextObj.Quantity <= unitsInStock) {
          var objectListItem = new sap.m.ObjectListItem({
            title: "{odataNorthwind>/Products(" + contextObj.ProductID + ")/ProductName} ({odataNorthwind>Quantity})",
            number: "{parts: [ {path : 'odataNorthwind>UnitPrice'}, {path : 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency', formatOptions: {showMeasure: false}}",
            numberUnit: "{odataNorthwind>Currency}"
            });
          return objectListItem;

        } else {
          var customListItem = new sap.m.CustomListItem({
            content: [
               new sap.m.Bar({
                contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextObj.ProductID + ")/ProductName} ({odataNorthwind>Quantity})"}),
                contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObj.ProductID + ")/UnitsInStock}", state: "Error"}),
                contentRight: new sap.m.Label({ text:"{parts: [ {path : 'odataNorthwind>UnitPrice'}, {path : 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency'}"})
               })
            ]
          });
          return customListItem;
        }
      }
    });
});