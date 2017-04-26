var appPageHistory=[];
var jsonToBeSend=new Object();
var jsonBEArr = [];
var budgetingStatus;
var gradeId;
var unitId;
var employeeId;
var empFirstName;
var successSyncStatusBE =false;
var successSyncStatusTR =false;

var successMsgForCurrency = "Currency synchronized successfully.";
var errorMsgForCurrency = "Currency not synchronized successfully.";

var app = {
    // Application Constructor
    initialize: function() {
		this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
		document.addEventListener("deviceready", this.onDeviceReady, false);
    },
	
	onDeviceReady: function() {
       		  if (navigator.notification) { // Override default HTML alert with native dialog
			  window.alert = function (message) {
				  navigator.notification.alert(
					  message,   	 // message
					  null,       	// callback
					  "Alert", 	   // title
					  'OK'        // buttonName
				  );
			  };
		  }
		  document.addEventListener("backbutton", function(e){
			 goBackEvent();
		  }, false);
		  validateValidMobileUser();
		  document.addEventListener('onSMSArrive',function(e){
			 	saveIncomingSMSOnLocal(e);
			 },false);
		  }
};

function goBack() {
	var currentUser=getUserID();
	
	var loginPath=defaultPagePath+'loginPage.html';
	var headerBackBtn=defaultPagePath+'backbtnPage.html';
	var headerCatMsg=defaultPagePath+'categoryMsgPage.html';
	
	if(currentUser==''){
		j('#mainContainer').load(loginPath);
	}else{
		//To check if the page that needs to be displayed is login page. So 'historylength-2'
		var historylength=appPageHistory.length;
		var goToPage=appPageHistory[historylength-2];

		if(goToPage!==null && goToPage==loginPath){
			return 0;
		}else{
			appPageHistory.pop();
			var len=appPageHistory.length;
			var pg=appPageHistory[len-1];
			if(pg=="app/pages/addAnExpense.html" 
				|| pg=="app/pages/addTravelSettlement.html"){
				
				j('#mainHeader').load(headerBackBtn);
			}else if(pg=="app/pages/category.html"){
				
				j('#mainHeader').load(headerCatMsg);
			}
			if(!(pg==null)){ 
				j('#mainContainer').load(pg);
			}
		}
	}
	}
 
function goBackEvent() {
	var currentUser=getUserID();
	var loginPath=defaultPagePath+'loginPage.html';
	var headerBackBtn=defaultPagePath+'backbtnPage.html';
	var headerCatMsg=defaultPagePath+'categoryMsgPage.html';
	
	if(currentUser==''){
		j('#mainContainer').load(loginPath);
	}else{
		//To check if the page that needs to be displayed is login page. So 'historylength-2'
		var historylength=appPageHistory.length;
		var goToPage=appPageHistory[historylength-2];

		if(goToPage!==null && goToPage==loginPath){
			return 0;
		}else{
			appPageHistory.pop();
			var len=appPageHistory.length;
			if(len == 0){
				navigator.app.exitApp();
				//navigator.notification.confirm("Are you sure want to exit from App?", onConfirmExit, "Confirmation", "Yes,No");
			}else{
				var pg=appPageHistory[len-1];
				if(pg=="app/pages/addAnExpense.html"){ 
					
					j('#mainHeader').load(headerBackBtn);
				}else if(pg=="app/pages/category.html"){
					
					j('#mainHeader').load(headerCatMsg);
					forceCloseDropdown();
				}
				if(!(pg==null)){ 
					j('#mainContainer').load(pg);
				}
			}
		}
	}
}

function onConfirmExit(button) {
    if (button == 2) { //If User select a No, then return back;
        return;
    } else {
        navigator.app.exitApp(); // If user select a Yes, quit from the app.
    }
}

  //Local Database Create,Save,Display

  //Test for browser compatibility
if (window.openDatabase) {
	
	//Create the database the parameters are 1. the database name 2.version number 3. a description 4. the size of the database (in bytes) 1024 x 1024 = 1MB
    var mydb = openDatabase("Expenzing", "0.1", "Expenzing", 1024 * 1024);
	//create All tables using SQL for the database using a transaction
	mydb.transaction(function (t) {
		//t.executeSql("CREATE TABLE IF NOT EXISTS employeeDetails (id INTEGER PRIMARY KEY ASC, firstName TEXT, lastName TEXT, gradeId INTEGER, budgetingStatus CHAR(1),unitId INTEGER, status TEXT)");
		t.executeSql("CREATE TABLE IF NOT EXISTS currencyMst (currencyId INTEGER PRIMARY KEY ASC, currencyName TEXT)");
		t.executeSql("CREATE TABLE IF NOT EXISTS accountHeadMst (accountHeadId INTEGER PRIMARY KEY ASC, accHeadName TEXT)");
		t.executeSql("CREATE TABLE IF NOT EXISTS expNameMst (id INTEGER PRIMARY KEY ASC,expNameMstId INTEGER, expName TEXT, expIsFromToReq CHAR(1), accCodeId INTEGER NOT NULL, accHeadId INTEGER NOT NULL, expIsUnitReq CHAR(1), expRatePerUnit Double, expFixedOrVariable CHAR(1), expFixedLimitAmt Double,expPerUnitActiveInative CHAR(1),isErReqd CHAR(1),limitAmountForER Double)");
		t.executeSql("CREATE TABLE IF NOT EXISTS businessExpDetails (busExpId INTEGER PRIMARY KEY ASC, accHeadId INTEGER REFERENCES accountHeadMst(accHeadId), expNameId INTEGER REFERENCES expNameMst(expNameId),expDate DATE, expFromLoc TEXT, expToLoc TEXT, expNarration TEXT, expUnit INTEGER, expAmt Double, currencyId INTEGER REFERENCES currencyMst(currencyId),isEntitlementExceeded TEXT,busExpAttachment BLOB,wayPointunitValue TEXT)");
		t.executeSql("CREATE TABLE IF NOT EXISTS walletMst (walletId INTEGER PRIMARY KEY ASC AUTOINCREMENT, walletAttachment BLOB)");
		t.executeSql("CREATE TABLE IF NOT EXISTS travelModeMst (travelModeId INTEGER PRIMARY KEY ASC, travelModeName TEXT)");
		t.executeSql("CREATE TABLE IF NOT EXISTS travelCategoryMst (travelCategoryId INTEGER PRIMARY KEY ASC, travelCategoryName TEXT,travelModeId INTEGER)");
		t.executeSql("CREATE TABLE IF NOT EXISTS cityTownMst (cityTownId INTEGER PRIMARY KEY ASC, cityTownName TEXT)");
		t.executeSql("CREATE TABLE IF NOT EXISTS travelTypeMst (travelTypeId INTEGER PRIMARY KEY ASC, travelTypeName TEXT)");
		t.executeSql("CREATE TABLE IF NOT EXISTS travelAccountHeadMst (id INTEGER PRIMARY KEY ASC,accHeadId INTEGER, accHeadName TEXT, processId INTEGER)");
		t.executeSql("CREATE TABLE IF NOT EXISTS travelExpenseNameMst (id INTEGER PRIMARY KEY ASC,expenseNameId INTEGER, expenseName TEXT, isModeCategory char(1),accountCodeId INTEGER,accHeadId INTEGER REFERENCES travelAccountHeadMst(accHeadId))");
		t.executeSql("CREATE TABLE IF NOT EXISTS travelSettleExpDetails (tsExpId INTEGER PRIMARY KEY ASC,travelRequestId INTEGER, accHeadId INTEGER REFERENCES travelAccountHeadMst(accHeadId), expNameId INTEGER REFERENCES travelExpenseNameMst(expenseNameId),expDate DATE,expNarration TEXT, expUnit INTEGER, expAmt Double, currencyId INTEGER REFERENCES currencyMst(currencyId),travelModeId INTEGER REFERENCES travelModeMst(travelModeId), travelCategoryId INTEGER REFERENCES travelCategoryMst(travelCategoryId), cityTownId INTEGER REFERENCES cityTownMst(cityTownId),tsExpAttachment BLOB)");
		t.executeSql("CREATE TABLE IF NOT EXISTS travelRequestDetails (travelRequestId INTEGER PRIMARY KEY ASC, travelRequestNo TEXT,title TEXT, accountHeadId INTEGER,travelStartDate DATE,travelEndDate DATE,travelDomOrInter CHAR(1))");
        t.executeSql("CREATE TABLE IF NOT EXISTS travelRequestDetails (travelRequestId INTEGER PRIMARY KEY ASC, travelRequestNo TEXT,title TEXT, accountHeadId INTEGER,travelStartDate DATE,travelEndDate DATE,travelDomOrInter CHAR(1))");
        t.executeSql("CREATE TABLE IF NOT EXISTS accountHeadEAMst (accountHeadId INTEGER PRIMARY KEY ASC, accHeadName TEXT)");
        t.executeSql("CREATE TABLE IF NOT EXISTS advanceType (advancetypeID INTEGER PRIMARY KEY ASC, advancetype TEXT)");
        t.executeSql("CREATE TABLE IF NOT EXISTS employeeAdvanceDetails (empAdvID INTEGER PRIMARY KEY ASC, emplAdvVoucherNo TEXT,empAdvTitle TEXT,Amount Double)");
        t.executeSql("CREATE TABLE IF NOT EXISTS currencyConversionMst (currencyCovId INTEGER PRIMARY KEY ASC, currencyId INTEGER REFERENCES currencyMst(currencyId), defaultcurrencyId INTEGER ,conversionRate Double)");
        t.executeSql("CREATE TABLE IF NOT EXISTS smsMaster (smsId INTEGER PRIMARY KEY ASC, smsText TEXT,senderAddr TEXT,smsSentDate TEXT,smsAmount TEXT)");
		t.executeSql("CREATE TABLE IF NOT EXISTS smsScrutinizerMst (ID INTEGER PRIMARY KEY ASC, filterText TEXT, filterFlag TEXT, status TEXT)");
    });
} else {
    alert(window.lang.translate('WebSQL is not supported by your browser!'));
}

//function to remove a employeeDetails from the database, passed the row id as it's only parameter
function saveBusinessDetails(status){
	exceptionMessage='';
	if (mydb) {
		//get the values of the text inputs
        var exp_date = document.getElementById('expDate').value;
		var exp_from_loc = document.getElementById('expFromLoc').value;
		var exp_to_loc = document.getElementById('expToLoc').value;
		var exp_narration = document.getElementById('expNarration').value;
		var exp_unit = document.getElementById('expUnit').value;
		var way_points = document.getElementById('wayPointunitValue').value;
		var exp_amt = document.getElementById('expAmt').value;
		var entitlement_exceeded=exceptionStatus;
		exceptionStatus="N";
		var acc_head_id;
		var acc_head_val;
		var exp_name_id;
		var exp_name_val;
		var currency_id;
		var currency_val;
		var file;
		if(j("#accountHead").select2('data') != null){
			acc_head_id = j("#accountHead").select2('data').id;
			acc_head_val = j("#accountHead").select2('data').name;
		}else{
			acc_head_id = '-1';
		}
		
		if(j("#expenseName").select2('data') != null){
			exp_name_id = j("#expenseName").select2('data').id;
			exp_name_val = j("#expenseName").select2('data').name;
		}else{
			exp_name_id = '-1';
		}	
		
		if(j("#currency").select2('data') != null){
			currency_id = j("#currency").select2('data').id;
			currency_val = j("#currency").select2('data').name;
		}else{
			currency_id = '-1';
		}
		
		if(fileTempGalleryBE ==undefined || fileTempGalleryBE ==""){
		
		}else{
			file = fileTempGalleryBE;
		}
		
		if(fileTempCameraBE ==undefined || fileTempCameraBE ==""){
		
		}else{
			file = fileTempCameraBE; 
		}
		
		if(validateExpenseDetails(exp_date,exp_from_loc,exp_to_loc,exp_narration,exp_unit,exp_amt,acc_head_id,exp_name_id,currency_id)){
		 
		j('#loading_Cat').show();			  
		  
		  if(file ==undefined){
		  	file="";
			}
			
		  mydb.transaction(function (t) {
				t.executeSql("INSERT INTO businessExpDetails (expDate, accHeadId,expNameId,expFromLoc, expToLoc, expNarration, expUnit,expAmt,currencyId,isEntitlementExceeded,busExpAttachment,wayPointunitValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
											[exp_date,acc_head_id,exp_name_id,exp_from_loc, exp_to_loc,exp_narration,exp_unit,exp_amt,currency_id,entitlement_exceeded,file,way_points]);
								
				if(status == "0"){
				
					document.getElementById('expDate').value ="";
					document.getElementById('expFromLoc').value = "";
					document.getElementById('expToLoc').value = "";
					document.getElementById('expNarration').value = "";
					document.getElementById('expUnit').value ="";
					document.getElementById('expAmt').value = "";
					document.getElementById('wayPointunitValue').value = "";
					smallImageBE.style.display = 'none';
					smallImageBE.src = "";
					j('#errorMsgArea').children('span').text("");
					j('#accountHead').select2('data', '');
					j('#expenseName').select2('data', '');
					//j('#currency').select2('data', '');
					j('#loading_Cat').hide();
                    //j('#syncSuccessMsg').empty();
					document.getElementById("syncSuccessMsg").innerHTML = "Expenses added successfully.";
					j('#syncSuccessMsg').hide().fadeIn('slow').delay(300).fadeOut('slow') ;
					resetImageData();
					//createBusinessExp();
				}else{
					viewBusinessExp();
				}
			});
		
		}else{
			return false;
		}
    } else {
        alert(window.lang.translate('Database not found, your browser does not support web sql!'));
        
    }
}

