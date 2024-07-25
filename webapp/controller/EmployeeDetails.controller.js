// @ts-nocheck
sap.ui.define([
    //"sap/ui/core/mvc/Controller",
    "logaligroup/employee/controller/Base.controller",
    "logaligroup/employee/model/formatter",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof logaligroup.employee.controller} Base
     */

    function (Base, formatter, MessageBox) {

        function onInit() {
            this._bus = sap.ui.getCore().getEventBus();
        };

        function onCreateIncidence() {

            var tableIncidence = this.getView().byId("tableIncidence");
            var newIncidence = sap.ui.xmlfragment("logaligroup.employee.fragment.NewIncidence", this);
            var incidenceModel = this.getView().getModel("incidenceModel");
            var odata = incidenceModel.getData();
            var index = odata.length;

            odata.push({ index: index + 1, _ValidateDate: false, EnabledSave: false });
            incidenceModel.refresh();

            newIncidence.bindElement("incidenceModel>/" + index);
            tableIncidence.addContent(newIncidence);
        };

        function onSaveIncidence(oEvent) {

            var incidence = oEvent.getSource().getParent().getParent();
            var incidenceRow = incidence.getBindingContext("incidenceModel");
            //var temp = incidenceRow.sPath.replace('/','');
            this._bus.publish("incidence", "onSaveIncidence", { incidenceRow: incidenceRow.sPath.replace('/', '') });
        };

        function onDeleteIncidence(oEvent) {

            var contextObj = oEvent.getSource().getBindingContext("incidenceModel").getObject();

            MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("confirmDeleteIncidence"), {

                onClose: function (oAction) {
                    if (oAction === 'OK') {
                        this._bus.publish("incidence", "onDeleteIncidence", {
                            IncidenceId: contextObj.IncidenceId,
                            SapId: contextObj.SapId,
                            EmployeeId: contextObj.EmployeeId
                        });
                    }
                }.bind(this)
            });
        };

        function updateIncidenceCreationDate(oEvent) {

            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObj = context.getObject();
            let oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            if (!oEvent.getSource().isValidValue()) { //.getValue() da el valor
                contextObj._ValidateDate = false;
                contextObj.CreationDateState = "Error";
                MessageBox.error(oResourceBundle.getText("errorCreationDateValue"), {
                    title: "Error",
                    onClose: null,
                    styleclass: null,
                    actions: MessageBox.Action.Close,
                    emphasizedAction: null,
                    initialFocus: null,
                    textDirection: sap.ui.core.TextDirection.Inherit
                });
            } else {
                contextObj.CreationDateX = true;
                contextObj._ValidateDate = true;
                contextObj.CreationDateState = "None";
            };

            if (oEvent.getSource().isValidValue() && contextObj.Reason) {
                contextObj.EnabledSave = true;
            } else {
                contextObj.EnabledSave = false;
            }
            context.getModel().refresh();
        };

        function updateIncidenceReason(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObj = context.getObject();

            if (oEvent.getSource().getValue()) {
                contextObj.ReasonX = true;
                contextObj.ReasonState = "None";
            } else {
                contextObj.ReasonState = "Error";
            };

            if (contextObj._ValidateDate && oEvent.getSource().getValue()) {
                contextObj.EnabledSave = true;
            } else {
                contextObj.EnabledSave = false;
            }

            context.getModel().refresh();
        };

        function updateIncidenceType(oEvent) {
            let context = oEvent.getSource().getBindingContext("incidenceModel");
            let contextObj = context.getObject();

            if (contextObj._ValidateDate && contextObj.Reason) {
                contextObj.EnabledSave = true;
            } else {
                contextObj.EnabledSave = false;
            }

            contextObj.TypeX = true;
            context.getModel().refresh();
        };
        var EmployeeDetails = Base.extend("logaligroup.employee.controller.EmployeeDetails", {});

        EmployeeDetails.prototype.onInit = onInit;
        EmployeeDetails.prototype.onCreateIncidence = onCreateIncidence;
        EmployeeDetails.prototype.Formatter = formatter;
        EmployeeDetails.prototype.onDeleteIncidence = onDeleteIncidence;
        EmployeeDetails.prototype.onSaveIncidence = onSaveIncidence;
        EmployeeDetails.prototype.updateIncidenceCreationDate = updateIncidenceCreationDate;
        EmployeeDetails.prototype.updateIncidenceReason = updateIncidenceReason;
        EmployeeDetails.prototype.updateIncidenceType = updateIncidenceType;
        EmployeeDetails.prototype.onDeleteIncidence = onDeleteIncidence;
        return EmployeeDetails;
    }
);
