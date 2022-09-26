sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/model/FilterOperator",
    "sap/m/GroupHeaderListItem",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "../model/formatter",
    "../library/XLSX",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, formatter, XLSXjs, Message, MessageBox, BusyIndicator, MessageToast) {
    "use strict";

    return BaseController.extend("autoconfigmasterdetail.controller.Master", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
        onInit: function () {
            // Control state model
            var oList = this.byId("list"),
                oViewModel = this._createViewModel(),
                // Put down master list's original value for busy indicator delay,
                // so it can be restored later on. Busy handling on the master list is
                // taken care of by the master list itself.
                iOriginalBusyDelay = oList.getBusyIndicatorDelay();


            this._oList = oList;
            this._selectedCellForVoice = '';
            // keeps the filter and search state
            this._oListFilterState = {
                aFilter: [],
                aSearch: []
            };

            this.setModel(oViewModel, "masterView");
            var transaction = this.getOwnerComponent().getModel("transaction");
            this.getView().setModel(transaction, "transaction");
            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            oList.attachEventOnce("updateFinished", function () {
                // Restore original busy indicator delay for the list
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            });

            this.getView().addEventDelegate({
                onBeforeFirstShow: function () {
                    this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
                }.bind(this)
            });

            this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
            this.getRouter().attachBypassed(this.onBypassed, this);
            
            var recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.lang = 'en-IN';
            this.recognition = recognition;

        },
        
        onAfterRendering: function(){
        	var masterArray = [];
	        	masterArray.push({title: "KS01", description: "Create cost Centre"});
	        	masterArray.push({title: "KE51", description: "Create Profit Centre"});
        	var sampleobj = {
        	    "KS01": {
        	        "CoArea": "BB01",
        	        "CostcenterlistSet": [
        	            {
        	                "Costcenter": "502",
        	                "ValidFrom": "2021-01-01T11:11:11",
        	                "ValidTo": "9999-12-31T11:11:11",
        	                "PersonInCharge": "Karthik",
        	                "CostcenterType": "W",
        	                "CostctrHierGrp": "BB01",
        	                "CompCode": "BY01",
        	                "ProfitCtr": "BBY001",
        	                "Name": " ABC",
        	                "Descript": "West Admin Cost Centre",
        	                "Currency": "GBP"
        	            }
        	        ]
        	    },
        	    "KE51": {
        	        "CompCode": "BB01",
        	        "AssignToPrctr": "X",
        	        "PRO_CTR_ID_NAV": [
        	            {
        	                "CoArea": "BB01",
        	                "ProfitCtr": "121",
        	                "PrctrName": "Revenue Pr ctr",
        	                "LongText": "Revenue Pr Ctr",
        	                "InCharge": "Karthik",
        	                "Department": "West",
        	                "PrctrHierGrp": "BB01",
        	                "Logsystem": "",
        	                "Segment": "",
        	                "InChargeUser": "",
        	                "Validfrom": "2020-01-01T11:11:11",
        	                "Validto": "9999-12-31T11:11:11"
        	            }
        	        ]
        	    }
        	};
        	var descrObj = {
        	    "CoArea": "CONTROLLING AREA",
        	    "Costcenter": "Cost Center",
        	    "ValidFrom": "Valid From",
        	    "ValidTo": "Valid To",
        	    "PersonInCharge": "Person InCharge",
        	    "CostcenterType": "Costcenter Type",
        	    "CostctrHierGrp": "Costcenter Hier Grp",
        	    "CompCode": "Company CODE",
        	    "ProfitCtr": "Profit Center",
        	    "Name": "Name",
        	    "Descript": "Description",
        	    "Currency": "Currency",
        	    "Topnodeonly": "TOP NODE ONLY",
        	    "Groupname": "GROUP NAME",
        	    "Hierlevel": "HIER LEVEL",
        	    "Valcount": "VALCOUNT",
        	    "Valfrom": "VALID FROM",
        	    "Valto": "VALID TO",
        	    "SubGroupname": "SUBGROUP NAME",
        	    "AssignToPrctr": "ASSIGN TO PRCTR",
        	    "PrctrName": "Profit Center Name",
        	    "LongText": "Long Text",
        	    "InCharge": "In Charge",
        	    "Department": "Department",
        	    "PrctrHierGrp": "PRCTR HIER GRP",
        	    "Logsystem": "LOGSYSTEM",
        	    "Segment": "SEGMENT",
        	    "InChargeUser": "IN CHARGE USER",
        	    "Validfrom": "Valid From",
        	    "Validto": "Valid To",
        	    "V_T042-BUKRS": "Company Code",
        	    "V_T042-ABSBU": "Sending Company Code",
        	    "V_T042-ZBUKR": "Paying Company Code",
        	    "V_T042-TOLTG": "Tolerance Days for Payables",
        	    "V_T042-SKTUG": "Minimum Percentage Rate for Payments with Cash Discount",
        	    "V_T042-ULSK1": "Special G/L Transactions to be Paid (Vendor)",
        	    "V_T042-ULSK2": "Special G/L Transactions for Exception List (Vendor)",
        	    "V_T042-ULSD1": "Special G/L Transactions to be Paid (customer)",
        	    "V_T042-ULSD2": "Special G/L Transactions for Exception List (Customer)",
        	    "VSTEL": "Shipping Point",
        	    "VTEXT": "Description",
        	    "FABKL": "Factory calendar key",
        	    "ADR": "Address",
        	    "KOP": "Letter header",
        	    "FUS": " footer lines",
        	    "GRU": "Greeting",
        	    "IMESS": "collective processing log",
        	    "Title": "Title",
        	    "NAME1": "Name1",
        	    "COUNTRY": "Country code",
        	    "LANGU": "Language",
        	    "V023-MATKL(01)": "Material Group",
        	    "V023-WGBEZ(01)": "Material Group Desc."
        	};
        	this.getView().getModel("transaction").setData(masterArray);
            this.getOwnerComponent().getModel("transactionHierarchy").setData(sampleobj);
            this.getOwnerComponent().getModel("transactionDescription").setData(descrObj);
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

		/**
		 * After list data is available, this handler method updates the
		 * master list counter
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
        onUpdateFinished: function (oEvent) {
            // update the master list object counter after new data is loaded
            this._updateListItemCount(oEvent.getParameter("total"));
        },

		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any master list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
                return;
            }

            var sQuery = oEvent.getParameter("query");

            if (sQuery) {
                this._oListFilterState.aSearch = [new Filter("CoArea", FilterOperator.Contains, sQuery)];
            } else {
                this._oListFilterState.aSearch = [];
            }
            this._applyFilterSearch();

        },

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
        onRefresh: function () {
            this._oList.getBinding("items").refresh();
        },

		/**
		 * Event handler for the filter, sort and group buttons to open the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the button press event
		 * @public
		 */
        onOpenViewSettings: function (oEvent) {
            var sDialogTab = "filter";
            if (oEvent.getSource() instanceof sap.m.Button) {
                var sButtonId = oEvent.getSource().getId();
                if (sButtonId.match("sort")) {
                    sDialogTab = "sort";
                } else if (sButtonId.match("group")) {
                    sDialogTab = "group";
                }
            }
            // load asynchronous XML fragment
            if (!this.byId("viewSettingsDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "autoconfigmasterdetail.view.ViewSettingsDialog",
                    controller: this
                }).then(function (oDialog) {
                    // connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);
                    oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
                    oDialog.open(sDialogTab);
                }.bind(this));
            } else {
                this.byId("viewSettingsDialog").open(sDialogTab);
            }
        },

		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
		 * are applied to the master list, which can also mean that they
		 * are removed from the master list, in case they are
		 * removed in the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
        onConfirmViewSettingsDialog: function (oEvent) {

            this._applySortGroup(oEvent);
        },

		/**
		 * Apply the chosen sorter and grouper to the master list
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @private
		 */
        _applySortGroup: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath,
                bDescending,
                aSorters = [];
            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            this._oList.getBinding("items").sort(aSorters);
        },

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
        onSelectionChange: function (oEvent) {
            var oList = oEvent.getSource(),
                bSelected = oEvent.getParameter("selected");

            // skip navigation when deselecting an item in multi selection mode
            if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
                // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
                this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
            }
        },

		/**
		 * Event handler for the bypassed event, which is fired when no routing pattern matched.
		 * If there was an object selected in the master list, that selection is removed.
		 * @public
		 */
        onBypassed: function () {
            this._oList.removeSelections(true);
        },

		/**
		 * Used to create GroupHeaders with non-capitalized caption.
		 * These headers are inserted into the master list to
		 * group the master list's items.
		 * @param {Object} oGroup group whose text is to be displayed
		 * @public
		 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
		 */
        createGroupHeader: function (oGroup) {
            return new GroupHeaderListItem({
                title: oGroup.text,
                upperCase: false
            });
        },

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
        onNavBack: function () {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */


        _createViewModel: function () {
            return new JSONModel({
                isFilterBarVisible: false,
                filterBarLabel: "",
                delay: 0,
                title: this.getResourceBundle().getText("masterTitleCount", [0]),
                noDataText: this.getResourceBundle().getText("masterListNoDataText"),
                sortBy: "CoArea",
                groupBy: "None"
            });
        },

        _onMasterMatched: function () {
            //Set the layout property of the FCL control to 'OneColumn'
            this.getModel("appView").setProperty("/layout", "OneColumn");
        },

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
        _showDetail: function (oItem) {
            var bReplace = !Device.system.phone;
            // set the layout property of FCL control to show two columns
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext("transaction").getProperty("title")
            }, bReplace);
        },

		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
        _updateListItemCount: function (iTotalItems) {
            var sTitle;
            // only update the counter if the length is final
            if (this._oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
                this.getModel("masterView").setProperty("/title", sTitle);
            }
        },

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
        _applyFilterSearch: function () {
            var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
                oViewModel = this.getModel("masterView");
            this._oList.getBinding("items").filter(aFilters, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aFilters.length !== 0) {
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
            } else if (this._oListFilterState.aSearch.length > 0) {
                // only reset the no data text to default when no new search was triggered
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
            }
        },

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
        _updateFilterBar: function (sFilterBarText) {
            var oViewModel = this.getModel("masterView");
            oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
            oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
        },
        onUpload: function (e) {
            //BusyIndicator.show();
            this._import(e.getParameter("files") && e.getParameter("files")[0]);
        },
        _import: function (file) {
            var that = this;
            var excelData = {};
            var masterData = [];
            let csvData = "";
            const viewSet = new Set(["FBZP","OVXD","OMSF","OVX7"])
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        // Here is your object for every sheet in workbook
                        excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        csvData = XLSX.utils.make_csv(workbook.Sheets[sheetName]);
                        //  break; // to be remove
                    });


                    var numberofTran = csvData.split("\nx");
                    var sampleobj = {}, descrObj = {};
                    for (var i = 0; i < numberofTran.length; i++) {
                        var lines = numberofTran[i].split("\n");
                        var sTransaction = (lines[2].split(","))[1];
                        var hierarchyobj = {};
                        sampleobj[sTransaction] = {};
                        var TransactionDesc = that.fnGetDescription(sTransaction)
                        masterData.push({
                            "title": sTransaction,
                            "description": TransactionDesc
                        })
                        var k = 0;
                        for (var j = 0; j + k < lines.length / 4; j++) {
                            var desc = lines[(j * 4) + k].split(",");
                            var keys = lines[(j * 4 + 1 + k)].split(",");
                            var value = lines[(j * 4 + 2 + k)].split(",");
                            if (j != 0 && sampleobj[sTransaction][value[2]] == undefined && value[2] != "BASICDATA" || viewSet.has(sTransaction)) {
                                sampleobj[sTransaction][value[2]] = [];
                                hierarchyobj = {};

                            }
                            keys.forEach(function (key, index) {
                                if ((key != "") && !(index in [0, 1, 2])) {
                                    if ((j == 0 || (index == 3 && keys[4] == "") || value[2] == "BASICDATA")&& !viewSet.has(sTransaction)) {
                                        sampleobj[sTransaction][key] = value[index];
                                        descrObj[key] = desc[index];
                                    }
                                    else {
                                        hierarchyobj[key] = value[index];
                                        descrObj[key] = desc[index];
                                    }
                                }
                            });
                            if (j != 0 && Object.keys(hierarchyobj).length != 0 || viewSet.has(sTransaction)) {
                                sampleobj[sTransaction][value[2]].push(hierarchyobj);
                                while (true) {
                                    hierarchyobj = {};
                                    k++;
                                    if (lines[(j * 4 + 2) + k] == "" || lines[(j * 4 + 2) + k] == undefined) {
                                        k--;
                                        break;
                                    }
                                    else{
                                        var extraValues = lines[(j * 4 + 2) + k].split(",");
                                        if (extraValues[4] == "") {
                                            k--;
                                            break;
                                        }
                                        else {
                                            keys.forEach(function (key, index) {
                                                if ((key != "") && !(index in [0, 1, 2])) {
                                                    hierarchyobj[key] = extraValues[index];
                                                }
                                            });
                                            sampleobj[sTransaction][value[2]].push(hierarchyobj);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    that.getView().getModel("transaction").setData(masterData);
                    that.getOwnerComponent().getModel("transactionHierarchy").setData(sampleobj);
                    that.getOwnerComponent().getModel("transactionDescription").setData(descrObj);
                    console.log(sampleobj);
                    console.log(descrObj);
                    if (that.getModel("appView").getProperty("/layout") == "TwoColumnsMidExpanded") {
                        //console.log("secondpage");
                        that.getView().byId("list").fireSelectionChange()
                    }

                    //that.callCreate(sampleobj);

                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsBinaryString(file);
            }
        },
        fnGetDescription: function (sTransaction) {
            switch (sTransaction) {
                case 'KS01':
                    return "Create cost Center";
                    break;
                case 'KSH1':
                    return "Create Cost Center Group";
                    break;
                case 'KSH2':
                    return "Cost Center Group add Node";
                    break;
                case 'KE51':
                    return "Create Profit Center";
                    break;
                case 'FBZP':
                    return 'Prepare Cross company code for Automatic Payments'
                    break;
                case 'OVXD':
                    return 'Define-copy- delete-check shipping point'
                    break;
                case 'OMSF':
                    return 'Define Material Group'
                    break;
                case 'OVX7':
                    return 'Maintain loading point';
                    break;
                default:
                    return "No description found"
            }
        },
        
        onStartRecording: function () {
            var final_transcript = '';
            var that = this;
            this.recognition.start();
            MessageToast.show("Recording started");
            this.recognition.onstart = function () { };
            this.recognition.onresult = function (event) {

                var interim_transcript = '';

                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final_transcript += event.results[i][0].transcript;
                    } else {
                        interim_transcript += event.results[i][0].transcript;
                        console.log(interim_transcript);
                    }

                }

                if (final_transcript != "") {
                    that.onSubmitValue(final_transcript);
                    final_transcript = "";
                }
            };
        },

        onSubmitValue: function (sValue) {
        	/*var items = this.getView().byId('sbox').getItems();
            var oDropDowns = {};
            if (sValue.trim().toLowerCase() == "description") {
                this.getView().byId('txta_workdesc').focus();
                this._index = 5;
            } else if (sValue.trim().toLowerCase() == "name") {
                this.getView().byId('inp_awnot').focus();
                this._index = 3;

            } else if (sValue.trim().toLowerCase() == "country") {
                this.getView().byId('dropdown').focus();
                this._index = 7;
            } else if (sValue.trim().toLowerCase() == "focus") {
                MessageToast.show("Setting focus..");
                setFocus = true;
            } else {
                if (this._index != 3 && this._index != 5 && this._index != 7) {
                    this.getView().byId('inp_awnot').setValue(sValue.trim());
                }
                if (this._index == 3 || this._index == 5) {
                    this.getView().byId('sbox').getItems()[this._index].setValue(sValue.trim());
                }
                if (this._index == 7) {
                    var oData = this.getView().getModel("ddModelRoadFootway").getData().DD_ROAD_FOOTWAY;
                    var oData = [{ 'key': "1", 'text': "India" }, { 'key': "2", 'text': "America" },
                        { 'key': "3", 'text': "Dubai" }, { 'key': "4", 'text': "Germany" }, { 'key': "5", 'text': "France" }]
                    oDropDowns.DD_ROAD_FOOTWAY = [];
                    oDropDowns.DD_ROAD_FOOTWAY = oData;
                
                var priorityDropdown = new JSONModel(oDropDowns);
                this.getView().setModel(priorityDropdown, 'priorityDropdown');
                    var data = oData.filter(function (item) {
                        if (item.text == sValue.trim()) {
                         return item.key;
                        }
                    });
                    if (data.length > 0){
                        this.getView().byId('dropdown').setSelectedKey(data[0].key);
                    }
                }
                //this.getView().byId('txta_workdesc').setValue(sValue.trim());
                //this.getView().byId('inp_awnot').setValue(sValue.trim());
                //this.recognition.stop();
            }*/
        	var speechValue = sValue.trim().toLowerCase();
            if (speechValue.split(" ")[0] == "select") {
            	if(sap.ui.getCore().byId("TRDialogSelect")){
            		if(sap.ui.getCore().byId("TRDialogSelect").isOpen()){
            			
            		}else{
                		this._oList;
                    	for(var i=0;i<this._oList.getItems().length;i++){
                    		if(this._oList.getItems()[i].getBindingContext("transaction").getProperty("description").toLowerCase() == speechValue.split("select")[1].trim()){
                    			this._showDetail(this._oList.getItems()[i]);
                    			break;
                    		}
                    	}
                	}
            	}else{
            		this._oList;
                	for(var i=0;i<this._oList.getItems().length;i++){
                		if(this._oList.getItems()[i].getBindingContext("transaction").getProperty("description").toLowerCase() == speechValue.split("select")[1].trim()){
                			this._showDetail(this._oList.getItems()[i]);
                			break;
                		}
                	}
            	}
            	
            } else if (speechValue.split(" ")[0] == "press") {
            	if (speechValue.split(" ")[1] == "submit") {
            		if(sap.ui.getCore().byId("TRDialogSelect")){
            			if(sap.ui.getCore().byId("TRDialogSelect").isOpen()){
                    		sap.ui.getCore().byId("finalSubmit").firePress();
                		}else{
                			sap.ui.getCore().byId("container-autoconfigmasterdetail---detail--detailSubmit").firePress();
                    	}
            		}else{
            			sap.ui.getCore().byId("container-autoconfigmasterdetail---detail--detailSubmit").firePress();
            		}
            		
            	}else if(speechValue.split(" ")[1] == "cancel"){
            		if(sap.ui.getCore().byId("TRDialogSelect")){
            			if(sap.ui.getCore().byId("TRDialogSelect").isOpen()){
            				sap.ui.getCore().byId("finalCancel").firePress();
                		}else{
                			
                    	}
            		}else{
            			
            		}
            	}else if(speechValue.split(" ")[1] == "close"){
            		for(var j=0;j!=-1;j++){
            			if(document.querySelector("#__dialog"+j) != null){
            				var dialog = sap.ui.getCore().byId("__dialog"+j).close();
            				break;
            			}
            			if(j>50){
            				break;
            			}
        			}
            	}
            	
            } else if (speechValue.split(" ")[0] == "focus") {
            	this._oList;
            	for(var i=0;i<this._oList.getItems().length;i++){
            		if(location.href.toLowerCase().includes(this._oList.getItems()[i].getBindingContext("transaction").getProperty("title").toLowerCase()) == true){
            			for(var j=0;j!=-1;j++){
	            			if(document.querySelector("#container-autoconfigmasterdetail---detail--detailPage-page-content").querySelector("#__table"+j) != null){
	            				var detailTable = sap.ui.getCore().byId("__table"+j);
	            				//detailTable.getItems()[0].getAggregation('cells')[0].mAssociations.ariaLabelledBy[0]
	            				detailTable.getItems()[0].getAggregation('cells')[0].focus();
	            				this._selectedCellForVoice = detailTable.getItems()[0].getAggregation('cells')[0].sId;
	            				break;
			            		/*if(this._oList.getItems()[i].getBindingContext("transaction").getProperty("description").toLowerCase() == speechValue.split("focus")[1].trim()){
			            			this._showDetail(this._oList.getItems()[i]);
			            			break;
			            		}*/
	            			}
	            			if(j>50){
	            				break;
	            			}
            			}
            		}
            	}
            } else if (speechValue.split(" ")[0] == "next") {
            	var currentCellId = this._selectedCellForVoice;
            	for(var i=0;i<this._oList.getItems().length;i++){
	            	if(location.href.toLowerCase().includes(this._oList.getItems()[i].getBindingContext("transaction").getProperty("title").toLowerCase()) == true){
	        			for(var j=0;j!=-1;j++){
	            			if(document.querySelector("#container-autoconfigmasterdetail---detail--detailPage-page-content").querySelector("#__table"+j) != null){
	            				var detailTable = sap.ui.getCore().byId("__table"+j);
	            				var cellCount = detailTable.getItems()[0].getAggregation('cells').length;
	            				var splittedId = currentCellId.split("-");
	            				var currentInputNumber = Number(splittedId[0].split("input")[1]);
	            				var UpdatedInputNumber = currentInputNumber+1;
	            				splittedId[0] = splittedId[0].replace(currentInputNumber,UpdatedInputNumber);
	            				this._selectedCellForVoice = splittedId.join("-");
	            				sap.ui.getCore().byId(this._selectedCellForVoice).focus();
	            				break;
	            			}
	            			if(j>50){
	            				break;
	            			}
	        			}
	        		}
            	}
            } else if (speechValue == "stop recording") {
            	this.stopRecording();
            } else if (speechValue == "load new transaction") {
            	sap.ui.getCore().byId("container-autoconfigmasterdetail---detail--closeColumn-button").firePress();
            	window.location.reload();
            }else if (speechValue.split(" ")[0] == "submit") {
        		if(sap.ui.getCore().byId("TRDialogSelect")){
        			if(sap.ui.getCore().byId("TRDialogSelect").isOpen()){
                		sap.ui.getCore().byId("finalSubmit").firePress();
            		}else{
            			sap.ui.getCore().byId("container-autoconfigmasterdetail---detail--detailSubmit").firePress();
                	}
        		}else{
        			sap.ui.getCore().byId("container-autoconfigmasterdetail---detail--detailSubmit").firePress();
        		}
        		
        	}else if(speechValue.split(" ")[0] == "cancel"){
        		if(sap.ui.getCore().byId("TRDialogSelect")){
        			if(sap.ui.getCore().byId("TRDialogSelect").isOpen()){
        				sap.ui.getCore().byId("finalCancel").firePress();
            		}else{
            			
                	}
        		}else{
        			
        		}
        	}else if(speechValue.split(" ")[0] == "close"){
        		for(var j=0;j!=-1;j++){
        			if(document.querySelector("#__dialog"+j) != null){
        				var dialog = sap.ui.getCore().byId("__dialog"+j).close();
        				break;
        			}
        			if(j>50){
        				break;
        			}
    			}
        	}else{
            	if(sap.ui.getCore().byId("TRDialogSelect")){
            		if(sap.ui.getCore().byId("TRDialogSelect").isOpen()){
                		sap.ui.getCore().byId("TRDesc").setValue(sValue.trim());
            		}else{
            			if(this._selectedCellForVoice){
            				sap.ui.getCore().byId(this._selectedCellForVoice).setValue(sValue.trim());
            			}else{
            				
            			}
                    	
                	}
        		}else{
        			if(this._selectedCellForVoice){
        				sap.ui.getCore().byId(this._selectedCellForVoice).setValue(sValue.trim());
        			}else{
        				
        			}
        		}
            	
            }
            

        },

        submitValue: function (final_transcript) {
            var key = final_transcript.toLowerCase().trim();
            console.log("Key:" + key);
        },
        
        stopRecording: function () {
        	this.recognition.stop();
            MessageToast.show("Recording stopped");
        }


    });

});