function saveTravelSettleDetails(status){
	exceptionStatus='N';
	exceptionMessage='';
	
	if (mydb) {
		//get the values of the text inputs
        var exp_date = document.getElementById('expDate').value;
		var exp_narration = document.getElementById('expNarration').value;
		var exp_unit = document.getElementById('expUnit').value;
		var exp_amt = document.getElementById('expAmt').value;
		var travelRequestId;
		var acc_head_val;
		var exp_name_id;
		var exp_name_val;
		var currency_id;
		var currency_val;
		var travelMode_id;
		var travelMode_val;
		var travelCategory_id;
		var travelCategory_val;
		var cityTown_id;
		var cityTown_val;
		var file;
		if(j("#travelRequestName").select2('data') != null){
			travelRequestId = j("#travelRequestName").select2('data').id;
			travelRequestNo = j("#travelRequestName").select2('data').name;
		}else{
			travelRequestId = '-1';
		}
		
		if(j("#travelExpenseName").select2('data') != null){
			exp_name_id = j("#travelExpenseName").select2('data').id;
			exp_name_val = j("#travelExpenseName").select2('data').name;
		}else{
			exp_name_id = '-1';
		}	
		
		if(j("#currency").select2('data') != null){
			currency_id = j("#currency").select2('data').id;
			currency_val = j("#currency").select2('data').name;
		}else{
			currency_id = '-1';
		}
		if(j("#travelModeForTS").select2('data') != null){
			travelMode_id = j("#travelModeForTS").select2('data').id;
			travelMode_val = j("#travelModeForTS").select2('data').name;
		}else{
			travelMode_id = '-1';
		}
		if(j("#travelCategoryForTS").select2('data') != null){
			travelCategory_id = j("#travelCategoryForTS").select2('data').id;
			travelCategory_val = j("#travelCategoryForTS").select2('data').name;
		}else{
			travelCategory_id = '-1';
		}
		if(j("#Citytown").select2('data') != null){
			cityTown_id = j("#Citytown").select2('data').id;
			cityTown_val = j("#Citytown").select2('data').name;
		}else{
			cityTown_id = '-1';
		}	
		if(fileTempGalleryTS ==undefined || fileTempGalleryTS ==""){
		
		}else{
			file = fileTempGalleryTS; 
		}
		
		if(fileTempCameraTS ==undefined || fileTempCameraTS ==""){
		
		}else{
			file = fileTempCameraTS; 
		}
		
		if(validateTSDetails(exp_date,exp_narration,exp_unit,exp_amt,travelRequestId,exp_name_id,currency_id,travelMode_id,travelCategory_id,cityTown_id)){
		j('#loading_Cat').show();
		
		  if(file==undefined){
		   file="";
		  }
		  mydb.transaction(function (t) {
				t.executeSql("INSERT INTO travelSettleExpDetails  (expDate, travelRequestId,expNameId,expNarration, expUnit,expAmt,currencyId,travelModeId,travelCategoryId,cityTownId,tsExpAttachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
											[exp_date,travelRequestId,exp_name_id,exp_narration,exp_unit,exp_amt,currency_id,travelMode_id,travelCategory_id,cityTown_id,file]);
								
				if(status == "0"){
					document.getElementById('expDate').value ="";
					document.getElementById('expNarration').value = "";
					document.getElementById('expUnit').value ="";
					document.getElementById('expAmt').value = "";
					j('#travelRequestName').select2('data', '');
					j('#travelExpenseName').select2('data', '');
					j('#travelModeForTS').select2('data', '');
					j('#travelCategoryForTS').select2('data', '');
					j('#Citytown').select2('data', '');
					j("label[for='startDate']").html("");
					j("label[for='endDate']").html("");
					smallImageTS.style.display = 'none';
					smallImageTS.src = "";
					j('#loading_Cat').hide();
                    //j('#syncSuccessMsg').empty();
					document.getElementById("syncSuccessMsg").innerHTML = "Expenses added successfully.";
					j('#syncSuccessMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
					resetImageData();
				}else{
					viewTravelSettlementExp();
				}
			});
		
		}else{
			return false;
		}
    } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }
}


function create_blob(file, callback) {
			var reader = new FileReader();
			reader.onload = function() { 
							callback(reader.result) ;
			};
			if(typeof file == 'undefined') {
				file = new Blob();
			}
			reader.readAsDataURL(file);
		}
		
var jsonExpenseDetailsArr = [];

function fetchExpenseClaim() {
    
	
	mytable = j('<table></table>').attr({ id: "source",class: ["table","table-striped","table-bordered"].join(' ') });
	var rowThead = j("<thead></thead>").appendTo(mytable);
	var rowTh = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead);
	
	j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Narration From/To Loc").appendTo(rowTh); 	
	j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
	var cols = new Number(5);
	 
	mydb.transaction(function(t) {
		var headerOprationBtn;
      t.executeSql('SELECT * FROM businessExpDetails INNER JOIN expNameMst ON businessExpDetails.expNameId =expNameMst.id INNER JOIN currencyMst ON businessExpDetails.currencyId =currencyMst.currencyId INNER JOIN accountHeadMst ON businessExpDetails.accHeadId =accountHeadMst.accountHeadId;', [],
		 function(transaction, result) {
		  if (result != null && result.rows != null) {
			  
			for (var i = 0; i < result.rows.length; i++) {
				
				var row = result.rows.item(i);
				var shrinkFromTo;
				var newDateFormat = reverseConvertDate(row.expDate.substring(0,2))+"-"+row.expDate.substring(3,5)+" "+row.expDate.substring(6,10); 
				
				if(window.localStorage.getItem("MobileMapRole") == 'true')
				{
					if(row.expFromLoc != '' && row.expToLoc != '')
					{
						var shrinkNarration = row.expNarration.substring(0,row.expNarration.indexOf("--"))
						srinckFromTo = row.expFromLoc.substring(0,row.expFromLoc.indexOf(","))+"/"+row.expToLoc.substring(0,row.expToLoc.indexOf(","));
						srinckFromTo = srinckFromTo.concat("...");
					}
				}
				
				var rowss = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(mytable);
                
                    j('<td></td>').attr({ class: ["expDate"].join(' ') }).html('<p style="color: black;">'+newDateFormat+'</P>').appendTo(rowss);	
		        	j('<td></td>').attr({ class: ["expName"].join(' ') }).html('<p style="color: black;">'+row.expName+'</P>').appendTo(rowss).appendTo(rowss);	
				if(window.localStorage.getItem("MobileMapRole") == 'true')
				{
					if(row.expFromLoc != '' && row.expToLoc != '')
					{
						j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+shrinkNarration+'</br>'+srinckFromTo+ '</P>').appendTo(rowss);
					}
					else
					{
						j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+""+row.expToLoc+ '</P>').appendTo(rowss);
					}
				}
				else
				{
					   if(row.expFromLoc != '' && row.expToLoc != ''){
                    j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+"/"+row.expToLoc+ '</P>').appendTo(rowss);
                    }else{
                    j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+""+row.expToLoc+ '</P>').appendTo(rowss);
                    }
				}
				
				if(row.busExpAttachment.length == 0){
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p style="color: black;">'+row.expAmt+' '+row.currencyName+'</P>').appendTo(rowss); 	
				}else{
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p style="color: black;">'+row.expAmt+' '+row.currencyName+'</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss); 
				}
				j('<td></td>').attr({ class: ["expDate1","displayNone"].join(' ') }).text(row.expDate).appendTo(rowss);
				j('<td></td>').attr({ class: ["expFromLoc1","displayNone"].join(' ') }).text(row.expFromLoc).appendTo(rowss);
				j('<td></td>').attr({ class: ["expToLoc1","displayNone"].join(' ') }).text(row.expToLoc).appendTo(rowss);
				j('<td></td>').attr({ class: ["expNarration1","displayNone"].join(' ') }).text(row.expNarration).appendTo(rowss);
				j('<td></td>').attr({ class: ["expAmt1","displayNone"].join(' ') }).text(row.expAmt).appendTo(rowss);
				j('<td></td>').attr({ class: ["busAttachment","displayNone"].join(' ') }).text(row.busExpAttachment).appendTo(rowss);
				j('<td></td>').attr({ class: ["accHeadId","displayNone"].join(' ') }).text(row.accHeadId).appendTo(rowss);			
				j('<td></td>').attr({ class: ["expNameId","displayNone"].join(' ') }).text(row.expNameMstId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["expUnit","displayNone"].join(' ') }).text(row.expUnit).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["currencyId","displayNone"].join(' ') }).text(row.currencyId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["accountCodeId","displayNone"].join(' ') }).text(row.accCodeId).appendTo(rowss);		
				//j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expName).appendTo(rowss);		
				j('<td></td>').attr({ class: ["busExpId","displayNone"].join(' ') }).text(row.busExpId).appendTo(rowss);
				j('<td></td>').attr({ class: ["isErReqd","displayNone"].join(' ') }).text(row.isErReqd).appendTo(rowss);
				j('<td></td>').attr({ class: ["ERLimitAmt","displayNone"].join(' ') }).text(row.limitAmountForER).appendTo(rowss);
				j('<td></td>').attr({ class: ["isEntitlementExceeded","displayNone"].join(' ') }).text(row.isEntitlementExceeded).appendTo(rowss);
				j('<td></td>').attr({ class: ["wayPoint","displayNone"].join(' ') }).text(row.wayPointunitValue).appendTo(rowss);
			}	
					
			j("#source tr").click(function(){ 
				headerOprationBtn = defaultPagePath+'headerPageForBEOperation.html';
				if(j(this).hasClass("selected")){ 
				var headerBackBtn=defaultPagePath+'headerPageForBEOperation.html';
					j(this).removeClass('selected');
					j('#mainHeader').load(headerBackBtn);
				}else{
				if(j(this).text()=='DateExpense NameNarration From/To LocAmt'){
					
				}else{
					j('#mainHeader').load(headerOprationBtn);
					j(this).addClass('selected');
				}					
				}								
			});
			}
		 });
	 });	 
	 mytable.appendTo("#box");		
    var header = defaultPagePath+'backbtnPage.html';
    j('#mainHeader').load(header);
 }

 function validateAccountHead(accountHeadIdToBeSent,currentAccHeadId){
	if(accountHeadIdToBeSent==""){
		return true;
	}else{
		if(parseFloat(accountHeadIdToBeSent)!=parseFloat(currentAccHeadId)==true){
			
			return false;
		}else{
			return true;
		}
	}
 }


 function fetchTravelSettlementExp() {
	
	mytable = j('<table></table>').attr({ id: "source",class: ["table","table-striped","table-bordered"].join(' ') });
	
	var rowThead = j("<thead></thead>").appendTo(mytable);
	var rowTh = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead);
	
	j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("cityTown").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Narration").appendTo(rowTh);
	
	
	var cols = new Number(4);
	 
	mydb.transaction(function(t) {
		
      t.executeSql('select * from travelSettleExpDetails inner join cityTownMst on cityTownMst.cityTownId = travelSettleExpDetails.cityTownId inner join currencyMst on travelSettleExpDetails.currencyId = currencyMst.currencyId inner join travelExpenseNameMst on travelExpenseNameMst.id = travelSettleExpDetails.expNameId;', [],
		 function(transaction, result) {
		 	
		  if (result != null && result.rows != null) {
			  
			for (var i = 0; i < result.rows.length; i++) {
				
			  var row = result.rows.item(i);
			  
			  var newDateFormat = reverseConvertDate(row.expDate.substring(0,2))+"-"+row.expDate.substring(3,5)+" "+row.expDate.substring(6,10);	  
			  
			  var rowss = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(mytable);
                
              j('<td></td>').attr({ class: ["expDate"].join(' ') }).html('<p style="color: black;">'+newDateFormat+'</P>').appendTo(rowss);	
		       j('<td></td>').attr({ class: ["expenseName"].join(' ') }).html('<p style="color: black;">'+row.expenseName+'</P>').appendTo(rowss).appendTo(rowss);
		
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p style="color: black;">'+row.expAmt+' '+row.currencyName+'</P>').appendTo(rowss);
				j('<td></td>').attr({ class: ["cityTownName"].join(' ') }).html('<p style="color: black;">'+row.cityTownName+'</P>').appendTo(rowss);
				
				if(row.tsExpAttachment.length == 0){
				j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</P>').appendTo(rowss); 	
				}else{
				j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss); 
				}
				j('<td></td>').attr({ class: ["expDate1","displayNone"].join(' ') }).text(row.expDate).appendTo(rowss);
				j('<td></td>').attr({ class: ["expAmt1","displayNone"].join(' ') }).text(row.expAmt).appendTo(rowss);
				j('<td></td>').attr({ class: ["expNarration1","displayNone"].join(' ') }).text(row.expNarration).appendTo(rowss);
				j('<td></td>').attr({ class: ["travelRequestId","displayNone"].join(' ') }).text(row.travelRequestId).appendTo(rowss);
				j('<td></td>').attr({ class: ["tsExpAttachment","displayNone"].join(' ') }).text(row.tsExpAttachment).appendTo(rowss);				
				j('<td></td>').attr({ class: ["expNameId","displayNone"].join(' ') }).text(row.expenseNameId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["expUnit","displayNone"].join(' ') }).text(row.expUnit).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["currencyId","displayNone"].join(' ') }).text(row.currencyId).appendTo(rowss);
				j('<td></td>').attr({ class: ["modeId","displayNone"].join(' ') }).text(row.travelModeId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["categoryId","displayNone"].join(' ') }).text(row.travelCategoryId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["fromcityTownId","displayNone"].join(' ') }).text(row.cityTownId).appendTo(rowss); 				 				
				j('<td></td>').attr({ class: ["accountCodeId","displayNone"].join(' ') }).text(row.accCodeId).appendTo(rowss);		
				j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expenseName).appendTo(rowss);		
				j('<td></td>').attr({ class: ["tsExpId","displayNone"].join(' ') }).text(row.tsExpId).appendTo(rowss);
				j('<td></td>').attr({ class: ["isModeCategory","displayNone"].join(' ') }).text(row.isModeCategory).appendTo(rowss);
				j('<td></td>').attr({ class: ["accountCodeId","displayNone"].join(' ') }).text(row.accountCodeId).appendTo(rowss);				
			}	
					
			j("#source tr").click(function(){
				headerOprationBtn = defaultPagePath+'headerPageForTSOperation.html';
				if(j(this).hasClass("selected")){ 
				var headerBackBtn=defaultPagePath+'headerPageForTSOperation.html';
					j(this).removeClass('selected');
					j('#mainHeader').load(headerBackBtn);
				}else{
					if(j(this).text()=='DateExpense NameAmtcityTownNarration'){
						
					}else{
					j('#mainHeader').load(headerOprationBtn);
					j(this).addClass('selected');
					}
				}								
			});
			}
		 });
	 });	 
	 mytable.appendTo("#box");
    var header = defaultPagePath+'backbtnPage.html';
    j('#mainHeader').load(header);
 }			

