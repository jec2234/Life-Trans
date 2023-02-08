var dirService;
var dirRenderer;
var distService;
var map;
var uaTripList;
var assTripList;
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
        generateRoute();
    });
    document.querySelector('.generate-predictions-button').addEventListener('click', function handleClick(event){
        debugger;
        generatePredictions();
    });
    predTripList = document.querySelector('.predicted-trips');
    predTripList.addEventListener('click', function handleClick(event) {
        if(event.target.matches('div.add-to-route') || event.target.matches('div.add-to-route-text')) {
            addPredictedRoute(event);
        } else if(event.target.matches('div.expand-collapse-single-content-card')) {
            expandCollapse(event);
        }
    })
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
}

function addPredictedRoute(event) {

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
            if(currTripId === assTripEle[j].querySelector('.content_card-trip-num').innerHTML) {
                assTripEle.remove();
                j = assTripEles.length + 1;
            }
        }
    }
    routeTrips = [];
    dirRenderer.set('directions', null);
}

function confirmRoute() {
    var uaTripListEles = document.querySelector('.collection-list').querySelectorAll('.trip-card-collection');
    for(var i = 0; i < routeTrips.length; i++) {
        var tripConfirmed = false;
        for(var j = 0; j < confirmedTrips.length; j++) {
            if(routedTrips[i].tripId === confirmedTrips[j].tripId) {
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
        puAddress: tripEle.querySelector('.pu-address').innerHTML,
        puCity: tripEle.querySelector('.pu-city').innerHTML,
        puState: tripEle.querySelector('.pu-state').innerHTML,
        puZip: tripEle.querySelector('.pu-zip').innerHTML,
        doAddress: tripEle.querySelector('.do-address').innerHTML,
        doCity: tripEle.querySelector('.do-city').innerHTML,
        doState: tripEle.querySelector('.do-state').innerHTML,
        doZip: tripEle.querySelector('.do-zip').innerHTML,
        puTime: tripEle.querySelector('.pu-time-value').innerHTML,
        doTime: tripEle.querySelector('.do-time-value').innerHTML,
        mileage: tripEle.querySelector('.mileage').innerHTML,
        comments: tripEle.querySelector('.content_card-info-text').innerHTML
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

function generateRoute() {
    if(routeTrips.length) {
        var req = {
            origin: String,
            destination: String,
            waypoints: [],
            travelMode: 'DRIVING',
        }
        for(var i = 0; i < routeTrips.length; i++) {
            var currTrip = routeTrips[i];
            if(i == 0) {
                req.origin = createAddress(currTrip, true);
                if(i == routeTrips.length - 1) {
                    req.destination = createAddress(currTrip, false);
                } else {
                    req.waypoints.push({location: createAddress(currTrip, false), stopover: true});
                }
            } else {
                req.waypoints.push({location: createAddress(currTrip, true), stopover: true});
                if(i == routeTrips.length - 1) {
                    req.destination = createAddress(currTrip, false);
                } else {
                    req.waypoints.push({location: createAddress(currTrip, false), stopover: true});
                }
            }
        }
        dirService.route(req, function(response, status) {
            if (status == 'OK') {
                timeEstimates(response);
                dirRenderer.setDirections(response);
            }
        });
    } else {
        dirRenderer.set('directions', null);
    }
}

function timeEstimates (response) {
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
}

function createAddress(trip, isPickUp) {
    if(isPickUp) {
        return trip.puAddress+', '+trip.puCity+', '+trip.puState+', '+trip.puZip;
    } else {
        return trip.doAddress+', '+trip.doCity+', '+trip.doState+', '+trip.doZip;
    }
}

function generatePredictions() {
    debugger;
    if(routeTrips.length) {
        var origin = routeTrips[routeTrips.length - 1]; //Last trip
        if(!origin.doTime) {
            var originPuTime = new Date(origin.puTime);
            var req = {
                origin: createAddress(origin, true),
                destination: createAddress(origin, false),
                travelMode: 'DRIVING',
            }
            dirService.route(req, function(response, status) {
                debugger;
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

function distanceCallback(response, status, origin) {
    debugger;
    var origin = routeTrips[routeTrips.length - 1]; //Last trip
    var validPredictions = [];
    if(status == 'OK') {
        var durations = response.rows[0].elements;
        for(var i = 0; i < durations.length; i++) {
            if(durations[i].status == "OK") {
                var duration = durations[i].duration.value * 1000; //convert to ms
                var originDoTime = new Date(origin.doTime);
                var predictedArrivalTime = new Date(originDoTime.getTime() + duration);
                var destinationPuTime = new Date(matrixTrips[i].puTime);
                var timeDifference = destinationPuTime - predictedArrivalTime;
                if(timeDifference > 0) {
                    validPredictions.push(matrixTrips[i]);
                }
            }
        }
        var sortedPredictions = validPredictions.sort(function(a,b) {
            var aTime = new Date(a.puTime);
            var bTime = new Date(b.puTime);
            if(aTime > bTime) {
                return -1;
            }
            if(aTime < bTime) {
                return 1;
            }
            return 0
        });
        displayPredictions(sortedPredictions);
    }
}

function createPredictionRequest(origin) {
    debugger;
    var req = {
        origins: [],
        destinations: [],
        travelMode: 'DRIVING',
    }
    req.origins.push(createAddress(origin, false));
    getLosFilter();
    var uaTripListEles = document.querySelector('.collection-list').querySelectorAll('.trip-card-collection'); //TODO: Replace with full list of trips from airtable
    for(var i = 0; i < uaTripListEles.length; i++) {
        var tripConfirmed = false;
        for(var j = 0; j < confirmedTrips.length; j++) {
            var uaTripId = uaTripListEles[j].querySelector('.content_card-trip-num').innerHTML;
            if(uaTripId === confirmedTrips[j].tripId) {
                tripConfirmed = true;
            }
        }
        if(!tripConfirmed) {
            var uaLos = uaTripListEles[i].querySelector('.content_card-los').innerHTML;
            var uaTripAddress = uaTripListEles[i].querySelector('.address');
            var uaAddress = uaTripAddress.querySelector('.pu-street').innerHTML;
            var uaCity = uaTripAddress.querySelector('.pu-city').innerHTML;
            var uaState = uaTripAddress.querySelector('.pu-state').innerHTML;
            var uaZip = uaTripAddress.querySelector('.pu-zip').innerHTML;
            var uaPuTime = new Date(uaTripAddress.querySelector('.pu-time-value').innerHTML);
            var originDoTime = new Date(origin.doTime);
            var uaAddressString = uaAddress+', '+uaCity+', '+uaState+', '+uaZip;
            // if next trip pick up time is after the last trip drop off time, and is less than 2 hours (7200000 ms) from the last drop off
            // This is done to reduce number of items in the distance matrix to reduce api costs
            if(uaPuTime.getTime() > originDoTime.getTime() && uaPuTime.getTime() < (originDoTime.getTime() + 7200000)) {
                if(selectedLos.length == 0) {
                    req.destinations.push(uaAddressString);
                    matrixTrips.push(createNewTrip(uaTripListEles[i]));
                } else {
                    if(selectedLos.indexOf(uaLos) != -1) {
                        req.destinations.push(uaAddressString);
                        matrixTrips.push(createNewTrip(uaTripListEles[i]));
                    }
                }
            }
        }
    }
    return req;
}

function displayPredictions(sortedPredictions) {
    debugger;
    var routeElement = document.querySelector('.selected-routes-wrapper').querySelectorAll('.trip-card-collection')[0];
    var predictionList = document.querySelector('.predicted-trips');
    var clonedTrip = routeElement.cloneNode(true);
    for(var i = 0; (i < sortedPredictions.length && i < 5); i++) {
        var appChild = predictionList.appendChild(clonedTrip);
        appChild.querySelector('.content_card').classList.add('hide-extended-card');
        appChild.querySelector('.content_card-shrunk').setAttribute('style', 'border-bottom:1px solid rgba(139, 93, 93, 0.28);');
        appChild.querySelector('.add-to-route-text').innerHTML = "Add";
        appChild.querySelector('.content_card-trip-num').innerHTML = sortedPredictions[i].tripId;
        appChild.querySelector('.content_card-title').innerHTML = sortedPredictions[i].patient;
        appChild.querySelector('.content_card-los').innerHTML = sortedPredictions[i].los;
        appChild.querySelector('.pu-address').innerHTML = sortedPredictions[i].pusAddress;
        appChild.querySelector('.pu-city').innerHTML = sortedPredictions[i].puCity;
        appChild.querySelector('.pu-state').innerHTML = sortedPredictions[i].puState;
        appChild.querySelector('.pu-zip').innerHTML = sortedPredictions[i].puZip;
        appChild.querySelector('.do-address').innerHTML = sortedPredictions[i].doAddress;
        appChild.querySelector('.do-city').innerHTML = sortedPredictions[i].doCity;
        appChild.querySelector('.do-state').innerHTML = sortedPredictions[i].doState;
        appChild.querySelector('.do-zip').innerHTML = sortedPredictions[i].doZip;
        appChild.querySelector('.pu-time-value').innerHTML = sortedPredictions[i].puTime;
        appChild.querySelector('.do-time-value').innerHTML = sortedPredictions[i].doTime;
        appChild.querySelector('.mileage').innerHTML = sortedPredictions[i].mileage;
        appChild.querySelector('.content_card-info-text').innerHTML = sortedPredictions[i].comments;
        predictionList.push(sortedPredictions[i]);
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