function onApiLoad(){gapi.load("auth",{callback:authenticate}),gapi.load("picker")}function onClientLoad(){gapi.client.load("drive","v2")}function authenticate(a){gapi.auth.authorize({client_id:CLIENT_ID,scope:SCOPES,immediate:!a},handleAuthResult)}function isDriveOpen(){return location.search.indexOf("?state=")>-1}function getDriveState(){var a=new RegExp("[\\?&]state=([^&#]*)"),b=a.exec(location.search);return JSON.parse(decodeURIComponent(b[1].replace(/\+/g," ")))}function authenticatedUser(){isDriveOpen()?(driveState=getDriveState(),"open"==driveState.action&&loadFile(driveState.ids[0])):createPicker()}function handleAuthResult(a){document.querySelector("polymer-ui-overlay").active=!1,a?a.error?console.log("Authorization Error: "+a.error):authenticatedUser():(console.log("Authorization Required"),document.querySelector("polymer-ui-overlay").active=!0)}function createPicker(){var a=new google.picker.View(google.picker.ViewId.DOCS);a.setMimeTypes(MIME_TYPES.join(","));var b=(new google.picker.PickerBuilder).setAppId(CLIENT_ID).setOAuthToken(gapi.auth.getToken().access_token).addView(a).addView(new google.picker.DocsUploadView).setDeveloperKey(DEVELOPER_KEY).setCallback(pickerCallback).build();b.setVisible(!0)}function pickerCallback(a){if(a.action==google.picker.Action.PICKED){var b=a.docs[0].id;loadFile(b)}}function displayTitle(a){var b=a+" - Mapper";document.title=b,document.getElementById("title").innerHTML=b}function loadFile(a){var b=gapi.client.drive.files.get({fileId:a});b.execute(function(a){if(a.title&&displayTitle(a.title),a.downloadUrl){var b=new XMLHttpRequest;b.open("GET",a.downloadUrl),b.setRequestHeader("Authorization","Bearer "+gapi.auth.getToken().access_token),b.onload=function(){var a=b.responseText;try{var c=JSON.parse(a);mapData(c)}catch(d){alert("Unable to parse data, doesn't look like JSON.",d)}},b.onerror=function(){alert("Error opening file from Google Drive")},b.send()}})}function mapData(a){try{map.data.addGeoJson(a)}catch(b){alert("Unable to map JSON, might not be GeoJSON?",b)}}var DEVELOPER_KEY="AIzaSyBUxDKdJ2UZhshCuq-7c1DVwJZV5U8meDQ",CLIENT_ID="654605676598-nthfavtrke949shfc49fsn46tdejno7b.apps.googleusercontent.com",SCOPES=["https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/drive.install","https://www.googleapis.com/auth/drive.readonly"],MIME_TYPES=["application/json","application/x-javascript","text/javascript","text/x-javascript","text/x-json","application/octet-stream"];