Parse.Cloud.beforeSave ('IncidentDetails', function(request, response) {
                        
                        var address = request.object.get("address1");
                        var city = request.object.get("city");
                        var latitude;
                        var longitude;
                        
                        var formattedAddress = address.replace(/ /g, "+");
                        
                        if (formattedAddress.indexOf('/') >= 0){
                        var formattedAddress = formattedAddress.replace("/", "+and+");
                        }
                        
                        /*
                         if( address.indexOf('-') >= 0){
                         var addressWithUnit = address.split("-");
                         var unitNumber = addressWithUnit[0];
                         var amendedAddress = addressWithUnit[1];
                         request.object.set("addressUnit", unitNumber);
                         request.object.set("address1", amendedAddress);
                         
                         }
                         
                         
                         var formattedAddress = addressIntersection.replace("  ", "");
                         var amendedAddress = formattedAddress.replace(/ /g, "+");
                         
                         console.log(amendedAddress);
                         
                         } else {
                         
                         var amendedAddress = address.replace(/ /g, "+");
                         
                         }
                         */
                        var apikey = "AIzaSyBR46dIHfsyFwPnCAMes0W9pPgtPhbYAB8";
                        
                        var c = city.charAt(0);
                        if (c == 'A') {
                        var formattedCity = "+Arroyo+Grande";
                        }
                        if (c == 'G') {
                        var formattedCity = "+Grover+Beach";
                        }
                        if (c == 'O') {
                        var formattedCity = "+Oceano";
                        }
                        if (c == 'P') {
                        var formattedCity = "+Pismo+Beach";
                        }
                        
                        if (c == 'S') {
                        var formattedCity = "+Arroyo+Grande";
                        }
                        
                        var state = "+CA"
                        console.log(formattedAddress+formattedCity+state+'&sensor=false');
                        
                        Parse.Cloud.httpRequest({
                                                
                                                url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+formattedAddress+formattedCity+state+'&key='+apikey,
                                                success: function(httpResponse) {
                                                //console.log(httpResponse.text);
                                                var geocodeResponse = JSON.parse(httpResponse.text);
                                                
                                                
                                                if(geocodeResponse.status == "ZERO_RESULTS"){
                                                console.log("Nothing here");
                                                request.object.set("address1", addressIntersection);
                                                response.success();
                                                
                                                } else {
                                                
                                                var addressType = geocodeResponse.results[0].types[0];
                                                latitude = geocodeResponse.results[0].geometry.location.lat;
                                                longitude = geocodeResponse.results[0].geometry.location.lng;
                                                if (addressType =="intersection") {
                                                var neighborhood = geocodeResponse.results[0].address_components[1].long_name;
                                                } else {
                                                var neighborhood = geocodeResponse.results[0].address_components[2].long_name;
                                                }
                                                
                                                //console.log(addressType);
                                                
                                                console.log(latitude);
                                                console.log(longitude);
                                                console.log(neighborhood);
                                                
                                                request.object.set("lat", latitude);
                                                request.object.set("lon", longitude);
                                                request.object.set("neighborhood", neighborhood);
                                                
                                                response.success();
                                                }
                                                
                                                },
                                                error: function(httpResponse) {
                                                console.error('Request failed with response code ' + httpResponse.status);
                                                
                                                }
                                                });
                        /*p
                         var url = 'https://maps.googleapis.com/maps/api/streetview?size=800x400&location='+latitude+','+longitude+'&fov=90&heading=270&pitch=0';
                         Parse.Cloud.httpRequest({ url: url }).then(function(response) {
                         // Create an Image from the data.
                         var image = new Image();
                         return image.setData(response.buffer);
                         
                         }).then(function(image) {
                         // Scale the image to a certain size.
                         return image.scale({ width: 64, height: 64 });
                         
                         }).then(function(image) {
                         // Get the bytes of the new image.
                         return image.data();
                         
                         }).then(function(buffer) {
                         // Save the bytes to a new file.
                         var file = new Parse.File("image.jpg", { base64: data.toString("base64"); });
                         return file.save();
                         });                                                                   /*
                         
                         Parse.Cloud.httpRequest({
                         
                         url: 'https://maps.googleapis.com/maps/api/streetview?size=800x400&location='+latitude+','+longitude+'&fov=90&heading=270&pitch=0',
                         success:function(httpResponse) {
                         console.log(httpResponse.buffer);
                         var parseFile = new Parse.File("premiseImage.png" , {base64: httpResponse.buffer.toString('base64', 0, httpResponse.buffer.length)});
                         
                         // parseFile.save().then(function() {
                         //    callback(parseFile, null);
                         // }, function(error) {
                         //    console.error('Downloader fails to save parse file.');
                         // });
                         
                         parseFile.save({
                         success:function() {
                         callback(parseFile, null);
                         }, error:function() {
                         callback(null, 'Downloader fails to save parse file.');
                         }
                         });
                         },
                         error:function(httpResponse) {
                         callback(null, 'Downloader fails to download file.');
                         }
                         });
                         
                         */
                        
                        });

Parse.Cloud.afterSave ('IncidentDetails',function (request) {
                       
                       Parse.Push.send({
                                       channels: request.object.get("channels"),
                                       data: {
                                       alert: [request.object.get("incidentType")] + ", " + [request.object.get("address1")] + ", " + [request.object.get("city")]+ ", " + [request.object.get("unitID")],
                                       lat: request.object.get("lat"),
                                       lon: request.object.get("lon"),
                                       sound: "SBCPushAlert.wav"
                                       }
                                       }, {
                                       success: function() {
                                       // Push was successful
                                       },
                                       error: function(error) {
                                       // Handle error
                                       throw "Got an error " + error.code + " : " + error.message;
                                       }
                                       });
                       });

//Parse.Cloud.beforeSave(Parse.User, function(request) {
//
//                       console.log("working!!!!");
//                      var verified = request.object.get("emailVerified");
//                      console.log(verified);
//
//                      if(verified == true) {
//                      request.object.set("authorizedUser", true);
//
//
//                       success: function() {
//                       console.log ("user successful")
//                       },
//                       error: function(error) {
//                       console.log("Got a user error" + error.code + " : " + error.message)
//
//                       }
//                       }
//                       });

Parse.Cloud.beforeSave(Parse.User, function(request, response) {
                       
                       var username = request.object.get("username");
                       var lowercaseUsername = username.toLowerCase()
                       
                       var permittedEmailString = "@me.com";
                       var permittedEmailString1 = "@fivecitiesfire.org";
                       var permittedEmailString2 = "@fire.ca.gov";
                       var permittedEmailString3 = "@sla.md";
                       
                       if ((lowercaseUsername.indexOf(permittedEmailString) >= 0) || (lowercaseUsername.indexOf(permittedEmailString1) >= 0) || (lowercaseUsername.indexOf(permittedEmailString2) >= 0) || (lowercaseUsername.indexOf(permittedEmailString3) >= 0)) {
                       
                       console.log(permittedEmailString + " is permitted.");
                       request.object.set("authorizedUser",true);
                       } else {
                       console.log(permittedEmailString + " is NOT permitted.");
                       request.object.set("authorizedUser",false);
                       }
                       response.success();
                       });