function synchronizeBEMasterData() {
	var jsonSentToSync=new Object();
	
	jsonSentToSync["BudgetingStatus"] = window.localStorage.getItem("BudgetingStatus");
	jsonSentToSync["EmployeeId"] = window.localStorage.getItem("EmployeeId");
	jsonSentToSync["GradeId"] = window.localStorage.getItem("GradeID");
	jsonSentToSync["UnitId"] = window.localStorage.getItem("UnitId");
	j('#loading_Cat').show();
	if (mydb) {
		j.ajax({
			  url: window.localStorage.getItem("urlPath")+"SyncAccountHeadWebService",
			  type: 'POST',
			  dataType: 'json',
			  crossDomain: true,
			  data: JSON.stringify(jsonSentToSync),
			  success: function(data) {
				  if(data.Status=='Success'){
					mydb.transaction(function (t) {
					t.executeSql("DELETE FROM accountHeadMst");
					var accountHeadArray = data.AccountHeadArray;
						if(accountHeadArray != null && accountHeadArray.length > 0){
							for(var i=0; i<accountHeadArray.length; i++ ){
								var stateArr = new Array();
								stateArr = accountHeadArray[i];
								var acc_head_id = stateArr.Value;
								var acc_head_name = stateArr.Label;
								t.executeSql("INSERT INTO accountHeadMst (accountHeadId,accHeadName) VALUES (?, ?)", [acc_head_id,acc_head_name]);
								
							}
						}
					});	
					  
					mydb.transaction(function (t) {
					t.executeSql("DELETE FROM expNameMst");
					  var expNameArray = data.ExpenseNameArray;
					  if(expNameArray != null && expNameArray.length > 0){
							for(var i=0; i<expNameArray.length; i++ ){
								var stateArr = new Array();
								stateArr = expNameArray[i];
								var exp_id = stateArr.ExpenseID;
								var exp_name = stateArr.ExpenseName;
								var exp_is_from_to_req = stateArr.IsFromToRequired;
								var acc_code_id = stateArr.AccountCodeId;
								var acc_head_id = stateArr.AccountHeadId;
								var isErReqd;
								var limitAmountForER;
								var exp_is_unit_req;
								var exp_per_unit ;
								var exp_fixed_or_var ;
								var exp_fixed_limit_amt;
								
				
								if(typeof stateArr.FixedOrVariable != 'undefined') {
									exp_fixed_or_var = stateArr.FixedOrVariable;
								}else{
									exp_fixed_or_var = 'V';
								}
								
								if(typeof stateArr.IsUnitRequired != 'undefined') {
									exp_is_unit_req = stateArr.IsUnitRequired;
									if(exp_is_unit_req == 'N')
										exp_fixed_or_var = 'V';
								}else{
									exp_is_unit_req = 'N';
								}
								
								if(typeof stateArr.RatePerUnit != 'undefined') {
									exp_per_unit = stateArr.RatePerUnit;
								}else{
									exp_per_unit = 0.0;
								}
								
								if(typeof stateArr.ActiveInactive != 'undefined') {
									exp_per_unit_active_inactive = stateArr.ActiveInactive;
								}else{
									exp_per_unit_active_inactive = 0;
								}
							
								if(typeof stateArr.FixedLimitAmount != 'undefined') {
									exp_fixed_limit_amt = stateArr.FixedLimitAmount;
								}else{
									exp_fixed_limit_amt = 0.0;
								}
								if(typeof stateArr.IsErReqd != 'undefined') {
									isErReqd = stateArr.IsErReqd;
								}else{
									isErReqd = 'N';
								}
								if(typeof stateArr.LimitAmountForER != 'undefined') {
									limitAmountForER = stateArr.LimitAmountForER;
								}else{
									limitAmountForER = 0.0;
								}
								//console.log("exp_id:"+exp_id+"  -exp_name:"+exp_name+"  -exp_is_from_to_req:"+exp_is_from_to_req+"  -acc_code_id:"+acc_code_id+"  -acc_head_id:"+acc_head_id+"  -exp_is_unit_req:"+exp_is_unit_req+"  -exp_per_unit:"+exp_per_unit+"  -exp_fixed_or_var:"+exp_fixed_or_var+"  -exp_fixed_limit_amt:"+exp_fixed_limit_amt)										
								t.executeSql("INSERT INTO expNameMst ( expNameMstId,expName, expIsFromToReq , accCodeId , accHeadId , expIsUnitReq , expRatePerUnit, expFixedOrVariable , expFixedLimitAmt,expPerUnitActiveInative,isErReqd,limitAmountForER) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?)", [exp_id,exp_name,exp_is_from_to_req, acc_code_id,acc_head_id,exp_is_unit_req,exp_per_unit,exp_fixed_or_var,exp_fixed_limit_amt,exp_per_unit_active_inactive,isErReqd,limitAmountForER]);
							}
						}  
					});
                       
                      		mydb.transaction(function (t) {
					t.executeSql("DELETE FROM currencyConversionMst");
					var currencyConvArray = data.CurrencyConvArray;
						if(currencyConvArray != null && currencyConvArray.length > 0){
							for(var i=0; i<currencyConvArray.length; i++ ){
								var stateArr = new Array();
								stateArr = currencyConvArray[i];
								var currencyCovId = stateArr.currencyCovId;
								var currencyId = stateArr.currencyId;
                                var defaultcurrencyId = stateArr.defaultcurrencyId;
                                var conversionRate = stateArr.conversionRate;
								t.executeSql("INSERT INTO currencyConversionMst (currencyCovId,currencyId,defaultcurrencyId,conversionRate) VALUES (?, ?, ?, ?)", [currencyCovId,currencyId,defaultcurrencyId,conversionRate]);
								
							}
						}
					});	

                      
					j('#loading_Cat').hide(); 
            document.getElementById("syncSuccessMsg").innerHTML = "Business Expenses synchronized successfully.";
              j('#syncSuccessMsg').hide().fadeIn('slow').delay(500).fadeOut('slow');
		 			
				}
				else{
					j('#loading_Cat').hide();
					document.getElementById("syncFailureMsg").innerHTML = "Business Expenses not synchronized successfully.";
					j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
					
				}
					
			  },
			  error:function(data) {
                alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
			  }
			});
			
		j.ajax({
		  url: window.localStorage.getItem("urlPath")+"CurrencyService",
		  type: 'POST',
		  dataType: 'json',
		  crossDomain: true,
		  data: JSON.stringify(jsonSentToSync),
		  success: function(data) {
			  if(data.Status=='Success'){
				var currencyArray = data.CurrencyArray;
				mydb.transaction(function (t) {
				t.executeSql("DELETE FROM currencyMst");
				if(currencyArray != null && currencyArray.length > 0){
					for(var i=0; i<currencyArray.length; i++ ){
						var stateArr = new Array();
						stateArr = currencyArray[i];
						var curr_id = stateArr.Value;
						var curr_name = stateArr.Label;
						t.executeSql("INSERT INTO currencyMst (currencyId,currencyName) VALUES (?, ?)", [curr_id,curr_name]);
						
					}
				}
				});
				j('#loading_Cat').hide();
					document.getElementById("syncFailureMsg").innerHTML = successMsgForCurrency;
					j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
					
				}
				else{
				j('#loading_Cat').hide();
					document.getElementById("syncFailureMsg").innerHTML = "Currency not synchronized successfully.";;
					j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
					
				}	
				
			},
			  error:function(data) {
                alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
			  }
				});	
			
	} else {
       
        alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }
	
}
 
 
 function synchronizeTRMasterData() {
	var jsonSentToSync=new Object();
	j('#loading_Cat').show();
	jsonSentToSync["BudgetingStatus"] = window.localStorage.getItem("BudgetingStatus");
	jsonSentToSync["EmployeeId"] = window.localStorage.getItem("EmployeeId");
	jsonSentToSync["GradeId"] = window.localStorage.getItem("GradeID");
	jsonSentToSync["UnitId"] = window.localStorage.getItem("UnitId");
	
	
	if (mydb) {
		j.ajax({
		  url: window.localStorage.getItem("urlPath")+"SyncTravelAccountHeadWebService",
		  type: 'POST',
		  dataType: 'json',
		  crossDomain: true,
		  data: JSON.stringify(jsonSentToSync),
		  success: function(data) {
				if(data.Status=='Success'){
					  mydb.transaction(function (t) {
						t.executeSql("DELETE FROM travelAccountHeadMst");
						
						var accountHeadArray = data.AccountHeadArray;
						 if(accountHeadArray != null && accountHeadArray.length > 0){
							for(var i=0; i<accountHeadArray.length; i++ ){
								var stateArr = new Array();
								stateArr = accountHeadArray[i];
								var acc_head_id = stateArr.AccountHeadId;
								var acc_head_name = stateArr.AccountHeadName;
								var process_id = stateArr.ProcessId;
								t.executeSql("INSERT INTO travelAccountHeadMst (accHeadId,accHeadName,processId) VALUES (?, ?, ?)", [acc_head_id,acc_head_name,process_id]);
							}
						}
						t.executeSql("DELETE FROM travelExpenseNameMst");
						var expenseNameArray = data.ExpenseHeadArray;
						if(expenseNameArray != null && expenseNameArray.length > 0){
							for(var i=0; i<expenseNameArray.length; i++ ){
								var stateArr = new Array();
								stateArr = expenseNameArray[i];
								var expense_id = stateArr.ExpenseHeadId;
								var expense_name = stateArr.ExpenseHeadName;
								var account_code_id = stateArr.AccountCodeId;
								var is_mode_cotegory = stateArr.isModeCategory;
								var account_head_id = stateArr.AccountHeadId;
								t.executeSql("INSERT INTO travelExpenseNameMst (expenseNameId ,expenseName ,accountCodeId,isModeCategory,accHeadId) VALUES (?, ?, ?, ?,?)", [expense_id,expense_name,account_code_id,is_mode_cotegory,account_head_id]);
							}
						}
					});
					//j('#syncSuccessMsg').empty();
				//document.getElementById("syncSuccessMsg").innerHTML = "Account Head synchronized Successfully.";
				 // j('#syncSuccessMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');

				}else{

					document.getElementById("syncFailureMsg").innerHTML = "Account Head Not synchronized Successfully.";
					j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
				}
			},		
			error:function(data) {
                alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
			}	
				
		});
		
		j.ajax({
			  url: window.localStorage.getItem("urlPath")+"CurrencyService",
			  type: 'POST',
			  dataType: 'json',
			  crossDomain: true,
			  data: JSON.stringify(jsonSentToSync),
			  success: function(data) {
				  if(data.Status=='Success'){
					var currencyArray = data.CurrencyArray;
					mydb.transaction(function (t) {
					t.executeSql("DELETE FROM currencyMst");
					if(currencyArray != null && currencyArray.length > 0){
						for(var i=0; i<currencyArray.length; i++ ){
							var stateArr = new Array();
							stateArr = currencyArray[i];
							var curr_id = stateArr.Value;
							var curr_name = stateArr.Label;
							t.executeSql("INSERT INTO currencyMst (currencyId,currencyName) VALUES (?, ?)", [curr_id,curr_name]);
							
						}
					}
					});
						document.getElementById("syncSuccessMsg").innerHTML = successMsgForCurrency;
						j('#syncSuccessMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
						
					}
					else{
					
						document.getElementById("syncFailureMsg").innerHTML = errorMsgForCurrency;
						j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
						
					}	
					
				},
				  error:function(data) {
                    alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
				  }
					});	
		
		j.ajax({
			  url: window.localStorage.getItem("urlPath")+"SyncTravelMaster",
			  type: 'POST',
			  dataType: 'json',
			  crossDomain: true,
			  data: JSON.stringify(jsonSentToSync),
			  success: function(data) {
				if(data.Status=='Success'){  
				
				// Used to store data when json object is returned in web service.
					mydb.transaction(function (t) {
					t.executeSql("DELETE FROM travelModeMst");
						var modesJSONArray = data.ModesJSONArray;
						if(modesJSONArray != null && modesJSONArray.length > 0){
							for(var i=0; i<modesJSONArray.length; i++ ){
								var stateArr = new Array();
								stateArr = modesJSONArray[i];
								var travel_mode_id = stateArr.TravelModeId;
								var travel_mode_name = stateArr.TravelModeName;
								t.executeSql("INSERT INTO travelModeMst (travelModeId,travelModeName) VALUES (?, ?)", [travel_mode_id,travel_mode_name]);
								
							}
						}
					});
				
					mydb.transaction(function (t) {
						t.executeSql("DELETE FROM cityTownMst");
						var cityTownJSONArray = data.CityTownJSONArray;
						 if(cityTownJSONArray != null && cityTownJSONArray.length > 0){
							for(var i=0; i<cityTownJSONArray.length; i++ ){
								var stateArr = new Array();
								stateArr = cityTownJSONArray[i];
								var citytown_id = stateArr.CityTownId;
								var citytown_name = stateArr.CityTownName;
								t.executeSql("INSERT INTO cityTownMst (cityTownId,cityTownName) VALUES (?, ?)", [citytown_id,citytown_name]);
								
							}
						}
					});
  
					mydb.transaction(function (t) {
					t.executeSql("DELETE FROM travelCategoryMst");
						var categoryJSONArray = data.CategoryJSONArray;
						if(categoryJSONArray != null && categoryJSONArray.length > 0){
							for(var i=0; i<categoryJSONArray.length; i++ ){
								var stateArr = new Array();
								stateArr = categoryJSONArray[i];
								var trabel_category_id = stateArr.TravelCategoryId;
								var travel_category_name = stateArr.TravelCategoryName;
								var trabel_mode_id = stateArr.TravelModeId;
								t.executeSql("INSERT INTO travelCategoryMst (travelCategoryId,travelCategoryName,travelModeId) VALUES (?, ?, ?)", [trabel_category_id,travel_category_name,trabel_mode_id]);
								
							}
						}
					});
				document.getElementById("syncFailureMsg").innerHTML = "Category/CityTown Master synchronized successfully.";
				j('#syncFailureMsg').hide().fadeIn('slow').delay(200).fadeOut('slow');                   
				mydb.transaction(function (t) {
					t.executeSql("DELETE FROM travelTypeMst");
						var travelTypeJSONArray = data.TravelTypeJSONArray;
						if(travelTypeJSONArray != null && travelTypeJSONArray.length > 0){
							for(var i=0; i<travelTypeJSONArray.length; i++ ){
								var stateArr = new Array();
								stateArr = travelTypeJSONArray[i];
								var travel_type_id = stateArr.TravelTypeId;
								var travel_type_name = stateArr.TravelTypeName;
								t.executeSql("INSERT INTO travelTypeMst (travelTypeId,travelTypeName) VALUES (?, ?)", [travel_type_id,travel_type_name]);
								
							}
						}
					});
					j('#loading_Cat').hide();
					
				}else{
					j('#loading_Cat').hide();
					document.getElementById("syncFailureMsg").innerHTML = "Travel Required master Expenses not synchronized successfully.";
					j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
				}
			},
			error:function(data) {
                alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
			}
		});
		
				 
	} else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }
 }
 
 function onloadExpense() {
	if (mydb) {
		mydb.transaction(function (t) {
				t.executeSql("SELECT * FROM accountHeadMst", [], getAccHeadList);
				t.executeSql("SELECT * FROM currencyMst", [], getCurrencyList);
				t.executeSql("SELECT * FROM expNameMst", [], getExpNameList);
			});
	} else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
	}
 }
 
 function getAccHeadList(transaction, results) {
	var i;
	var jsonAccHeadArr = [];
	for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindAccHead = new Object();
		jsonFindAccHead["Label"] = row.accountHeadId;
		jsonFindAccHead["Value"] = row.accHeadName;
		jsonAccHeadArr.push(jsonFindAccHead);
	}
	createAccHeadDropDown(jsonAccHeadArr);
}	 
function getTrAccHeadList(transaction, results) {
	var i;
	var jsonAccHeadArr = [];
	for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindAccHead = new Object();
		jsonFindAccHead["Label"] = row.accHeadId;
		jsonFindAccHead["Value"] = row.accHeadName;
		jsonAccHeadArr.push(jsonFindAccHead);
	}
	createTRAccHeadDropDown(jsonAccHeadArr);
}	
function getExpNameList(transaction, results) {
    var i;
	var jsonExpNameArr = [];
	
	for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindExpNameHead = new Object();

		jsonFindExpNameHead["ExpenseID"] = row.id;
		jsonFindExpNameHead["ExpenseName"] = row.expName;
		
		jsonExpNameArr.push(jsonFindExpNameHead);
	}
	createExpNameDropDown(jsonExpNameArr);
}

