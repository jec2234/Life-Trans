var dirService;
var dirRenderer;
var distService;
var map;
var uaTripList;
var assTripList;
var airtableJsonResponse = [];
var allTrips = [];
var routeTrips = [];
var confirmedTrips = [];
var predictionTrips = [];
var matrixTrips = [];
var selectedLos = [];

document.addEventListener('DOMContentLoaded', () => {
    uaTripList = document.querySelector('.collection-list');
    uaTripList.addEventListener('click', function handleClick(event) {
        if(event.target.matches('div.add-to-route') || event.target.matches('div.add-to-route-text')) {
            addToRoute(event);
        }
    });
    uaTripList.addEventListener('DOMNodeInserted', function handleInsert(event) {
        if(event.target.role == 'listitem') {
            var isRouted = false;
            var isConfirmed = false;
            routeTrips.forEach(trip => {
                if(trip.tripId === event.target.querySelector('.content_card-trip-num').innerHTML) {
                    isRouted = true;
                    if(!event.target.querySelector('.add-to-route').classList.contains('disabled-div')) {
                        event.target.querySelector('.add-to-route').classList.add('disabled-div');
                    }
                }
            });
            confirmedTrips.forEach(trip => {
                if(trip.tripId === event.target.querySelector('.content_card-trip-num').innerHTML) {
                    isConfirmed = true;
                    if(!event.target.classList.contains('disabled-div')) {
                        event.target.classList.add('disabled-div');
                    }
                }
            });
            if(!isRouted) {
                event.target.querySelector('.add-to-route').classList.remove('disabled-div');
            }
            if(!isConfirmed) {
                event.target.classList.remove('disabled-div');
            }
        }
    });
    assTripList = document.querySelector('.selected-routes-wrapper');
    assTripList.addEventListener('click', function handleClick(event) {
        if(event.target.matches('div.add-to-route') || event.target.matches('div.add-to-route-text')) {
            removeFromRoute(event);
        } else if(event.target.matches('div.expand-collapse-single-content-card')) {
            expandCollapse(event);
        }
    });
    document.querySelector('.clear-route-button').addEventListener('click', function handleClick(event) {
        clearRoute();
    });
    document.querySelector('.confirm-route-button').addEventListener('click', function handleClick(event) {
        confirmRoute();
    });
    document.querySelector('.generate-route-button').addEventListener('click', function handleClick(event) {
        generateRoute(routeTrips);
    });
    document.querySelector('.generate-predictions-button').addEventListener('click', function handleClick(event){
        generatePredictions();
    });
    document.querySelector('.clear-predictions-button').addEventListener('click', function handleClick(event){
        clearPredictions();
    });
    predTripList = document.querySelector('.predicted-trips');
    predTripList.addEventListener('click', function handleClick(event) {
        if(event.target.matches('div.add-to-route') || event.target.matches('div.add-to-route-text')) {
            addPredictedTrip(event);
        } else if(event.target.matches('div.expand-collapse-single-content-card')) {
            expandCollapse(event);
        } else if(event.target.matches('.div.map-prediction') || event.target.matches('div.map-prediction-text')) {
            mapPredictedTrip(event);
        }
    })
    getAirtableRecords('');
    google.maps.event.addDomListener(window, 'DOMContentLoaded', initMap);
});

function addToRoute(event) {
    if(routeTrips.length < 13) {
        var tripEle = event.target.closest('.trip-card-collection');
        var routeElement = document.querySelector('.selected-routes-wrapper');
        var clonedTrip = tripEle.cloneNode(true);
        var appChild = routeElement.appendChild(clonedTrip);
        appChild.querySelector('.content_card').classList.add('hide-extended-card');
        appChild.querySelector('.content_card-shrunk').setAttribute('style', 'border-bottom:1px solid rgba(139, 93, 93, 0.28);');
        appChild.querySelector('.add-to-route-text').innerHTML = "Remove";
        var newTrip = createNewTrip(tripEle);
        routeTrips.push(newTrip);
        event.target.closest('.add-to-route').classList.add('disabled-div');
    }
}

