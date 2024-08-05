sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, History, MessageBox, Filter, FilterOperator) {
    "use strict";

    function _onObjectMarched(oEvent) {
      this.onClearSignature();

      this.getView().bindElement({
        path: "/Orders(" + oEvent.getParameter("arguments").OrderID + ")",
        model: "odataNorthwind",
        events: {
          dataReceived: function (odata) {
            _readSignature.bind(this)(odata.getParameter("data").OrderID, odata.getParameter("data").EmployeeID);
          }
        }
      });

      const objContext = this.getView().getModel("odataNorthwind").getContext("/Orders("
        + oEvent.getParameter("arguments").OrderID + ")").getObject();

      if (objContext) {
        _readSignature.bind(this)(objContext.OrderID, objContext.EmployeeID);
      }
    };

    function _readSignature(orderId, employeeId) {
      //Read Signature Image
      this.getView().getModel("incidenceModel").read("/SignatureSet(OrderId='" + orderId
        + "',SapId='" + this.getOwnerComponent().SapId
        + "',EmployeeId='" + employeeId + "')", {
        success: function (data) {
          const signature = this.getView().byId("signature");

          if (data.MediaContent !== "") {
            signature.setSignature("data:image/png;base64," + data.MediaContent);
          }
        }.bind(this),
        error: function (data) {

        }
      });

      //Bind Files
      let SapIdValue = this.getOwnerComponent().SapId;

      this.byId("uploadCollection").bindAggregation("items", {
        path: "incidenceModel>/FilesSet",
        filters: [
          new Filter("OrderId", FilterOperator.EQ, orderId),
          new Filter("SapId", FilterOperator.EQ, SapIdValue),
          new Filter("EmployeeId", FilterOperator.EQ, employeeId),
        ],
        template: new sap.m.UploadCollectionItem({
          documentId: "{incidenceModel>AttId}",
          visibleEdit: false,
          fileName: "{incidenceModel>FileName}"
        }).attachPress(this.downloadFile)
      });
    };


    return Controller.extend("logaligroup.employee.controller.OrderDetails", {
      onInit: function () {

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("RouteOrderDetails").attachPatternMatched(_onObjectMarched, this);
      },

      onBack: function (oEvent) {

        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) { //Se ha llegado a traves del inicio en index.html
          window.history.go(-1);
        } else { //Se ha llegado directamente por una URL sin el index.html
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("RouteMain", true);
        }
      },

      onClearSignature: function () {
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
                contentLeft: new sap.m.Label({ text: "{odataNorthwind>/Products(" + contextObj.ProductID + ")/ProductName} ({odataNorthwind>Quantity})" }),
                contentMiddle: new sap.m.ObjectStatus({ text: "{i18n>availableStock} {odataNorthwind>/Products(" + contextObj.ProductID + ")/UnitsInStock}", state: "Error" }),
                contentRight: new sap.m.Label({ text: "{parts: [ {path : 'odataNorthwind>UnitPrice'}, {path : 'odataNorthwind>Currency'}], type:'sap.ui.model.type.Currency'}" })
              })
            ]
          });
          return customListItem;
        }
      },

      onSaveSignature: function (oEvent) {

        const signature = this.byId("signature");
        const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
        let signaturePng;

        if (!signature.isFill()) {
          MessageBox.error(oResourceBundle.getText("fillSignature"));
        } else {
          signaturePng = signature.getSignature().replace("data:image/png;base64,", "");
          let oOrder = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
          let body = {
            OrderId: oOrder.OrderID.toString(),
            SapId: this.getOwnerComponent().SapId,
            EmployeeId: oOrder.EmployeeID.toString(),
            MimeType: "image/png",
            MediaContent: signaturePng
          };

          this.getView().getModel("incidenceModel").create("/SignatureSet", body, {
            success: function () {
              MessageBox.information(oResourceBundle.getText("signatureSaved"));
            },
            error: function () {
              MessageBox.information(oResourceBundle.getText("signatureNotSaved"));
            }
          })

        };

      },

      onFileBeforeUpload: function (oEvent) {

        let fileName = oEvent.getParameter("fileName");
        let objContext = oEvent.getSource().getBindingContext("odataNorthwind").getObject();
        let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
          name: "slug",
          value: objContext.OrderID + ";" + this.getOwnerComponent().SapId + ";" + objContext.EmployeeID + ";" + fileName
        });

        oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

      },

      onFileChange: function (oEvent) {

        let oUploadCollection = oEvent.getSource();

        //Header Token CRSF
        let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
          name: "x-csrf-token",
          value: this.getView().getModel("incidenceModel").getSecurityToken()
        });

        oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
      },

      onFileUploadComplete: function (oEvent) {

        oEvent.getSource().getBinding("items").refresh();

      },

      onFileDeleted: function (oEvent) {

        var oUploadCollection = oEvent.getSource();
        var sPath = oEvent.getParameter("item").getBindingContext("incidenceModel").getPath();

        this.getView().getModel("incidenceModel").remove(sPath, {
          success: function () {
            oUploadCollection.getBinding("items").refresh();
          },
          error: function () {

          }
        });
      },

      downloadFile: function(oEvent) {
        const sPath = oEvent.getSource().getBindingContext("incidenceModel").getPath();
        window.open("/sap/opu/odata/sap/YSAPUI5_SRV_01" + sPath + "/$value");

      }
    });
  });