function getCurrencyList(transaction, results) {
    var i;
	var jsonCurrencyArr = [];

    for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindCurrHead = new Object();
		jsonFindCurrHead["Value"] = row.currencyId;
		jsonFindCurrHead["Label"] = row.currencyName;
		
		jsonCurrencyArr.push(jsonFindCurrHead);
	}
	createCurrencyDropDown(jsonCurrencyArr)
}	

 function onloadTravelData() {
	if (mydb) {
		mydb.transaction(function (t) {
				t.executeSql("SELECT * FROM travelModeMst", [], fetchTravelModeList);
				t.executeSql("SELECT * FROM travelCategoryMst", [], fetchTrvlCategoryList);
				t.executeSql("SELECT * FROM cityTownMst", [], fetchCityTownList);
				t.executeSql("SELECT * FROM travelTypeMst", [], fetchTrvlTypeList);
				t.executeSql("SELECT * FROM travelAccountHeadMst where processId=3", [], getTrAccHeadList);
			});
	} else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
	}
 }

function fetchTravelModeList(transaction, results) {
    var i;
	var jsonTrvlModeArr = [];
	for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindMode = new Object();
		jsonFindMode["Value"] = row.travelModeId;
		jsonFindMode["Label"] = row.travelModeName;
		
		jsonTrvlModeArr.push(jsonFindMode);
	}
	createTravelModeDown(jsonTrvlModeArr);
}

function fetchTrvlCategoryList(transaction, results) {
    var i;
	var jsonCategoryArr = [];

    for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindCategory = new Object();
		jsonFindCategory["Value"] = row.travelCategoryId;
		jsonFindCategory["Label"] = row.travelCategoryName;
		
		jsonCategoryArr.push(jsonFindCategory);
	}
	createCategoryDropDown(jsonCategoryArr);
}

function fetchCityTownList(transaction, results) {
    var i;
	var jsonCityTownArr = [];

    for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindCityTown = new Object();
		jsonFindCityTown["Value"] = row.cityTownId;
		jsonFindCityTown["Label"] = row.cityTownName;
		
		jsonCityTownArr.push(jsonFindCityTown);
	}
	createCitytownDropDown(jsonCityTownArr);
}

function fetchTrvlTypeList(transaction, results) {
    var i;
	var jsonTravelTypeArr = [];

    for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindTravelType = new Object();
		jsonFindTravelType["Value"] = row.travelTypeId;
		jsonFindTravelType["Label"] = row.travelTypeName;
		
		jsonTravelTypeArr.push(jsonFindTravelType);
	}
	createTravelTypeDropDown(jsonTravelTypeArr)
}


function resetUserSessionDetails(){
	 window.localStorage.removeItem("TrRole");
	 window.localStorage.removeItem("EmployeeId");
	 window.localStorage.removeItem("FirstName");
	 window.localStorage.removeItem("LastName");
	 window.localStorage.removeItem("GradeID");
	 window.localStorage.removeItem("BudgetingStatus");
	 window.localStorage.removeItem("UnitId");	
	 window.localStorage.removeItem("UserName");
	 window.localStorage.removeItem("Password");
	 window.localStorage.removeItem("MobileMapRole");
     window.localStorage.removeItem("EaInMobile");
     window.localStorage.removeItem("multiLangInMobile");
     window.localStorage.removeItem("localLanguage");
	 dropAllTableDetails();
}

function setUserSessionDetails(val,userJSON){
	 window.localStorage.setItem("TrRole",val.TrRole);
	 window.localStorage.setItem("EmployeeId",val.EmpId);
	 window.localStorage.setItem("FirstName",val.FirstName);
	 window.localStorage.setItem("LastName",val.LastName);
	 window.localStorage.setItem("GradeID",val.GradeID);
	 window.localStorage.setItem("BudgetingStatus",val.BudgetingStatus);
	 window.localStorage.setItem("UnitId",val.UnitId);
	 //For Mobile Google Map Role Start
	 //End
     if(!val.hasOwnProperty('MobileMapRole')){
      window.localStorage.setItem("MobileMapRole",false);
    }else{
     window.localStorage.setItem("MobileMapRole",val.MobileMapRole); 
    } 
    //For EA in mobile
    if(!val.hasOwnProperty('EaInMobile')){
      window.localStorage.setItem("EaInMobile",false);
    }else{
     window.localStorage.setItem("EaInMobile",val.EaInMobile); 
    } 
     if(!val.hasOwnProperty('smartClaimsViaSMSOnMobile')){
      window.localStorage.setItem("smartClaimsViaSMSOnMobile",false);
    }else{
     window.localStorage.setItem("smartClaimsViaSMSOnMobile",val.smartClaimsViaSMSOnMobile); 
    } 
    if(!val.hasOwnProperty('multiLangInMobile')){
    window.localStorage.setItem("multiLangInMobile",false);
    }else{
     window.localStorage.setItem("multiLangInMobile",val.multiLangInMobile); 
    } 
    //End
	 window.localStorage.setItem("UserName",userJSON["user"]);
	 window.localStorage.setItem("Password",userJSON["pass"]);
     window.localStorage.setItem("localLanguage",0);
	
}

function setUserStatusInLocalStorage(status){
	window.localStorage.setItem("UserStatus",status);
}
function setUrlPathLocalStorage(url){
	window.localStorage.setItem("urlPath",url);
}
function dropAllTableDetails(){

	mydb.transaction(function(t) {
		t.executeSql("DELETE TABLE currencyMst ");
		t.executeSql("DELETE TABLE accountHeadMst ");
		t.executeSql("DELETE TABLE expNameMst");
		t.executeSql("DELETE TABLE businessExpDetails");
		t.executeSql("DELETE TABLE walletMst");
		t.executeSql("DELETE TABLE travelModeMst");
		t.executeSql("DELETE TABLE travelCategoryMst ");
		t.executeSql("DELETE TABLE cityTownMst");
		t.executeSql("DELETE TABLE travelTypeMst");
		t.executeSql("DELETE TABLE travelAccountHeadMst");
		t.executeSql("DELETE TABLE travelExpenseNameMst");
		t.executeSql("DELETE TABLE travelSettleExpDetails");
		t.executeSql("DELETE TABLE travelRequestDetails");
        
	 });

}

function getUserID() {
	userKey=window.localStorage.getItem("EmployeeId");
	if(userKey==null) return  "";
	else return userKey;
}

function deleteSelectedExpDetails(businessExpDetailId){
			mydb.transaction(function (t) {
				t.executeSql("DELETE FROM businessExpDetails WHERE busExpId=?", [businessExpDetailId]);
			});
	  }

	  function deleteSelectedTSExpDetails(travelSettleExpDetailId){
			mydb.transaction(function (t) {
				t.executeSql("DELETE FROM travelSettleExpDetails WHERE tsExpId=?", [travelSettleExpDetailId]);
			});
	  }
					  
function fetchWalletImage() {
			var rowsWallet;
			mytable = j('<table></table>').attr({ id: "walletSource",class: ["table","table-striped","table-bordered-wallet"].join(' ') });
		 
			mydb.transaction(function(t) {
				
		      t.executeSql('SELECT * FROM walletMst;', [],
				 function(transaction, result) {
					
				if (result != null && result.rows != null) {
					  
					for (var i = 0; i < result.rows.length; i++) {
						
					  var row = result.rows.item(i);						 
					  
							if(i % 2 == 0){
								rowsWallet = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(mytable);  
							}				
							
							j('<td></td>').attr({ class: ["walletattach"].join(' ') }).html('<text style="display: none">'+row.walletAttachment+'</text>'+'<p id="para" style="display: none">'+row.walletId+'</p>'+'<img src="'+row.walletAttachment+'">').appendTo(rowsWallet);
							
					}	
				j("#walletSource td").click(function(){
					headerOprationBtn = defaultPagePath+'headerPageForWalletOperation.html';
					if(j(this).hasClass( "selected")){
							j(this).removeClass('selected');
							j('#mainHeader').load(headerOprationBtn);
						}else{
							j('#mainHeader').load(headerOprationBtn);
							j(this).addClass('selected');					
						}								
					});
				  }		
				});
			});
			 mytable.appendTo("#walletBox");	 
}