function removeFromRoute(event) {
    var tripEle = event.target.closest('.trip-card-collection');
    var tripEleId = tripEle.querySelector('.content_card-trip-num').innerHTML;
    var uaTripListEles = uaTripList.querySelectorAll('.trip-card-collection');
    for(var i = 0; i < routeTrips.length; i++) {
        if(routeTrips[i].tripId === tripEleId) {
            routeTrips.splice(i,1);
            i = routeTrips.length;
        }
    }
    for(var i = 0; i < uaTripListEles.length; i++) {
        var uaChild = uaTripListEles[i].querySelector('.content_card-header');
        if(uaChild.querySelector('.content_card-trip-num').innerHTML === tripEleId) {
            uaChild.querySelector('.add-to-route').classList.remove('disabled-div');
            i = uaTripListEles.length;
        }
    }
    tripEle.remove();
    clearPredictions();
}

function addPredictedTrip(event) {
    if(routeTrips.length < 13) {
        var tripEle = event.target.closest('.trip-card-collection');
        var routeElement = document.querySelector('.selected-routes-wrapper');
        var clonedTrip = tripEle.cloneNode(true);
        var appChild = routeElement.appendChild(clonedTrip);
        appChild.querySelector('.content_card').classList.add('hide-extended-card');
        appChild.querySelector('.content_card-shrunk').setAttribute('style', 'border-bottom:1px solid rgba(139, 93, 93, 0.28);');
        appChild.querySelector('.add-to-route-text').innerHTML = "Remove";
        var newTrip = createNewTrip(tripEle);
        routeTrips.push(newTrip);
        clearPredictions();
    }
}

function clearPredictions() {
    document.querySelector('.predicted-trips').innerHTML = '';
    predictionTrips = [];
    matrixTrips = [];
    dirRenderer.set('directions', null);
}

function clearRoute() {
    var assTripEles = document.querySelector('.selected-routes-wrapper').querySelectorAll('.trip-card-collection');
    var uaTripListEles = document.querySelector('.collection-list').querySelectorAll('.trip-card-collection');
    for(var i = 0; i < routeTrips.length; i++) {
        var currTripId = routeTrips[i].tripId;
        for(var j = 0; j < uaTripListEles.length; j++) {
            if(uaTripListEles[j].querySelector('.content_card-trip-num').innerHTML === currTripId) {
                uaTripListEles[j].querySelector('.add-to-route').classList.remove('disabled-div');
                j = uaTripListEles.length + 1;
            }
        }
        for(var j = 0; j < assTripEles.length; j++) {
            if(currTripId === assTripEles[j].querySelector('.content_card-trip-num').innerHTML) {
                assTripEles[j].remove();
                j = assTripEles.length + 1;
            }
        }
    }
    routeTrips = [];
    clearPredictions();
}

function confirmRoute() {
    var uaTripListEles = document.querySelector('.collection-list').querySelectorAll('.trip-card-collection');
    for(var i = 0; i < routeTrips.length; i++) {
        var tripConfirmed = false;
        for(var j = 0; j < confirmedTrips.length; j++) {
            if(routeTrips[i].tripId === confirmedTrips[j].tripId) {
                tripConfirmed = true;
            }
        }
        if(!tripConfirmed) {
            confirmedTrips.push(routeTrips[i]);
            for(var j = 0; j < uaTripListEles.length; j++) {
                if(uaTripListEles[j].querySelector('.content_card-trip-num').innerHTML === routeTrips[i].tripId) {
                    uaTripListEles[j].classList.add('disabled-div');
                    j = uaTripListEles.length + 1;
                }
            }
        }  
    }
    clearRoute();
}

