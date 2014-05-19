function onApiLoad() {
  gapi.load('auth', {'callback': authenticate});
  gapi.load('picker');
}

function onClientLoad() {
  gapi.client.load('drive', 'v2');
}

function authenticate(manual) {
  gapi.auth.authorize({
    'client_id': CLIENT_ID,
    'scope': SCOPES,
    'immediate': !manual
  }, handleAuthResult);
}


function isDriveOpen(){
  return location.search.indexOf('?state=') > -1;
}

function getDriveState(){
  var regex = new RegExp('[\\?&]state=([^&#]*)');
  var results = regex.exec(location.search);
  return JSON.parse(decodeURIComponent(results[1].replace(/\+/g, ' ')));
}

function authenticatedUser(){
  if (isDriveOpen()){
    driveState = getDriveState();
    if (driveState.action == "open") {
      loadFile(driveState.ids[0]);
    }
  } else {
    createPicker();
  }
};

function handleAuthResult(authResult){
  document.querySelector('polymer-ui-overlay').active = false;
  if (authResult) {
    if (!authResult.error){
      authenticatedUser();
    } else {
      console.log('Authorization Error: ' + authResult.error)
    }
  } else {
    // This state means the user has never authorized
    // the app, so we need to prompt them to.
    console.log('Authorization Required')
    document.querySelector('polymer-ui-overlay').active = true;
  }
}

function createPicker() {
  var view = new google.picker.View(google.picker.ViewId.DOCS);
  view.setMimeTypes(MIME_TYPES.join(','));
  var picker = new google.picker.PickerBuilder()
      .setAppId(CLIENT_ID)
      .setOAuthToken(gapi.auth.getToken().access_token)
      .addView(view)
      .addView(new google.picker.DocsUploadView())
      .setDeveloperKey(DEVELOPER_KEY)
      .setCallback(pickerCallback)
      .build();
   picker.setVisible(true);
}

// A simple callback implementation.
function pickerCallback(data) {
  if (data.action == google.picker.Action.PICKED) {
    var fileId = data.docs[0].id;
    loadFile(fileId);
  }
}

function displayTitle(fileTitle){
  var title = fileTitle + ' - Mapper';
  document.title = title;
  document.getElementById('title').innerHTML = title;
}

function loadFile(fileID){
  var request = gapi.client.drive.files.get({
    'fileId': fileID
  });
  request.execute(function(file) {
    if (file.title) {
      displayTitle(file.title);
    }
    if (file.downloadUrl) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', file.downloadUrl);
      xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
      xhr.onload = function() {
        var dataStr = xhr.responseText;
        try {
          var data = JSON.parse(dataStr);
          mapData(data);
        } catch (e) {
          alert("Unable to parse data, doesn't look like JSON.", e);
        }
      };
      xhr.onerror = function() {
        alert("Error opening file from Google Drive")
      };
      xhr.send();
    }
  });
}

function mapData(data){
  try {
    map.data.addGeoJson(data);
  } catch (e) {
    alert("Unable to map JSON, might not be GeoJSON?", e);
  }
}