function deleteSelectedWallets(walletID){
	mydb.transaction(function (t) {
			t.executeSql("DELETE FROM walletMst WHERE walletId=?", [walletID]);
		});
  }

function saveWalletAttachment(status){
	j('#loading_Cat').show();
	if (mydb) {
		//get the values of the text inputs
      
		var file = document.getElementById('imageWallet').files[0];
		
	if (file != "") {
            mydb.transaction(function (t) {
                t.executeSql("INSERT INTO walletMst (walletAttachment) VALUES (?)", 
											[file]);
                if(status == "0"){
					document.getElementById('imageWallet').value ="";	
					createWallet();					
				}else{
				    createWallet();
				}
			});
            j('#loading_Cat').hide();
        } else {
        	j('#loading_Cat').hide();
            alert(window.lang.translate('You must enter inputs!'));
        }
	} else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }
}



function getExpenseNamesfromDB(accountHeadId){
	j('#errorMsgArea').children('span').text("");
 if (mydb) {
        //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
        mydb.transaction(function (t) {
			t.executeSql("SELECT * FROM expNameMst where accHeadId="+accountHeadId, [], getExpNameList);
		});
    } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }	
}

function getExpenseNamesfromDBTravel(travelRequestId){
 if (mydb) {
        //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
        mydb.transaction(function (t) {
        	t.executeSql("SELECT * FROM travelExpenseNameMst where accHeadId=(select accountHeadId from travelRequestDetails where travelRequestId="+travelRequestId+")", [],fetchTravelExpeseName);
        	//t.executeSql("SELECT * FROM travelExpenseNameMst where travelAccountHeadId="+accountHeadId, [],fetchTravelExpeseName);
			});
    } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }	
}

function getStartEndDatefromDBTravel(travelRequestId){
 if (mydb) {
	     //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
        mydb.transaction(function (t) {
        var result	= t.executeSql("select travelStartDate,travelEndDate from travelRequestDetails where travelRequestId="+travelRequestId, [],fetchTravelStartEndDate);
        	});
    } else {
        alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }	
}

function getCurrencyDBTravel(travelRequestId){
 if (mydb) {
	      //Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
        mydb.transaction(function (t) {
        t.executeSql("select travelDomOrInter from travelRequestDetails where travelRequestId="+travelRequestId, [],fetchTravelDomOrInterDate);
        	
			});
    } else {
        alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }	
}

function onloadTravelSettleData() {
	if (mydb) {
		mydb.transaction(function (t) {
				t.executeSql("SELECT * FROM travelModeMst", [], fetchTravelModeList);
				t.executeSql("SELECT * FROM travelCategoryMst", [], fetchTrvlCategoryList);
				t.executeSql("SELECT * FROM cityTownMst", [], fetchCityTownList);
				t.executeSql("SELECT * FROM travelRequestDetails", [], fetchTravelRequestNumberList);
				t.executeSql("SELECT * FROM travelExpenseNameMst", [], fetchTravelExpeseName);
				t.executeSql("SELECT * FROM currencyMst", [], getCurrencyList);
			});
	} else {
		 alert(window.lang.translate('Database not found, your browser does not support web sql!'));
	}
 }
 
 function fetchTravelExpeseName(transaction, results) {
    var i;
	var jsonExpenseNameArr = [];
    for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindTravelType = new Object();
		jsonFindTravelType["ExpenseNameId"] = row.id;
		jsonFindTravelType["ExpenseName"] = row.expenseName;
		jsonExpenseNameArr.push(jsonFindTravelType);
	}
	createTravelExpenseNameDropDown(jsonExpenseNameArr)
}

function fetchTravelStartEndDate(transaction, results) {
	var monthVal = ""
    var i;
	var jsonExpenseNameArr = [];
    for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		
	}
	$(function() {
		var startDate = row.travelStartDate;
		j("label[for='startDate']").html(startDate);
		var endDate = row.travelEndDate;
		j("label[for='endDate']").html(endDate);
		var startdate_day = startDate.substring(0,2);
		var startdate_month = convertDate(startDate.substring(3,6));
		var startdate_year = startDate.substring(7,11);
		var endDate_day = endDate.substring(0,2);
		var endDate_month = convertDate(endDate.substring(3,6));
		var endDate_year = endDate.substring(7,11);
			var date = new Date();
			var currentMonth = date.getMonth();
			var currentDate = date.getDate();
			var currentYear = date.getFullYear();
			
			$('#expDate').datepicker({
			maxDate: new Date(endDate_year, endDate_month, endDate_day),
			minDate: new Date(startdate_year, startdate_month, startdate_day)
		});
	}); 
}

function fetchTravelDomOrInterDate(transaction, results) {
	var monthVal = ""
    var i;
	var jsonExpenseNameArr = [];
    for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var DomOrInter = row.travelDomOrInter;
		if(DomOrInter == 'D'){ 
			j('#currency').select2('disable');
		}else{ 
		j('#currency').select2('enable');
			if (mydb) { 
		mydb.transaction(function (t) {
		t.executeSql("SELECT * FROM currencyMst", [], getCurrencyList);
		});
		} else {
		 alert(window.lang.translate('Database not found, your browser does not support web sql!'));
	}
		}
	}
	 
}



function getPerUnitFromDB(expenseNameID){
	j('#errorMsgArea').children('span').text("");
	if(mydb) {
 		//Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
        mydb.transaction(function (t) {
			t.executeSql("SELECT * FROM expNameMst where id="+expenseNameID, [], setPerUnitDetails);
		});
    } else {
        alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }	
}

function getModecategoryFromDB(expenseNameID){
	if(mydb) {
 		//Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
        mydb.transaction(function (t) {
			t.executeSql("SELECT * FROM travelExpenseNameMst where id="+expenseNameID, [], setModeCategroyDetails);
		});
    } else {
        alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }	
}

function getCategoryFromDB(modeID){
 if (mydb) {
 		//Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
        mydb.transaction(function (t) {
			t.executeSql("SELECT * FROM travelCategoryMst where travelModeId="+modeID, [], fetchTrvlCategoryList);
		});
    } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }	
}

function synchronizeTRForTS() {
	var jsonSentToSync=new Object();
	jsonSentToSync["EmployeeId"] = window.localStorage.getItem("EmployeeId");
	j('#loading_Cat').show();
	if (mydb) {
 		j.ajax({
			url: window.localStorage.getItem("urlPath")+"FetchTRForTSWebService",
			type: 'POST',
			dataType: 'json',
			crossDomain: true,
			data: JSON.stringify(jsonSentToSync),
			success: function(data) {
				if(data.Status=='Success'){
					  mydb.transaction(function (t) {
						t.executeSql("DELETE FROM travelRequestDetails");
						var travelRequestArray = data.TravelReqJSONArray;
						if(travelRequestArray != null && travelRequestArray.length > 0){
							for(var i=0; i<travelRequestArray.length; i++ ){
								var stateArr = new Array();
								stateArr = travelRequestArray[i];
								var travel_request_id = stateArr.TravelRequestId;
								var travel_request_no = stateArr.TravelRequestNo;
								var title= stateArr.Title;
								var ac_head_id = stateArr.AcHeadId;
								var tr_end_date = stateArr.TravelEndDate;
								var tr_start_date = stateArr.TravelStartDate;
								var tr_DomOrInter = stateArr.TravelDoMOrInter;
								t.executeSql("INSERT INTO travelRequestDetails (travelRequestId,travelRequestNo,title,accountHeadId,travelEndDate,travelStartDate,travelDomOrInter) VALUES (?, ?,?, ?, ?, ?, ?)", [travel_request_id,travel_request_no,title,ac_head_id,tr_end_date,tr_start_date,tr_DomOrInter]);
								
							}
						}						
					});
					onloadTravelSettleData();
					j('#loading_Cat').hide();

				document.getElementById("syncSuccessMsg").innerHTML = "Travel Request Details synchronized successfully.";
				j('#syncSuccessMsg').hide().fadeIn('slow').delay(500).fadeOut('slow');
				}else{
					j('#loading_Cat').hide();
					document.getElementById("syncFailureMsg").innerHTML = "Travel Required Expenses not synchronized successfully.";
					j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
				}
					
			},
			error:function(data) {
				 alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
			}
		});

	} else {
        alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }
 }
 
 function fetchTravelRequestNumberList(transaction, results) {
	 
    var i;
	var jsonExpenseNameArr = [];
    for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindTravelType = new Object();
		jsonFindTravelType["TravelRequestId"] = row.travelRequestId;
		jsonFindTravelType["Title"]=row.title;
		jsonFindTravelType["TravelRequestNumber"] = row.travelRequestNo;
		jsonExpenseNameArr.push(jsonFindTravelType);
	}
	createTravelRequestNoDropDown(jsonExpenseNameArr)
}

 function forceCloseDropdown() {
	    j('#accountHead').select2('close');
		j('#expenseName').select2('close');
		j('#currency').select2('close');
		j('#travelType').select2('close');
		j('#fromCitytown').select2('close');
		j('#toCitytown').select2('close');
		j('#travelMode').select2('close');
		j('#travelCategory').select2('close');
		j('#roundTripMode').select2('close');
		j('#roundTripCategory').select2('close');
		j('#travelRequestName').select2('close');
		j('#travelExpenseName').select2('close');
	}
	
 function showHelpMenu(){
		var headerBackBtn=defaultPagePath+'backbtnPage.html';
    // var pageRef=defaultPagePath+'helpMenuPage.html';
     var pageRef=defaultPagePath+'underConstruction.html';
			j(document).ready(function() {
				j('#mainHeader').load(headerBackBtn);
				j('#mainContainer').load(pageRef);
			});
   appPageHistory.push(pageRef);
	}
	function showBEBRBHelp(){
		var headerBackBtn=defaultPagePath+'backbtnPage.html';
     var pageRef=defaultPagePath+'helpBEBRPage.html';
			j(document).ready(function() {
				j('#mainHeader').load(headerBackBtn);
				j('#mainContainer').load(pageRef);
			});
   appPageHistory.push(pageRef);
	}
	function showTRTSHelp(){
		var headerBackBtn=defaultPagePath+'backbtnPage.html';
     var pageRef=defaultPagePath+'helpTRTSPage.html';
			j(document).ready(function() {
				j('#mainHeader').load(headerBackBtn);
				j('#mainContainer').load(pageRef);
			});
   appPageHistory.push(pageRef);
	}
	function showWalletHelp(){
		var headerBackBtn=defaultPagePath+'backbtnPage.html';
     var pageRef=defaultPagePath+'helpWalletPage.html';
			j(document).ready(function() {
				j('#mainHeader').load(headerBackBtn);
				j('#mainContainer').load(pageRef);
			});
   appPageHistory.push(pageRef);
	}


//applib.js   changes by Dinesh

function synchronizeEAMasterData() {
	var jsonSentToSync=new Object();	
	jsonSentToSync["BudgetingStatus"] = window.localStorage.getItem("BudgetingStatus");
	jsonSentToSync["EmployeeId"] = window.localStorage.getItem("EmployeeId");
	jsonSentToSync["GradeId"] = window.localStorage.getItem("GradeID");
	jsonSentToSync["UnitId"] = window.localStorage.getItem("UnitId");
	j('#loading_Cat').show();
	if (mydb) {
		j.ajax({
			  url: window.localStorage.getItem("urlPath")+"SyncAccountHeadEAWebService",
			  type: 'POST',
			  dataType: 'json',
			  crossDomain: true,
			  data: JSON.stringify(jsonSentToSync),
			  success: function(data) {
				  if(data.Status=='Success'){
					mydb.transaction(function (t) {
					t.executeSql("DELETE FROM accountHeadEAMst");
					var accountHeadArray = data.AccountHeadArray;
						if(accountHeadArray != null && accountHeadArray.length > 0){
							for(var i=0; i<accountHeadArray.length; i++ ){
								var stateArr = new Array();
								stateArr = accountHeadArray[i];
								var acc_head_id = stateArr.Value;
								var acc_head_name = stateArr.Label;
								t.executeSql("INSERT INTO accountHeadEAMst (accountHeadId,accHeadName) VALUES (?, ?)", [acc_head_id,acc_head_name]);
								
							}
						}
					});	
					  
					mydb.transaction(function (t) {
					t.executeSql("DELETE FROM advanceType");
					  var advanceTypeArray = data.AdvanceTypeArray;
					  if(advanceTypeArray != null && advanceTypeArray.length > 0){
							for(var i=0; i<advanceTypeArray.length; i++ ){
								var stateArr = new Array();
								stateArr = advanceTypeArray[i];
								var advTypeId = stateArr.Value;
								var advTypeName = stateArr.Label;
													
								t.executeSql("INSERT INTO advanceType (advancetypeID,advancetype) VALUES ( ?, ?)", [advTypeId,advTypeName]);
							}
						}  
					});
                      	mydb.transaction(function (t) {
					t.executeSql("DELETE FROM employeeAdvanceDetails");
					  var empAdvArray = data.EmpAdvArray;
					  if(empAdvArray != null && empAdvArray.length > 0){
							for(var i=0; i<empAdvArray.length; i++ ){
								var stateArr = new Array();
								stateArr = empAdvArray[i];
								var empAdvId = stateArr.Value;
								var empAdvVoucherNo = stateArr.EmpAdvaucherNo;
                                var empAdvTitle = stateArr.VoucherTitle;
                                var empAdvAmount = stateArr.Amount;
													
								t.executeSql("INSERT INTO employeeAdvanceDetails (empAdvID,emplAdvVoucherNo,empAdvTitle,Amount) VALUES ( ?, ?, ?, ?)", 
                                [empAdvId,empAdvVoucherNo,empAdvTitle,empAdvAmount]);
							}
						}  
					});
                      window.localStorage.setItem("EmpAdvDate",data.EmpAdvDate);
                      window.localStorage.setItem("DefaultAdvType",data.DefaultAdvType);
                      window.localStorage.setItem("DefaultAccontHead",data.DefaultAccontHead);
                      window.localStorage.setItem("DefaultCurrencyName",data.DefaultCurrencyName);
                      
					j('#loading_Cat').hide();
                      
					document.getElementById("syncSuccessMsg").innerHTML = "Employee Advance synchronized successfully.";
					j('#syncSuccessMsg').hide().fadeIn('slow').delay(800).fadeOut('slow');
					
				}
				else{
					j('#loading_Cat').hide();
					document.getElementById("syncFailureMsg").innerHTML = "Employee Advance not synchronized successfully.";
					j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
					
				}
					
			  },
			  error:function(data) {
                alert(window.lang.translate('Error: Oops something is wrong, Please Contact System Administer'));
			  }
			});
  }
}