function createNewTrip(tripEle) {
    var newTrip = {
        tripId: tripEle.querySelector('.content_card-trip-num').innerHTML,
        patient: tripEle.querySelector('.content_card-title').innerHTML,
        los: tripEle.querySelector('.content_card-los').innerHTML,
        puAddress: tripEle.querySelector('.pu-street').innerHTML,
        puCity: tripEle.querySelector('.pu-city').innerHTML,
        puState: tripEle.querySelector('.pu-state').innerHTML,
        puZip: tripEle.querySelector('.pu-zip').innerHTML,
        doAddress: tripEle.querySelector('.do-street').innerHTML,
        doCity: tripEle.querySelector('.do-city').innerHTML,
        doState: tripEle.querySelector('.do-state').innerHTML,
        doZip: tripEle.querySelector('.do-zip').innerHTML,
        puTime: tripEle.querySelector('.pu-time-value').innerHTML,
        doTime: tripEle.querySelector('.do-time-value').innerHTML,
        mileage: tripEle.querySelector('.mileage').innerHTML,
        comments: tripEle.querySelector('.comment').innerHTML,
        predTimeMs: 0,
        predTimeText: '',
    }
    return newTrip;
}

function expandCollapse(event) {
    var tripEle = event.target.closest('.trip-card-collection');
    var topCard = tripEle.querySelector('.content_card-shrunk');
    var card = tripEle.querySelector('.content_card');
    var cardClasses = card.classList;
    if(cardClasses.contains('hide-extended-card')) {
        cardClasses.remove('hide-extended-card');
        cardClasses.add('show-extended-card');
        topCard.setAttribute('style', 'border-bottom:0px solid rgba(139, 93, 93, 0.28);');
        card.setAttribute('style', 'display:block; opacity:1; height:auto');
    } else {
        cardClasses.remove('show-extended-card');
        cardClasses.add('hide-extended-card');
        card.setAttribute('style', 'display:none; opacity:0; height:auto');
        topCard.setAttribute('style', 'border-bottom:1px solid rgba(139, 93, 93, 0.28);');
    }
}

function mapPredictedTrip(event) {
    var predictedTrip = event.target.closest('.trip-card-collection');
    var newPredictedTrip = createNewTrip(predictedTrip);
    var newPredictedRoute = routeTrips.slice(0);
    newPredictedRoute.push(newPredictedTrip);
    generateRoute(newPredictedRoute, event);
}

function generateRoute(route, event = false) {
    if(route.length) {
        var req = {
            origin: String,
            destination: String,
            waypoints: [],
            travelMode: 'DRIVING',
        }
        for(var i = 0; i < route.length; i++) {
            var currTrip = route[i];
            if(i == 0) {
                req.origin = createAddress(currTrip, true);
                if(i == route.length - 1) {
                    req.destination = createAddress(currTrip, false);
                } else {
                    req.waypoints.push({location: createAddress(currTrip, false), stopover: true});
                }
            } else {
                req.waypoints.push({location: createAddress(currTrip, true), stopover: true});
                if(i == route.length - 1) {
                    req.destination = createAddress(currTrip, false);
                } else {
                    req.waypoints.push({location: createAddress(currTrip, false), stopover: true});
                }
            }
        }
        dirService.route(req, function(response, status) {
            if (status == 'OK') {
                timeEstimates(response, event);
                dirRenderer.setDirections(response);
            }
        });
    } else {
        dirRenderer.set('directions', null);
    }
}

