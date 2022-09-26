sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/library",
    "sap/m/ObjectAttribute",
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/ButtonType",
    "sap/m/MessagePopover",
    "sap/m/MessagePopoverItem",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/message/ControlMessageProcessor",
    "sap/ui/core/MessageType",
    "sap/m/MessageItem",
    "sap/ui/core/IconPool",
    "sap/m/MessageView",
    "sap/m/Bar"
], function (BaseController, JSONModel, formatter, mobileLibrary, ObjectAttribute, Table, Column, MessageBox,Dialog,DialogType,Button,Label,ButtonType,MessagePopover,MessagePopoverItem,Filter,FilterOperator,BusyIndicator,ControlMessageProcessor,MessageType,MessageItem,IconPool,MessageView,Bar) {
    "use strict";

    // shortcut for sap.m.URLHelper
    var URLHelper = mobileLibrary.URLHelper;

    return BaseController.extend("autoconfigmasterdetail.controller.Detail", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                busy: false,
                delay: 0,
                lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading"),
                NewTR: false
            });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "detailView");

            this.fnTOCreateDialogMessage();

            this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
        onSendEmailPress: function () {
            var oViewModel = this.getModel("detailView");

			/*URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);*/
        },


		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
        onListUpdateFinished: function (oEvent) {
            var sTitle,
                iTotalItems = oEvent.getParameter("total"),
                oViewModel = this.getModel("detailView");

            // only update the counter if the length is final
            if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
                if (iTotalItems) {
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
                } else {
                    //Display 'Line Items' instead of 'Line items (0)'
                    sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
                }
                oViewModel.setProperty("/lineItemListTitle", sTitle);
            }
        },

        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").objectId;
            this.getModel("detailView").setProperty("/title", sObjectId);
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            var selectedTransactionData = this.getModel("transactionHierarchy").getData()[sObjectId];
            var DescHeader = this.getOwnerComponent().getModel("transactionDescription").getData();
            var semanticPage = this.getView().byId("detailPage");
            semanticPage.destroyHeaderContent();
            semanticPage.getContent().destroyContent();
            var keysforselectedData = Object.keys(selectedTransactionData);
            keysforselectedData.forEach(function (key) {
                if(key != 'ZTRANSPORTSet'){
                if (Array.isArray(selectedTransactionData[key])) {
                    this.fnCreateTable(key, selectedTransactionData, semanticPage, sObjectId)
                } else {
                    var newAttr = new ObjectAttribute({ title: DescHeader[key], text: selectedTransactionData[key] })
                    semanticPage.addHeaderContent(newAttr);
                }
            }
            }.bind(this))

           /* var oMessageProcessor = new ControlMessageProcessor();
			var oMessageManager = sap.ui.getCore().getMessageManager();

			oMessageManager.registerMessageProcessor(oMessageProcessor);*/
			/*this.getModel().metadataLoaded().then( function() {
				var sObjectPath = this.getModel().createKey("ControllingAreaSet", {
					CoArea :  sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));*/
        },
        fntoGetTableHeader:function(key){
            switch(key){
                 case 'CostcenterlistSet':
                     return "list of Cost Center";
                     break;
                case 'ZCCGRP_CREATE_ISet':
                     return "Cost Center Group";
                     break;
                case 'HIERARCHYVALUESSet':
                    return "Hierarchy Values Set";
                    break;
                case 'PRO_CTR_ID_NAV':
                    return "Profit Center";
                    break;
                default:
                    return key;
             }
        },
        fnCreateTable: function (key, selectedTransactionData, semanticPage, sObjectId) {
            var ColumnHeaderArrayKeys = Object.keys(selectedTransactionData[key][0]);
            var sTableHeaderKey = this.fntoGetTableHeader(key)
            var DescHeader = this.getOwnerComponent().getModel("transactionDescription").getData();
            var ColumnHeaderArray = [];
            var bindingColumn = [];
            ColumnHeaderArrayKeys.forEach(function (headerkey) {
                ColumnHeaderArray.push(new Column({
                    header: [
                        new sap.m.Label({
                            text: DescHeader[headerkey],
                            wrapping: true
                        })
                    ]
                }))
                bindingColumn.push(new sap.m.Input({
                    value: '{transactionHierarchy>' + headerkey + '}'
                }))
            });
            var oTable = new Table({
                headerToolbar: [
                    new sap.m.Toolbar({
                        content: [
                            new sap.m.Title({
                                text: sTableHeaderKey,
                                level: "H2"
                            })
                        ]
                    })
                ],
                columns: ColumnHeaderArray
            })
            var oTemplate = new sap.m.ColumnListItem({

                cells: bindingColumn
            });
            //oTable.setModel(this.getModel("transactionHierarchy"))
            oTable.bindItems({

                path: "transactionHierarchy>/" + sObjectId + "/" + key,
                template: oTemplate
            });

            semanticPage.getContent().addContent(oTable);

        },
        fnToselectTR: function(){
            var oViewModel = this.getView().getModel("detailView");
            var oItemTemplate = new sap.ui.core.ListItem({
                    key:"{ZTR_Number}",
			        text: "{ZTR_Number} - {ZTR_Desc}",
			        additionalText: "{ZTR_Desc}"
		});
			if (!this.oTRDialog) {
				this.oTRDialog = new Dialog("TRDialogSelect", {
					title: "TR",
					type: DialogType.Message,
					content: [
                        new sap.m.RadioButtonGroup({
                            width:"100%",
                            columns:2,
                            selectedIndex:1,
                            select:function(oEvent){
                                var oRBId = oEvent.getSource().getSelectedButton().getId();
                                if(oRBId == "RB2"){
                                    oViewModel.setProperty("/NewTR",true)
                                }
                                else{
                                   oViewModel.setProperty("/NewTR",false) 
                                }
                            },
                            buttons:[new sap.m.RadioButton("RB1",{text:"Existing TR"
                            }),
                                    new sap.m.RadioButton("RB2",{text:"New TR",selected:true
                               })]
                        }),

						new Label({
                            text: "TR",
                            visible:"{= !${detailView>/NewTR}}",
							labelFor: "TRSelect"
						}),
						new sap.m.Select("TRSelect", {
                            width:"100%",
                            visible:"{= !${detailView>/NewTR}}",
                            items:{
                                path: "/ZTRANSPORTSet",
                                filters:[new Filter({
                                path: 'ZTR_Number', 
                                operator: 'EQ', 
                                value1: ''     
                                })],
				                template: oItemTemplate
			                    }							
                        }),
                        new Label({
							text: "TR Description",
                            labelFor: "TRDesc",
                            visible:"{detailView>/NewTR}"
						}),
						new sap.m.TextArea("TRDesc", {
                            width:"100%",
                            visible:"{detailView>/NewTR}"						
						})
					],
					beginButton: new Button("finalSubmit", {
						type: ButtonType.Emphasized,
						text: "Submit",
						press: function (oEvent) {
                            this.fngetNewTR(oEvent);
                            //this.fnOnSubmit();
							this.oTRDialog.close();
						}.bind(this)
					}),
					endButton: new Button("finalCancel", {
						text: "Cancel",
						press: function () {
							this.oTRDialog.close();
						}.bind(this)
					})
                });
				oViewModel.setProperty("/NewTR",true);
                this.getView().addDependent(this.oTRDialog);
			}

			this.oTRDialog.open();
        },
        fngetNewTR:function(oEvent){
            var sRBId = oEvent.getSource().getParent().getContent()[0].getSelectedButton().getId();
            if(sRBId=="RB2")
            {
                 BusyIndicator.show();
              var sDesc = sap.ui.getCore().byId("TRDesc").getValue();  
              var oPayloadTR = {
                  "ZTR_Number" : " ",
                    "ZTR_Desc"  :sDesc} 
                this.getModel().create('/ZTRANSPORTSet',oPayloadTR, {
                success: function (oResponse) {
                     BusyIndicator.hide();
                   this.fnOnSubmit(oResponse.ZTR_Number);
                }.bind(this),
                 error: function (oError) {
                       BusyIndicator.hide();     
                }
            });    
            }
            else{
                this.fnOnSubmit(sap.ui.getCore().byId("TRSelect").getSelectedKey());
            }

        },
        fnOnSubmit: function (sSelectedkey) {
            var oViewModel = this.getModel("detailView");
            oViewModel.setProperty("/busy", true);
            BusyIndicator.show();
            var sampleobj = this.getModel("transactionHierarchy").getData();
            this.getModel().setDeferredGroups(["group1"]);
            var oDialog = this.oDialog;
            var oMessageView = this.oMessageView;
            //var sSelectedkey = sap.ui.getCore().byId("TRSelect").getSelectedKey();
            Object.keys(sampleobj).forEach(function (key){
                    sampleobj[key].ZTRANSPORTSet=[{
                                "ZTR_Number" : sSelectedkey,
                                "ZTR_Desc"   : " "}];
            });
            /*this.getModel().create('/ControllingAreaSet', sampleobj.KS01, {groupId: "group1"});
            this.getModel().create('/ZCCGRP_CREATE_HSet', sampleobj.KSH1, {groupId: "group1"});
            this.getModel().submitChanges({
                groupId: "group1",
                success: this.successCallback, 
                error: this.errorCallback
            });*/
            var oMessage = this.getOwnerComponent().getModel("messagePopover");
            oMessage.setData([]);
            if(sampleobj && sampleobj.KS01 && sampleobj.KS01!== undefined && sampleobj.KS01!== null){
            this.getModel().create('/ControllingAreaSet', sampleobj.KS01, {
                success: function (response) {
                    BusyIndicator.hide();
                    oViewModel.setProperty("/busy", false);
                    var oCostcenter = "";
                    var oCostcenter = response.CostcenterlistSet.results.map(function(item) {
                             return item['Costcenter'];
                        });
                     var oMessageData = oMessage.getData();
                        oMessageData.push({
                            message: 'KS01',
                            type: MessageType.Success,
                            description:"Required CostCenter " + oCostcenter.toString()  + " set up in system successfully"
                        });
                        oMessage.updateBindings(true);
                        oMessageView.navigateBack()
                        oDialog.open();
                       // oMessage.refresh();
                    //MessageBox.success("Required CostCenter " + response.CostcenterlistSet.results[0].Costcenter + " set up in system successfully");
                    //alert("Create successful");
                }, error: function (oError) {
                    BusyIndicator.hide();
                     oViewModel.setProperty("/busy", false);
                    var messageText = " ";
                    if (JSON.parse(oError.responseText)) {
                        messageText = JSON.parse(oError.responseText).error.message.value;
                    }
                    else {
                        var XMLResponse = jQuery.parseXML(oError.responseText);
                        var oXMLMsg = XMLResponse.querySelector("message");
                        if (oXMLMsg) {
                            messageText = oXMLMsg.textContent;
                        }
                    }

                        var oMessageData = oMessage.getData();
                        oMessageData.push({
                            message: 'KS01',
                            type: MessageType.Error,
                            description:messageText
                        })
                        oMessage.updateBindings(true);
                        oMessageView.navigateBack();
                        oDialog.open();
                        // oMessage.refresh();
                    //MessageBox.error(messageText);
                    //alert("Create failed");
                }
            });
        }


        // Transaction for KSH1_1
         if(sampleobj && sampleobj.KSH1 && sampleobj.KSH1!== undefined && sampleobj.KSH1!== null){
        this.getModel().create('/ZCCGRP_CREATE_HSet', sampleobj.KSH1, {
                success: function (response) {
                    BusyIndicator.hide();
                    oViewModel.setProperty("/busy", false);
                    var oCostcenterGroup = response.ZCCGRP_CREATE_ISet.results.map(function(item) {
                             return item['Groupname'];
                        });
                    var oMessageData = oMessage.getData();
                        oMessageData.push({
                            message: 'KSH1',
                            type: MessageType.Success,
                            description:"Required Cost Center Group "+oCostcenterGroup.toString()+" created successfully"
                        })
                        oMessage.updateBindings(true);
                        oMessageView.navigateBack()
                        oDialog.open();
                       //  oMessage.refresh();
                    //MessageBox.success("Required CostCenter " + response.CostcenterlistSet.results[0].Costcenter + " set up in system successfully");
                    //alert("Create successful");
                }, error: function (oError) {
                    BusyIndicator.hide();
                     oViewModel.setProperty("/busy", false);
                    var messageText = " ";
                    if (JSON.parse(oError.responseText)) {
                        messageText = JSON.parse(oError.responseText).error.message.value;
                    }
                    else {
                        var XMLResponse = jQuery.parseXML(oError.responseText);
                        var oXMLMsg = XMLResponse.querySelector("message");
                        if (oXMLMsg) {
                            messageText = oXMLMsg.textContent;
                        }
                    }

                    //MessageBox.error(messageText);
                    //alert("Create failed");
                    var oMessageData = oMessage.getData();
                        oMessageData.push({
                            message: 'KSH1',
                            type: MessageType.Error,
                            description:messageText
                        })
                        oMessage.updateBindings(true);
                        oMessageView.navigateBack();
                        oDialog.open();
                       //  oMessage.refresh();
                }
            });
        }

            //Transaction for KSH2
        if(sampleobj && sampleobj.KSH2 && sampleobj.KSH2!== undefined && sampleobj.KSH2!== null){
             this.getModel().create('/Costcentergrp_addnodeSet', sampleobj.KSH2, {
                success: function (response) {
                    BusyIndicator.hide();
                    oViewModel.setProperty("/busy", false);
                    var oMessageData = oMessage.getData();
                        oMessageData.push({
                            message: 'KSH2',
                            type: MessageType.Success,
                            description:"Required Cost Center Node created successfully"
                        })
                        oMessage.updateBindings(true);
                        oMessageView.navigateBack()
                        oDialog.open();
                       //  oMessage.refresh();
                    //MessageBox.success("Required CostCenter " + response.CostcenterlistSet.results[0].Costcenter + " set up in system successfully");
                    //alert("Create successful");
                }, error: function (oError) {
                    BusyIndicator.hide();
                     oViewModel.setProperty("/busy", false);
                    var messageText = " ";
                    if (JSON.parse(oError.responseText)) {
                        messageText = JSON.parse(oError.responseText).error.message.value;
                    }
                    else {
                        var XMLResponse = jQuery.parseXML(oError.responseText);
                        var oXMLMsg = XMLResponse.querySelector("message");
                        if (oXMLMsg) {
                            messageText = oXMLMsg.textContent;
                        }
                    }

                    //MessageBox.error(messageText);
                    //alert("Create failed");
                    var oMessageData = oMessage.getData();
                        oMessageData.push({
                            message: 'KSH2',
                            type: MessageType.Error,
                            description:messageText
                        })
                        oMessage.updateBindings(true);
                        oMessageView.navigateBack();
                        oDialog.open();
                       
                }
            });
        }


            //Transaction for KE51
        if(sampleobj && sampleobj.KE51 && sampleobj.KE51!== undefined && sampleobj.KE51!== null){
            this.getModel().create('/COMPANYCODESSet', sampleobj.KE51, {
                success: function (response) {
                    BusyIndicator.hide();
                    //response.PRO_CTR_ID_NAV.results[0].ProfitCtr
                    oViewModel.setProperty("/busy", false);
                    var oProfitCenter = response.PRO_CTR_ID_NAV.results.map(function(item) {
                             return item['ProfitCtr'];
                        });
                    var oMessageData = oMessage.getData();
                        oMessageData.push({
                            message: 'KE51',
                            type: MessageType.Success,
                            description:"Required Profit Center "+oProfitCenter.toString() +" created successfully"
                        })
                        oMessage.updateBindings(true);
                        oMessageView.navigateBack()
                        oDialog.open();
                       //  oMessage.refresh();
                    //MessageBox.success("Required CostCenter " + response.CostcenterlistSet.results[0].Costcenter + " set up in system successfully");
                    //alert("Create successful");
                }, error: function (oError) {
                    BusyIndicator.hide();
                     oViewModel.setProperty("/busy", false);
                    var messageText = " ";
                    if (JSON.parse(oError.responseText)) {
                        messageText = JSON.parse(oError.responseText).error.message.value;
                    }
                    else {
                        var XMLResponse = jQuery.parseXML(oError.responseText);
                        var oXMLMsg = XMLResponse.querySelector("message");
                        if (oXMLMsg) {
                            messageText = oXMLMsg.textContent;
                        }
                    }

                    //MessageBox.error(messageText);
                    //alert("Create failed");
                    var oMessageData = oMessage.getData();
                        oMessageData.push({
                            message: 'KE51',
                            type: MessageType.Error,
                            description:messageText
                        })
                        oMessage.updateBindings(true);
                        oMessageView.navigateBack();
                        oDialog.open();
                       
                }
            });
        }

        },
        successCallback:function(oResponse){
            console.log(oResponse);
            MessageBox.success("Data created successfully");
            BusyIndicator.hide();
        },
        errorCallback:function(oError){
            console.log(oError);
            BusyIndicator.hide();
        },

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
        _bindView: function (sObjectPath) {
            // Set busy indicator during view binding
            var oViewModel = this.getModel("detailView");

            // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
            //	oViewModel.setProperty("/busy", false);

			/*this.getView().bindElement({
				path : sObjectPath,
				events: {
					change : this._onBindingChange.bind(this),
					dataRequested : function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});*/
        },

        _onBindingChange: function () {
            var oView = this.getView(),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("detailObjectNotFound");
                // if object could not be found, the selection in the master list
                // does not make sense anymore.
                this.getOwnerComponent().oListSelector.clearMasterListSelection();
                return;
            }

            var sPath = oElementBinding.getPath(),
                oResourceBundle = this.getResourceBundle(),
                oObject = oView.getModel().getObject(sPath),
                //	sObjectId = oObject.CoArea,
                //	sObjectName = oObject.CoArea,
                oViewModel = this.getModel("detailView");

            this.getOwnerComponent().oListSelector.selectAListItem(sPath);

            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        },

        _onMetadataLoaded: function () {
            // Store original busy indicator delay for the detail view
            var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
                oViewModel = this.getModel("detailView"),
                oLineItemTable = this.byId("lineItemsList"),
                iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            //oViewModel.setProperty("/delay", 0);
            //oViewModel.setProperty("/lineItemTableDelay", 0);

			/*oLineItemTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});*/

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
        },

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
        onCloseDetailPress: function () {
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
            // No item should be selected on master after detail page is closed
            this.getOwnerComponent().oListSelector.clearMasterListSelection();
            this.getRouter().navTo("master");
        },
        onMessagesButtonPress: function (oEvent) {
            var oMessagesButton = oEvent.getSource();

            if (!this._messagePopover) {
                this._messagePopover = new MessagePopover({
                    items: {
                        path: "messagePopover>/",
                        template: new MessageItem({
                            description: "{messagePopover>description}",
                            type: "{messagePopover>type}",
                            title: "{messagePopover>message}",
                            subtitle: '{messagePopover>description}'
                        })
                    }
                });
                oMessagesButton.addDependent(this._messagePopover);
            }
            this._messagePopover.toggle(oMessagesButton);
        },
        showMessageDialog:function(){

        },

		/**
		 * Toggle between full and non full screen mode.
		 */
        toggleFullScreen: function () {
            var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
            if (!bFullScreen) {
                // store current layout and go full screen
                this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
                this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
            } else {
                // reset to previous layout
                this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
            }
        },
        fnTOCreateDialogMessage: function(){
            var that = this;
            var oMessageTemplate = new MessageItem({
				type: '{messagePopover>type}',
				title: '{messagePopover>message}',
				description: '{messagePopover>description}',
				subtitle: '{messagePopover>description}'
			});
            this.oMessageView = new MessageView({
				showDetailsPageHeader: false,
				itemSelect: function () {
					oBackButton.setVisible(true);
				},
				items: {
					path: "messagePopover>/",
					template: oMessageTemplate
				}
			});
            	
			var oBackButton = new Button({
					icon: IconPool.getIconURI("nav-back"),
					visible: false,
					press: function () {
						that.oMessageView.navigateBack();
						this.setVisible(false);
					}
				});



			this.oMessageView.setModel(this.getOwnerComponent().getModel("messagePopover"),"messagePopover");

			this.oDialog = new sap.m.Dialog({
				resizable: true,
				content: this.oMessageView,
				state: 'Error',
				beginButton: new Button({
					press: function () {
						this.getParent().close();
					},
					text: "Close"
				}),
				customHeader: new Bar({
					contentMiddle: [
						new Text({ text: "Error"})
					],
					contentLeft: [oBackButton]
				}),
				contentHeight: "50%",
				contentWidth: "50%",
				verticalScrolling: false
			});
        }
    });

});