//applib.js   changes by Dinesh end


//amit applib.js changes start
function onloadEAData() {
	var EmpAdvDate =  window.localStorage.getItem("EmpAdvDate");
	document.getElementById("empAdvDate").value = EmpAdvDate;
    
	if (mydb) {
		mydb.transaction(function (t) {
	            t.executeSql("SELECT * FROM advanceType", [], fetchAdvanceTypeList);
				t.executeSql("SELECT * FROM accountHeadEAMst", [], fetchAccountHeadList);
			});
	} else {
		 alert(window.lang.translate('Database not found, your browser does not support web sql!'));
	}
 }

function fetchAdvanceTypeList(transaction, results) {
    var i;
	var jsonAdvanceTypeArr = [];
	for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindAdvanceType = new Object();
		jsonFindAdvanceType["Value"] = row.advancetypeID;
		jsonFindAdvanceType["Label"] = row.advancetype;
		
		jsonAdvanceTypeArr.push(jsonFindAdvanceType);
	}
	createAdvanceTypeDropDown(jsonAdvanceTypeArr)
}

function getAdvanceTypeFromDB(AdvancetypeID){
 if (mydb) {
 		//Get all the employeeDetails from the database with a select statement, set outputEmployeeDetails as the callback function for the executeSql command
        mydb.transaction(function (t) {
			t.executeSql("SELECT * FROM advanceType where advancetypeID="+AdvancetypeID, [], fetchAdvanceTypeList);
		});
    } else {
         alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }	
}

function fetchAccountHeadList(transaction, results) {
    var i;
	var jsonAccountHeadArr = [];
	for (i = 0; i < results.rows.length; i++) {
        var row = results.rows.item(i);
		var jsonFindAccountHead = new Object();
		jsonFindAccountHead["Value"] = row.accountHeadId;
		jsonFindAccountHead["Label"] = row.accHeadName;
		
		jsonAccountHeadArr.push(jsonFindAccountHead);
	}
	createAccountHeadDropDown(jsonAccountHeadArr)
}

function getAccountHeadFromDB(AccountHeadID){
 if (mydb) {
        mydb.transaction(function (t) {
			t.executeSql("SELECT * FROM accountHeadEAMst where accountHeadId="+AccountHeadID, [], fetchAccountHeadList);
		});
    } else {
        alert(window.lang.translate('Database not found, your browser does not support web sql!'));
    }	
}

function populateEATitle(){
    
       var EmpAdvDate = document.getElementById("empAdvDate").value;
       var EmpAdvType = j("#empAdvType").select2('data').name;
    
    document.getElementById("empAdvTitle").value = EmpAdvType+'/'+EmpAdvDate;
    
}

function fetchEmployeeAdvance() {
  mytable = j('<table></table>').attr({ id: "source",class: ["table","table-striped","table-bordered"].join(' ') });
	var rowThead = j("<thead></thead>").appendTo(mytable);
	var rowTh = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead);
	
	j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Narration From/To Loc").appendTo(rowTh); 	
	j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
	var cols = new Number(5);
	 
	mydb.transaction(function(t) {
		var headerOprationBtn;
      t.executeSql('SELECT * FROM businessExpDetails INNER JOIN expNameMst ON businessExpDetails.expNameId =expNameMst.id INNER JOIN currencyMst ON businessExpDetails.currencyId =currencyMst.currencyId  INNER JOIN currencyConversionMst ON businessExpDetails.currencyId = currencyConversionMst.currencyId INNER JOIN accountHeadMst ON businessExpDetails.accHeadId =accountHeadMst.accountHeadId;', [],
		 function(transaction, result) {
		  if (result != null && result.rows != null) {
			  
			for (var i = 0; i < result.rows.length; i++) {
				
				var row = result.rows.item(i);
				var shrinkFromTo;
				var newDateFormat = reverseConvertDate(row.expDate.substring(0,2))+"-"+row.expDate.substring(3,5)+" "+row.expDate.substring(6,10); 
				
				if(window.localStorage.getItem("MobileMapRole") == 'true')
				{
					if(row.expFromLoc != '' && row.expToLoc != '')
					{
						var shrinkNarration = row.expNarration.substring(0,row.expNarration.indexOf("--"))
						srinckFromTo = row.expFromLoc.substring(0,row.expFromLoc.indexOf(","))+"/"+row.expToLoc.substring(0,row.expToLoc.indexOf(","));
						srinckFromTo = srinckFromTo.concat("...");
					}
				}
				
				var rowss = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(mytable);
				    j('<td></td>').attr({ class: ["expDate"].join(' ') }).html('<p style="color: black;">'+newDateFormat+'</P>').appendTo(rowss);	
		        	j('<td></td>').attr({ class: ["expName"].join(' ') }).html('<p style="color: black;">'+row.expName+'</P>').appendTo(rowss).appendTo(rowss);	
				if(window.localStorage.getItem("MobileMapRole") == 'true')
				{
					if(row.expFromLoc != '' && row.expToLoc != '')
					{
						j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+shrinkNarration+'</br>'+srinckFromTo+ '</P>').appendTo(rowss);
					}
					else
					{
						j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+""+row.expToLoc+ '</P>').appendTo(rowss);
					}
				}
				else
				{
                      if(row.expFromLoc != '' && row.expToLoc != ''){
                    j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+"/"+row.expToLoc+ '</P>').appendTo(rowss);
                    }else{
                    j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+""+row.expToLoc+ '</P>').appendTo(rowss);
                        }

				}
				
				if(row.busExpAttachment.length == 0){
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p style="color: black;">'+row.expAmt+' '+row.currencyName+'</P>').appendTo(rowss); 	
				}else{
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p style="color: black;">'+row.expAmt+' '+row.currencyName+'</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss); 
				}
				j('<td></td>').attr({ class: ["expDate1","displayNone"].join(' ') }).text(row.expDate).appendTo(rowss);
				j('<td></td>').attr({ class: ["expFromLoc1","displayNone"].join(' ') }).text(row.expFromLoc).appendTo(rowss);
				j('<td></td>').attr({ class: ["expToLoc1","displayNone"].join(' ') }).text(row.expToLoc).appendTo(rowss);
				j('<td></td>').attr({ class: ["expNarration1","displayNone"].join(' ') }).text(row.expNarration).appendTo(rowss);
				j('<td></td>').attr({ class: ["expAmt1","displayNone"].join(' ') }).text(row.expAmt).appendTo(rowss);
				j('<td></td>').attr({ class: ["busAttachment","displayNone"].join(' ') }).text(row.busExpAttachment).appendTo(rowss);
				j('<td></td>').attr({ class: ["accHeadId","displayNone"].join(' ') }).text(row.accHeadId).appendTo(rowss);			
				j('<td></td>').attr({ class: ["expNameId","displayNone"].join(' ') }).text(row.expNameMstId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["expUnit","displayNone"].join(' ') }).text(row.expUnit).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["currencyId","displayNone"].join(' ') }).text(row.currencyId).appendTo(rowss);
                j('<td></td>').attr({ class: ["conversionRate","displayNone"].join(' ') }).text(row.conversionRate).appendTo(rowss); 
				j('<td></td>').attr({ class: ["accountCodeId","displayNone"].join(' ') }).text(row.accCodeId).appendTo(rowss);		
				//j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expName).appendTo(rowss);		
				j('<td></td>').attr({ class: ["busExpId","displayNone"].join(' ') }).text(row.busExpId).appendTo(rowss);
				j('<td></td>').attr({ class: ["isErReqd","displayNone"].join(' ') }).text(row.isErReqd).appendTo(rowss);
				j('<td></td>').attr({ class: ["ERLimitAmt","displayNone"].join(' ') }).text(row.limitAmountForER).appendTo(rowss);
				j('<td></td>').attr({ class: ["isEntitlementExceeded","displayNone"].join(' ') }).text(row.isEntitlementExceeded).appendTo(rowss);
				j('<td></td>').attr({ class: ["wayPoint","displayNone"].join(' ') }).text(row.wayPointunitValue).appendTo(rowss);
			}	
					
			j("#source tr").click(function(){ 
				headerOprationBtn = defaultPagePath+'headerPageForBEOperation.html';
				if(j(this).hasClass("selected")){;
				var headerBackBtn=defaultPagePath+'headerPageForBEOperation.html';
					j(this).removeClass('selected');
                    populateBEAmount();
					j('#mainHeader').load(headerBackBtn);
				}else{                    
				if(j(this).text()=='DateExpense NameNarration From/To LocAmt'){

				}else{  
					j('#mainHeader').load(headerOprationBtn);
					j(this).addClass('selected');
                    populateBEAmount();
				}					
				}								
			});
			}
		 });
	 });	 
	 mytable.appendTo("#box");
	
	mainTable = j('<table></table>').attr({class: ["table","table-striped","table-bordered"].join(' ') });
    table1 = j('<table></table>').attr({ class: ["table","table1","table-striped","table-bordered"].join(' ') }).appendTo(mainTable);
   var rowThead = j("<thead></thead>").appendTo(table1);
	var rowTh = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead);
	
	j('<th lang=\'en\'></th>').text("Voucher No.").appendTo(rowTh);
	//j('<th></th>').text("Title").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Amount").appendTo(rowTh);
	 
    table2 = j('<table></table>').attr({ id: "source1",class:["table","table-striped","table-bordered"].join(' ') }).appendTo(mainTable);
    var rowThead1 = j("<thead></thead>").appendTo(table2);
	mydb.transaction(function(t) {
		var headerOprationBtn;
      t.executeSql('SELECT * FROM employeeAdvanceDetails;', [],
		 function(transaction, result) {
		  if (result != null && result.rows != null) {
			  
			for (var i = 0; i < result.rows.length; i++) {
				
				var row = result.rows.item(i);
		
				var rowss = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead1);
		
              j('<td></td>').attr({ class: ["empAdvID","displayNone"].join(' ') }).text(row.empAdvID).appendTo(rowss);
		      j('<td></td>').attr({ class: ["emplAdvVoucherNo"].join(' ')
                                  }).text(row.emplAdvVoucherNo).appendTo(rowss);	
              j('<td></td>').attr({ class: ["empAdvTitle","displayNone"].join(' ') }).text(row.empAdvTitle).appendTo(rowss);
              j('<td></td>').attr({ class: ["Amount"].join(' ') }).text(row.Amount).appendTo(rowss);
            }
              $("#header tr").click(function() {
                 $("tr").attr('onclick', '');
               });
					
			j("#source1 tr").click(function(){ 
				if(j(this).hasClass("selected")){
					j(this).removeClass('selected');
                    populateEAAmount();
                    calculateAmount();
				}else{
					j(this).addClass('selected');
                    populateEAAmount();
                    calculateAmount();
				}								
			});
			}
		 });
	 });	 
	 mainTable.appendTo("#box1");
    var header = defaultPagePath+'backbtnPage.html';
    j('#mainHeader').load(header);
 }


function deleteSelectedEmplAdv(employeeAdvDetailId){
			mydb.transaction(function (t) {
				t.executeSql("DELETE FROM employeeAdvanceDetails WHERE empAdvID=?", [employeeAdvDetailId]);
			});
	  }

 function showSyncMaster(){
		var headerBackBtn=defaultPagePath+'backbtnPage.html';
     var pageRef=defaultPagePath+'syncMaster.html';
			j(document).ready(function() {
				j('#mainHeader').load(headerBackBtn);
				j('#mainContainer').load(pageRef);
			});
   appPageHistory.push(pageRef);
	}