function timeEstimates (response, event = false) {
    var assTripEles = document.querySelector('.selected-routes-wrapper').querySelectorAll('.trip-card-collection');
    var alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var legs = response.routes[0].legs;
    var j = 0;
    for(var i = 0; i < assTripEles.length; i++) {
        assTripEles[i].querySelector('.pu-marker').innerHTML = alph.charAt(i + j);
        j = j + 1;
        assTripEles[i].querySelector('.est-to-next').innerHTML = legs[i+j] ? legs[i+j].duration.text : '0 mins';
        assTripEles[i].querySelector('.do-marker').innerHTML = alph.charAt(i + j);
    }
    if(event) {
        if(event.target.matches('.div.map-prediction') || event.target.matches('div.map-prediction-text')) {
            var predTrip = event.target.closest('.trip-card-collection');
            predTrip.querySelector('.pu-marker').innerHTML = alph.charAt((assTripEles.length * 2));
            predTrip.querySelector('.do-marker').innerHTML = alph.charAt((assTripEles.length * 2) + 1);
        }
    }
}

function createAddress(trip, isPickUp) {
    if(isPickUp) {
        return trip.puAddress+', '+trip.puCity+', '+trip.puState+', '+trip.puZip;
    } else {
        return trip.doAddress+', '+trip.doCity+', '+trip.doState+', '+trip.doZip;
    }
}

function generatePredictions() {
    clearPredictions();
    if(routeTrips.length > 0 && routeTrips.length < 13) {
        var origin = routeTrips[routeTrips.length - 1]; //Last trip
        if(!origin.doTime) {
            var originPuTime = new Date(origin.puTime);
            var req = {
                origin: createAddress(origin, true),
                destination: createAddress(origin, false),
                travelMode: 'DRIVING',
            }
            dirService.route(req, function(response, status) {
                if(status == 'OK') {
                    origin.doTime = originPuTime.getTime() + (response.routes[0].legs[0].duration.value * 1000);
                    var req = createPredictionRequest(origin);
                    if(req.origins.length > 0) {
                        distService.getDistanceMatrix(req, function(resp, stat){
                            distanceCallback(resp, stat, origin);
                        });
                    }
                }
            });
        } else {
            var req = createPredictionRequest(origin);
            if(req.origins.length > 0) {
                distService.getDistanceMatrix(req, function(resp, stat){
                    distanceCallback(resp, stat, origin);
                });
            }
        }
    }
}

function createPredictionRequest(origin) {
    var req = {
        origins: [],
        destinations: [],
        travelMode: 'DRIVING',
        drivingOptions: {
            departureTime: new Date(origin.doTime)
        }
    }
    req.origins.push(createAddress(origin, false));
    getLosFilter();
    for(var i = 0; i < allTrips.length; i++) {
        var tripConfirmed = false;
        for(var j = 0; j < confirmedTrips.length; j++) {
            var uaTripId = allTrips[i].tripId;
            if(uaTripId === confirmedTrips[j].tripId) {
                tripConfirmed = true;
            }
        }
        if(!tripConfirmed) {
            var uaLos = allTrips[i].los;
            var uaAddress = allTrips[i].puAddress;
            var uaCity = allTrips[i].puCity;
            var uaState = allTrips[i].puState;
            var uaZip = allTrips[i].puZip;
            var uaPuTime = new Date(allTrips[i].puTime);
            var originDoTime = new Date(origin.doTime);
            var uaAddressString = uaAddress+', '+uaCity+', '+uaState+', '+uaZip;
            // if next trip pick up time is after the last trip drop off time, and is less than 2 hours (7200000 ms) from the last drop off
            // This is done to reduce number of items in the distance matrix to reduce api costs
            
            // Remove confirmed trips from predictions

            if(uaPuTime.getTime() > originDoTime.getTime() && uaPuTime.getTime() < (originDoTime.getTime() + 7200000)) {
                if(selectedLos.length == 0) {
                    req.destinations.push(uaAddressString);
                    matrixTrips.push(allTrips[i]);
                } else {
                    if(selectedLos.indexOf(uaLos) != -1) {
                        req.destinations.push(uaAddressString);
                        matrixTrips.push(allTrips[i]);
                    }
                }
            }
        }
    }
    return req;
}

function distanceCallback(response, status, origin) {
    var origin = routeTrips[routeTrips.length - 1]; //Last trip
    var validPredictions = [];
    if(status == 'OK') {
        var durations = response.rows[0].elements;
        for(var i = 0; i < durations.length; i++) {
            var lateBuffer = 900000; // 15 minute allowance for late drop offs
            var originLoS = origin.los;
            var losDelay = 0; //LoS Lead time delay: Gurney 15 minutes, Wheelchair 10, Rest 5 minutes
            if(originLoS == "Gurney" || originLoS == "Gurney - Bariatric") {
                losDelay = 900000;
            } else if(originLoS == "Wheelchair" || originLoS == "Wheelchair - Stairchair" || originLoS == "Electric Wheelchair") {
                losDelay = 600000;
            } else {
                losDelay = 300000;
            }
            if(durations[i].status == "OK") {
                var duration = durations[i].duration.value * 1000; //convert to ms
                var durationText = durations[i].duration.text;
                var originDoTime = new Date(origin.doTime);
                var predictedArrivalTime = new Date(originDoTime.getTime() + duration);
                var destinationPuTime = new Date(matrixTrips[i].puTime);
                var timeDifference = (destinationPuTime.getTime() + lateBuffer) - (predictedArrivalTime.getTime() + losDelay);
                if(timeDifference > 0) {
                    matrixTrips[i].predTimeMs = duration;
                    matrixTrips[i].predTimeText = durationText;
                    validPredictions.push(matrixTrips[i]);
                }
            }
        }
        var sortedPredictions = validPredictions.sort(function(a,b) {
            var aTime = new Date(a.predTimeMs);
            var bTime = new Date(b.predTimeMs);
            if(aTime > bTime) {
                return 1;
            }
            if(aTime < bTime) {
                return -1;
            }
            return 0
        });
        displayPredictions(sortedPredictions);
    }
}

function displayPredictions(sortedPredictions) {
    var routeElement = document.querySelector('.selected-routes-wrapper').querySelectorAll('.trip-card-collection')[0];
    var predictionList = document.querySelector('.predicted-trips');
    var clonedTrip = routeElement.cloneNode(true);
    for(var i = 0; (i < sortedPredictions.length && i < 10); i++) {
        var clonedTrip = routeElement.cloneNode(true);
        var appChild = predictionList.appendChild(clonedTrip);
        appChild.querySelector('.content_card').classList.add('hide-extended-card');
        appChild.querySelector('.content_card-shrunk').setAttribute('style', 'border-bottom:1px solid rgba(139, 93, 93, 0.28);');
        appChild.querySelector('.add-to-route-text').innerHTML = "Add";
        appChild.querySelector('.est-to-next-label').innerHTML = "Est. PU Time"
        appChild.querySelector('.content_card-trip-num').innerHTML = sortedPredictions[i].tripId;
        appChild.querySelector('.content_card-title').innerHTML = sortedPredictions[i].patient;
        appChild.querySelector('.content_card-los').innerHTML = sortedPredictions[i].los;
        appChild.querySelector('.pu-street').innerHTML = sortedPredictions[i].puAddress;
        appChild.querySelector('.pu-city').innerHTML = sortedPredictions[i].puCity;
        appChild.querySelector('.pu-state').innerHTML = sortedPredictions[i].puState;
        appChild.querySelector('.pu-zip').innerHTML = sortedPredictions[i].puZip;
        appChild.querySelector('.do-street').innerHTML = sortedPredictions[i].doAddress;
        appChild.querySelector('.do-city').innerHTML = sortedPredictions[i].doCity;
        appChild.querySelector('.do-state').innerHTML = sortedPredictions[i].doState;
        appChild.querySelector('.do-zip').innerHTML = sortedPredictions[i].doZip;
        appChild.querySelector('.pu-time-value').innerHTML = sortedPredictions[i].puTime;
        appChild.querySelector('.do-time-value').innerHTML = sortedPredictions[i].doTime;
        appChild.querySelector('.mileage').innerHTML = sortedPredictions[i].mileage;
        appChild.querySelector('.comment').innerHTML = sortedPredictions[i].comments;
        appChild.querySelector('.est-to-next').innerHTML = sortedPredictions[i].predTimeText;
        appChild.querySelector('.pu-marker').innerHTML = '';
        appChild.querySelector('.do-marker').innerHTML = '';
        predictionTrips.push(sortedPredictions[i]);
    }
}