function fetchBusinessExpNdEmployeeAdv() {
  j('#source').remove();
  mytable = j('<table></table>').attr({ id: "source",class: ["table","table-striped","table-bordered"].join(' ') });
	var rowThead = j("<thead></thead>").appendTo(mytable);
	var rowTh = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead);
	
	j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Narration From/To Loc").appendTo(rowTh); 	
	j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
	var cols = new Number(5);
	 
	mydb.transaction(function(t) {
		var headerOprationBtn;
      t.executeSql('SELECT * FROM businessExpDetails INNER JOIN expNameMst ON businessExpDetails.expNameId =expNameMst.id INNER JOIN currencyMst ON businessExpDetails.currencyId =currencyMst.currencyId  INNER JOIN currencyConversionMst ON businessExpDetails.currencyId = currencyConversionMst.currencyId INNER JOIN accountHeadMst ON businessExpDetails.accHeadId =accountHeadMst.accountHeadId;', [],
		 function(transaction, result) {
		  if (result != null && result.rows != null) {
			  
			for (var i = 0; i < result.rows.length; i++) {
				
				var row = result.rows.item(i);
				var shrinkFromTo;
				var newDateFormat = reverseConvertDate(row.expDate.substring(0,2))+"-"+row.expDate.substring(3,5)+" "+row.expDate.substring(6,10); 
				
				if(window.localStorage.getItem("MobileMapRole") == 'true')
				{
					if(row.expFromLoc != '' && row.expToLoc != '')
					{
						var shrinkNarration = row.expNarration.substring(0,row.expNarration.indexOf("--"))
						srinckFromTo = row.expFromLoc.substring(0,row.expFromLoc.indexOf(","))+"/"+row.expToLoc.substring(0,row.expToLoc.indexOf(","));
						srinckFromTo = srinckFromTo.concat("...");
					}
				}
				
				var rowss = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(mytable);
                    j('<td></td>').attr({ class: ["expDate"].join(' ') }).html('<p style="color: black;">'+newDateFormat+'</P>').appendTo(rowss);	
		        	j('<td></td>').attr({ class: ["expName"].join(' ') }).html('<p style="color: black;">'+row.expName+'</P>').appendTo(rowss).appendTo(rowss);
			
				if(window.localStorage.getItem("MobileMapRole") == 'true')
				{
					if(row.expFromLoc != '' && row.expToLoc != '')
					{
						j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p>'+shrinkNarration+'</br>'+srinckFromTo+ '</P>').appendTo(rowss);
					}
					else
					{
						j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p>'+row.expNarration+'</br>'+row.expFromLoc+""+row.expToLoc+ '</P>').appendTo(rowss);
					}
				}
				else
				{
				   if(row.expFromLoc != '' && row.expToLoc != ''){
                    j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+"/"+row.expToLoc+ '</P>').appendTo(rowss);
                    }else{
                    j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+""+row.expToLoc+ '</P>').appendTo(rowss);
                    }
				}
				
				if(row.busExpAttachment.length == 0){
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p>'+row.expAmt+' '+row.currencyName+'</P>').appendTo(rowss); 	
				}else{
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p>'+row.expAmt+' '+row.currencyName+'</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss); 
				}
				j('<td></td>').attr({ class: ["expDate1","displayNone"].join(' ') }).text(row.expDate).appendTo(rowss);
				j('<td></td>').attr({ class: ["expFromLoc1","displayNone"].join(' ') }).text(row.expFromLoc).appendTo(rowss);
				j('<td></td>').attr({ class: ["expToLoc1","displayNone"].join(' ') }).text(row.expToLoc).appendTo(rowss);
				j('<td></td>').attr({ class: ["expNarration1","displayNone"].join(' ') }).text(row.expNarration).appendTo(rowss);
				j('<td></td>').attr({ class: ["expAmt1","displayNone"].join(' ') }).text(row.expAmt).appendTo(rowss);
				j('<td></td>').attr({ class: ["busAttachment","displayNone"].join(' ') }).text(row.busExpAttachment).appendTo(rowss);
				j('<td></td>').attr({ class: ["accHeadId","displayNone"].join(' ') }).text(row.accHeadId).appendTo(rowss);			
				j('<td></td>').attr({ class: ["expNameId","displayNone"].join(' ') }).text(row.expNameMstId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["expUnit","displayNone"].join(' ') }).text(row.expUnit).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["currencyId","displayNone"].join(' ') }).text(row.currencyId).appendTo(rowss);
                j('<td></td>').attr({ class: ["conversionRate","displayNone"].join(' ') }).text(row.conversionRate).appendTo(rowss); 
				j('<td></td>').attr({ class: ["accountCodeId","displayNone"].join(' ') }).text(row.accCodeId).appendTo(rowss);		
				//j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expName).appendTo(rowss);		
				j('<td></td>').attr({ class: ["busExpId","displayNone"].join(' ') }).text(row.busExpId).appendTo(rowss);
				j('<td></td>').attr({ class: ["isErReqd","displayNone"].join(' ') }).text(row.isErReqd).appendTo(rowss);
				j('<td></td>').attr({ class: ["ERLimitAmt","displayNone"].join(' ') }).text(row.limitAmountForER).appendTo(rowss);
				j('<td></td>').attr({ class: ["isEntitlementExceeded","displayNone"].join(' ') }).text(row.isEntitlementExceeded).appendTo(rowss);
				j('<td></td>').attr({ class: ["wayPoint","displayNone"].join(' ') }).text(row.wayPointunitValue).appendTo(rowss);
			}	
					
			j("#source tr").click(function(){ 
				headerOprationBtn = defaultPagePath+'headerPageForBEOperation.html';
				if(j(this).hasClass("selected")){
					j(this).removeClass('selected');
                    populateBEAmount();
					j('#mainHeader').load(headerOprationBtn);
				}else{                    
				if(j(this).text()=='DateExpense NameNarration From/To LocAmt'){

				}else{
					j(this).addClass('selected');
                    populateBEAmount();
                    j('#mainHeader').load(headerOprationBtn);
				}					
				}								
			});
			}
		 });
	 });	 
	 mytable.appendTo("#box");
	j('#abc').remove();
	mainTable = j('<table></table>').attr({id :"abc" ,class: ["table","table-striped","table-bordered"].join(' ') });
    table1 = j('<table></table>').attr({ class: ["table","table1","table-striped","table-bordered"].join(' ') }).appendTo(mainTable);
   var rowThead = j("<thead></thead>").appendTo(table1);
	var rowTh = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead);
	
	j('<th lang=\'en\' ></th>').text("Voucher No.").appendTo(rowTh);
	//j('<th></th>').text("Title").appendTo(rowTh);
	j('<th lang=\'en\' ></th>').text("Amount").appendTo(rowTh);
	 
    table2 = j('<table></table>').attr({ id: "source1",class:["table","table-striped","table-bordered"].join(' ') }).appendTo(mainTable);
    var rowThead1 = j("<thead></thead>").appendTo(table2);
	mydb.transaction(function(t) {
		var headerOprationBtn;
      t.executeSql('SELECT * FROM employeeAdvanceDetails;', [],
		 function(transaction, result) {
		  if (result != null && result.rows != null) {
			  
			for (var i = 0; i < result.rows.length; i++) {
				
				var row = result.rows.item(i);
		
				var rowss = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead1);
		
              j('<td></td>').attr({ class: ["empAdvID","displayNone"].join(' ') }).text(row.empAdvID).appendTo(rowss);
		      j('<td></td>').attr({ class: ["emplAdvVoucherNo"].join(' ')
                                  }).text(row.emplAdvVoucherNo).appendTo(rowss);	
              j('<td></td>').attr({ class: ["empAdvTitle","displayNone"].join(' ') }).text(row.empAdvTitle).appendTo(rowss);
              j('<td></td>').attr({ class: ["Amount"].join(' ') }).text(row.Amount).appendTo(rowss);
            }
              $("#header tr").click(function() {
                 $("tr").attr('onclick', '');
               });
					
			j("#source1 tr").click(function(){ 
				if(j(this).hasClass("selected")){
					j(this).removeClass('selected');
                    populateEAAmount();
                    calculateAmount();
				}else{
					j(this).addClass('selected');
                    populateEAAmount();
                    calculateAmount();
				}								
			});
			}
		 });
	 });	 
	 mainTable.appendTo("#box1");
    var header = defaultPagePath+'backbtnPage.html';
    j('#mainHeader').load(header);
 }


function fetchExpenseClaimFromMain() {
 j('#source').remove();
	mytable = j('<table></table>').attr({ id: "source",class: ["table","table-striped","table-bordered"].join(' ') });
	var rowThead = j("<thead></thead>").appendTo(mytable);
	var rowTh = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead);
	
	j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Narration From/To Loc").appendTo(rowTh); 	
	j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
	var cols = new Number(5);
	 
	mydb.transaction(function(t) {
		var headerOprationBtn;
      t.executeSql('SELECT * FROM businessExpDetails INNER JOIN expNameMst ON businessExpDetails.expNameId =expNameMst.id INNER JOIN currencyMst ON businessExpDetails.currencyId =currencyMst.currencyId INNER JOIN accountHeadMst ON businessExpDetails.accHeadId =accountHeadMst.accountHeadId;', [],
		 function(transaction, result) {
		  if (result != null && result.rows != null) {
			  
			for (var i = 0; i < result.rows.length; i++) {
				
				var row = result.rows.item(i);
				var shrinkFromTo;
				var newDateFormat = reverseConvertDate(row.expDate.substring(0,2))+"-"+row.expDate.substring(3,5)+" "+row.expDate.substring(6,10); 
				
				if(window.localStorage.getItem("MobileMapRole") == 'true')
				{
					if(row.expFromLoc != '' && row.expToLoc != '')
					{
						var shrinkNarration = row.expNarration.substring(0,row.expNarration.indexOf("--"))
						srinckFromTo = row.expFromLoc.substring(0,row.expFromLoc.indexOf(","))+"/"+row.expToLoc.substring(0,row.expToLoc.indexOf(","));
						srinckFromTo = srinckFromTo.concat("...");
					}
				}
				
				var rowss = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(mytable);
		
		        	j('<td></td>').attr({ class: ["expDate"].join(' ') }).html('<p style="color: black;">'+newDateFormat+'</P>').appendTo(rowss);	
		        	j('<td></td>').attr({ class: ["expName"].join(' ') }).html('<p style="color: black;">'+row.expName+'</P>').appendTo(rowss).appendTo(rowss);	
				if(window.localStorage.getItem("MobileMapRole") == 'true')
				{
					if(row.expFromLoc != '' && row.expToLoc != '')
					{
						j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+shrinkNarration+'</br>'+srinckFromTo+ '</P>').appendTo(rowss);
					}
					else
					{
						j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+""+row.expToLoc+ '</P>').appendTo(rowss);
					}
				}
				else
				{
				   if(row.expFromLoc != '' && row.expToLoc != ''){
                    j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+"/"+row.expToLoc+ '</P>').appendTo(rowss);
                    }else{
                    j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p style="color: black;">'+row.expNarration+'</br>'+row.expFromLoc+""+row.expToLoc+ '</P>').appendTo(rowss);
                    }
				}
				
				if(row.busExpAttachment.length == 0){
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p style="color: black;">'+row.expAmt+' '+row.currencyName+'</P>').appendTo(rowss); 	
				}else{
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p style="color: black;">'+row.expAmt+' '+row.currencyName+'</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss); 
				}
				j('<td></td>').attr({ class: ["expDate1","displayNone"].join(' ') }).text(row.expDate).appendTo(rowss);
				j('<td></td>').attr({ class: ["expFromLoc1","displayNone"].join(' ') }).text(row.expFromLoc).appendTo(rowss);
				j('<td></td>').attr({ class: ["expToLoc1","displayNone"].join(' ') }).text(row.expToLoc).appendTo(rowss);
				j('<td></td>').attr({ class: ["expNarration1","displayNone"].join(' ') }).text(row.expNarration).appendTo(rowss);
				j('<td></td>').attr({ class: ["expAmt1","displayNone"].join(' ') }).text(row.expAmt).appendTo(rowss);
				j('<td></td>').attr({ class: ["busAttachment","displayNone"].join(' ') }).text(row.busExpAttachment).appendTo(rowss);
				j('<td></td>').attr({ class: ["accHeadId","displayNone"].join(' ') }).text(row.accHeadId).appendTo(rowss);			
				j('<td></td>').attr({ class: ["expNameId","displayNone"].join(' ') }).text(row.expNameMstId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["expUnit","displayNone"].join(' ') }).text(row.expUnit).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["currencyId","displayNone"].join(' ') }).text(row.currencyId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["accountCodeId","displayNone"].join(' ') }).text(row.accCodeId).appendTo(rowss);		
				//j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expName).appendTo(rowss);		
				j('<td></td>').attr({ class: ["busExpId","displayNone"].join(' ') }).text(row.busExpId).appendTo(rowss);
				j('<td></td>').attr({ class: ["isErReqd","displayNone"].join(' ') }).text(row.isErReqd).appendTo(rowss);
				j('<td></td>').attr({ class: ["ERLimitAmt","displayNone"].join(' ') }).text(row.limitAmountForER).appendTo(rowss);
				j('<td></td>').attr({ class: ["isEntitlementExceeded","displayNone"].join(' ') }).text(row.isEntitlementExceeded).appendTo(rowss);
				j('<td></td>').attr({ class: ["wayPoint","displayNone"].join(' ') }).text(row.wayPointunitValue).appendTo(rowss);
			}	
					
			j("#source tr").click(function(){ 
				headerOprationBtn = defaultPagePath+'headerPageForBEOperation.html';
				if(j(this).hasClass("selected")){ 
					j(this).removeClass('selected');
					j('#mainHeader').load(headerOprationBtn);
				}else{
				if(j(this).text()=='DateExpense NameNarration From/To LocAmt'){
					
				}else{
					j('#mainHeader').load(headerOprationBtn);
					j(this).addClass('selected');
				}					
				}								
			});
			}
		 });
	 });	 
	 mytable.appendTo("#box");	
    var header = defaultPagePath+'backbtnPage.html';
    j('#mainHeader').load(header);
 }