function getLosFilter() {
    selectedLos = [];
    var losListEles = document.querySelector('.filter_column-los-list').querySelectorAll('.los-item');
    for(var i = 0; i < losListEles.length; i++) {
        if(losListEles[i].querySelector('.checkbox').checked) {
            selectedLos.push(losListEles[i].querySelector('.checkbox-label').innerHTML);
        }
    }
}

function getAirtableRecords(offset) {
    var fullUrl;
    var url = "https://api.airtable.com/v0/";
    var baseId = "appg8DtjR4HLi3xAt";
    var tableName = "Trips"
    var convertedOffset = '';
    if(offset != '') {
        convertedOffset = offset.replace('/', '%2F');
        fullUrl = url + baseId + '/' + tableName + "?offset=" + convertedOffset;
    } else {
        fullUrl = url + baseId + '/' + tableName
    }
    fetch(
        fullUrl,
        {
            method: 'GET',
            headers: {
                Accept:'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer patdjxs9ehARjKOjZ.d8eb8d2dbab97c76254900c409d9aa5498eb51e9e0bbc1b6a95375f2fd78e35a',
            },
        }
    ).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Something went wrong');
        }
    }).then(rawResponse => {
        if(rawResponse.offset) {
            airtableJsonResponse = airtableJsonResponse.concat(rawResponse.records);
            getAirtableRecords(rawResponse.offset);
        } else {
            airtableJsonResponse = airtableJsonResponse.concat(rawResponse.records);
            populateAllTripsArray(airtableJsonResponse);
        }
    }).catch(error => {
        customToast.error('Something went wrong.');
        console.log('Error', error);
    });
}

function populateAllTripsArray(airtableJsonResponse) {
    for(var i = 0; i < airtableJsonResponse.length; i++) {
        var newTrip = {
            tripId: airtableJsonResponse[i].fields.Trip,
            patient: airtableJsonResponse[i].fields.PatientName,
            los: airtableJsonResponse[i].fields.LOS,
            puAddress: airtableJsonResponse[i].fields.PUAddress,
            puCity: airtableJsonResponse[i].fields.PUCity,
            puState: airtableJsonResponse[i].fields.PUState,
            puZip: airtableJsonResponse[i].fields.PUZip,
            doAddress: airtableJsonResponse[i].fields.DOAddress,
            doCity: airtableJsonResponse[i].fields.DOCity,
            doState: airtableJsonResponse[i].fields.DOState,
            doZip: airtableJsonResponse[i].fields.DOZip,
            puTime: airtableJsonResponse[i].fields.PickupTime,
            doTime: airtableJsonResponse[i].fields.AppointmentTime,
            mileage: airtableJsonResponse[i].fields.Mileage,
            comments: airtableJsonResponse[i].fields.DispatchNotes,
            predTimeMs: 0,
            predTimeText: '',
        }
        allTrips.push(newTrip);
    }
    return;
}

function initMap() {
    dirService = new google.maps.DirectionsService();
    dirRenderer = new google.maps.DirectionsRenderer();
    distService = new google.maps.DistanceMatrixService();
    var vegas = { lat: 36.1165986, lng: -115.1616161 };
    var mapStyles = [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [
                { visibility: "off" }
            ]
        }
    ];
    var mapOptions = {
        zoom: 11,
        center: vegas,
        styles: mapStyles
    };
    map = new google.maps.Map(document.getElementById("map-container"), mapOptions);
    dirRenderer.setMap(map);
}