function fetchTravelSettlementExpFromMain() {
	j('#source').remove();
	mytable = j('<table></table>').attr({ id: "source",class: ["table","table-striped","table-bordered"].join(' ') });
	
	var rowThead = j("<thead></thead>").appendTo(mytable);
	var rowTh = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead);
	
	j('<th lang=\'en\'></th>').text("Date").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Expense Name").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Amt").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("cityTown").appendTo(rowTh);
	j('<th lang=\'en\'></th>').text("Narration").appendTo(rowTh);
	
    var cols = new Number(4);
	 
	mydb.transaction(function(t) {
		
      t.executeSql('select * from travelSettleExpDetails inner join cityTownMst on cityTownMst.cityTownId = travelSettleExpDetails.cityTownId inner join currencyMst on travelSettleExpDetails.currencyId = currencyMst.currencyId inner join travelExpenseNameMst on travelExpenseNameMst.id = travelSettleExpDetails.expNameId;', [],
		 function(transaction, result) {
		 	
		  if (result != null && result.rows != null) {
			  
			for (var i = 0; i < result.rows.length; i++) {
				
			  var row = result.rows.item(i);
			  
			  var newDateFormat = reverseConvertDate(row.expDate.substring(0,2))+"-"+row.expDate.substring(3,5)+" "+row.expDate.substring(6,10);	  
			  
			  var rowss = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(mytable);
                
                j('<td></td>').attr({ class: ["expDate"].join(' ') }).html('<p style="color: black;">'+newDateFormat+'</P>').appendTo(rowss);	
		        j('<td></td>').attr({ class: ["expenseName"].join(' ') }).html('<p style="color: black;">'+row.expenseName+'</P>').appendTo(rowss).appendTo(rowss);	
				j('<td></td>').attr({ class: ["expAmt"].join(' ') }).html('<p>'+row.expAmt+' '+row.currencyName+'</P>').appendTo(rowss);
				j('<td></td>').attr({ class: ["cityTownName"].join(' ') }).html('<p style="color: black;">'+row.cityTownName+'</P>').appendTo(rowss);
				
				if(row.tsExpAttachment.length == 0){
				j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p>'+row.expNarration+'</P>').appendTo(rowss); 	
				}else{
				j('<td></td>').attr({ class: ["expNarration"].join(' ') }).html('<p>'+row.expNarration+'</P><img src="images/attach.png" width="25px" height="25px">').appendTo(rowss); 
				}
				j('<td></td>').attr({ class: ["expDate1","displayNone"].join(' ') }).text(row.expDate).appendTo(rowss);
				j('<td></td>').attr({ class: ["expAmt1","displayNone"].join(' ') }).text(row.expAmt).appendTo(rowss);
				j('<td></td>').attr({ class: ["expNarration1","displayNone"].join(' ') }).text(row.expNarration).appendTo(rowss);
				j('<td></td>').attr({ class: ["travelRequestId","displayNone"].join(' ') }).text(row.travelRequestId).appendTo(rowss);
				j('<td></td>').attr({ class: ["tsExpAttachment","displayNone"].join(' ') }).text(row.tsExpAttachment).appendTo(rowss);				
				j('<td></td>').attr({ class: ["expNameId","displayNone"].join(' ') }).text(row.expenseNameId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["expUnit","displayNone"].join(' ') }).text(row.expUnit).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["currencyId","displayNone"].join(' ') }).text(row.currencyId).appendTo(rowss);
				j('<td></td>').attr({ class: ["modeId","displayNone"].join(' ') }).text(row.travelModeId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["categoryId","displayNone"].join(' ') }).text(row.travelCategoryId).appendTo(rowss); 				
				j('<td></td>').attr({ class: ["fromcityTownId","displayNone"].join(' ') }).text(row.cityTownId).appendTo(rowss); 				 				
				j('<td></td>').attr({ class: ["accountCodeId","displayNone"].join(' ') }).text(row.accCodeId).appendTo(rowss);		
				j('<td></td>').attr({ class: ["expName","displayNone"].join(' ') }).text(row.expenseName).appendTo(rowss);		
				j('<td></td>').attr({ class: ["tsExpId","displayNone"].join(' ') }).text(row.tsExpId).appendTo(rowss);
				j('<td></td>').attr({ class: ["isModeCategory","displayNone"].join(' ') }).text(row.isModeCategory).appendTo(rowss);
				j('<td></td>').attr({ class: ["accountCodeId","displayNone"].join(' ') }).text(row.accountCodeId).appendTo(rowss);				
			}	
					
			j("#source tr").click(function(){
				headerOprationBtn = defaultPagePath+'headerPageForTSOperation.html';
				if(j(this).hasClass("selected")){ 
				var headerBackBtn=defaultPagePath+'headerPageForTSOperation.html';
					j(this).removeClass('selected');
					j('#mainHeader').load(headerBackBtn);
				}else{
					if(j(this).text()=='DateExpense NameAmtcityTownNarration'){
						
					}else{
					j('#mainHeader').load(headerOprationBtn);
					j(this).addClass('selected');
					}
				}								
			});
			}
		 });
	 });	 
	 mytable.appendTo("#box");	 
     var header = defaultPagePath+'backbtnPage.html';
    j('#mainHeader').load(header);
 }

 //  SMS changes
function saveSMS(sms){
	j('#loading_Cat').show();
	if (mydb) {
		//save incoming sms
	    var smsMsg = sms.body;
		var senderAddress = ""+sms.address;	
		senderAddress = senderAddress.toLowerCase();	
		var smsSentDate = getFormattedDateFromMillisec(parseInt(sms.date_sent));
		var smsAmount = parseIncomingSMSForAmount(smsMsg);
		if (smsMsg != "") {
	            mydb.transaction(function (t) {
	                t.executeSql("INSERT INTO smsMaster (smsText,senderAddr,smsSentDate,smsAmount) VALUES (?,?,?,?)", 
												[smsMsg,senderAddress,smsSentDate,smsAmount]);
				});
	            j('#loading_Cat').hide();
	        } else {
	        	j('#loading_Cat').hide();
	        }
	} else {
        alert("db not found, your browser does not support web sql!");
    }
}


function fetchSMSClaim() {
	mytable = j('<table></table>').attr({ id: "source",class: ["table","table-striped","table-bordered"].join(' ') });
	var rowThead = j("<thead></thead>").appendTo(mytable);
	var rowTh = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(rowThead);
	
	j('<th></th>').text("SMS Date").appendTo(rowTh);
	j('<th></th>').text("Expense type").appendTo(rowTh); 	
	j('<th></th>').text("Text").appendTo(rowTh);
	j('<th></th>').text("Amt").appendTo(rowTh);
	var cols = new Number(5);
	 
	mydb.transaction(function(t) {
/*		 mydb.transaction(function (t) {
	              t.executeSql("INSERT INTO smsMaster (smsId,smsSentDate,senderAddr,smsText,smsAmount) VALUES (?, ?, ?, ?,?)", 
											[1,"23-Dec-2016","VM_IPAYTM","successfully  Rs.600 ","600.00"]);
				});*/
		var headerOprationBtn;
      t.executeSql('SELECT * FROM smsMaster;', [],
		 function(transaction, result) {
		  if (result != null && result.rows != null) {
			  
			for (var i = 0; i < result.rows.length; i++) {
				var row = result.rows.item(i);
				var smsAmount = parseIncomingSMSForAmount(row.smsText);
				var rowss = j('<tr></tr>').attr({ class: ["test"].join(' ') }).appendTo(mytable);
				j('<td></td>').attr({ class: ["smsSentDate",""].join(' ') }).text(row.smsSentDate).appendTo(rowss);
				// j('<td></td>').attr({ class: ["senderAddr",""].join(' ') }).text(row.senderAddr).appendTo(rowss);
				j(rowss).append('<td><img width="50px" height="50px" src="images/'+row.senderAddr+'.png"/></td>');
				j('<td></td>').attr({ class: ["smsText",""].join(' ') }).text(row.smsText).appendTo(rowss);
				j('<td></td>').attr({ class: ["smsAmount",""].join(' ') }).text(row.smsAmount).appendTo(rowss);
				 // j(rowss).append('<td><input type = "text"  id = "amt" value= "'+ smsAmount +'" style = "width: 50px;"/></td>');
				 j('<td></td>').attr({ class: ["smsId","displayNone"].join(' ') }).text(row.smsId).appendTo(rowss);
				  j('<td></td>').attr({ class: ["sender","displayNone"].join(' ') }).text(row.senderAddr).appendTo(rowss);
			}	
					
			j("#source tr").click(function(){ 
				headerOprationBtn = defaultPagePath+'headerPageForSMSOperation.html';
				if(j(this).hasClass("selected")){ 
				var headerBackBtn=defaultPagePath+'headerPageForSMSOperation.html';
					j(this).removeClass('selected');
					j('#mainHeader').load(headerBackBtn);
				}else{
				if(j(this).text()=='DateExpense expid From/To LocAmt'){
					
				}else{
					j('#mainHeader').load(headerOprationBtn);
					j(this).addClass('selected');
				}					
				}								
			});
			}
		 });
	 });	 
	 mytable.appendTo("#box");		 
 }	


function discardMessages(smsID){
			mydb.transaction(function (t) {
				t.executeSql("DELETE FROM smsMaster WHERE smsId=?", [smsID]);
			});
		}

function getFiltrationConstraints(){
	var blockedWordsList = 	"";
	var allowedWordsList = "";
	mydb.transaction(function(t) {
		 t.executeSql('SELECT * FROM smsScrutinizerMst;', [],
		 function(transaction, result) {
		 	 if (result != null && result.rows != null) {
			  
				for (var i = 0; i < result.rows.length; i++) {
					var row = result.rows.item(i);
					var status = row.status;
					var flag = row.filterFlag;
					var filterText = row.filterText;

					if(status == 1){
						if(flag == 'b'){
							blockedWordsList += filterText + "$";
						}else if( flag == 'w' ){
							allowedWordsList += filterText + "$"
						}
					}

				}
			}
		 });
	});
	setTimeout(function(){
		tempFilterStr = blockedWordsList+"@"+allowedWordsList;
		if(tempFilterStr){
			filtersStr = tempFilterStr;
			window.localStorage.setItem("SMSFilterationStr",filtersStr);
		}
		return tempFilterStr
	}, 50);
}


function synchronizeWhiteListMasterData() {
	var jsonSentToSync=new Object();
	
	j('#loading_Cat').show();
	var blockedWordsList = 	"";
	var allowedWordsList = "";
	if (mydb) {
		j.ajax({
			url: window.localStorage.getItem("urlPath")+"SyncWhiteListMasterWebService",
			type: 'POST',
			dataType: 'json',
			crossDomain: true,
			data: JSON.stringify(jsonSentToSync),
			success: function(data) {
				if(data.Status=='Success'){
					mydb.transaction(function (t) {
					t.executeSql("DELETE FROM smsScrutinizerMst");
					var whiteListArray = data.WhiteListArray;
						if(whiteListArray != null && whiteListArray.length > 0){
							for(var i=0; i<whiteListArray.length; i++ ){
								var msgArr = new Array();
								msgArr = whiteListArray[i];
								var wbl_id = msgArr.ID;
								var filter_Text = msgArr.FilterText;
								var filter_Flag = msgArr.FilterFlag;
								var status = msgArr.Status;
								 
								t.executeSql("INSERT INTO smsScrutinizerMst (ID, filterText, filterFlag, status) VALUES (?, ?, ?, ?)", [wbl_id,filter_Text,filter_Flag,status]);
								
							}
						}
					});	
					                      
					j('#loading_Cat').hide(); 
            		document.getElementById("syncSuccessMsg").innerHTML = "SMS Status Master synchronized successfully.";
              		j('#syncSuccessMsg').hide().fadeIn('slow').delay(500).fadeOut('slow');
		 	setTimeout(function(){
              			//console.log("before getFiltrationConstraints call")
		 		getFiltrationConstraints();
		 	}, 2000);
				}
				else{
					j('#loading_Cat').hide();
					document.getElementById("syncFailureMsg").innerHTML = "SMS Status Master not synchronized successfully.";
					j('#syncFailureMsg').hide().fadeIn('slow').delay(300).fadeOut('slow');
					
				}
					
			  },
			  error:function(data) {
				 alert("Error: Oops something is wrong, Please Contact System Administer");
			  }
			});			
	} else {
        alert("db not found, your browser does not support web sql!");
    }
	
}

 function showMultiLanguag(){
		var headerBackBtn=defaultPagePath+'backbtnPage.html';
    // var pageRef=defaultPagePath+'helpMenuPage.html';
     var pageRef=defaultPagePath+'multiLanguage.html';
			j(document).ready(function() {
				j('#mainHeader').load(headerBackBtn);
				j('#mainContainer').load(pageRef);
			});
   appPageHistory.push(pageRef);
	}