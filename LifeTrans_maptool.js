var dirService;
var dirRenderer;
var map;
var uaTripList;
var assTripList;
var routeTrips = [];
var confirmedTrips = [];

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
        appChild.querySelector('.add-to-route-text').innerHTML = "-";
        var newTrip = {
            tripId: tripEle.querySelector('.content_card-trip-num').innerHTML,
            puAddress: tripEle.querySelector('.pu-address').innerHTML,
            puCity: tripEle.querySelector('.pu-city').innerHTML,
            puState: tripEle.querySelector('.pu-state').innerHTML,
            puZip: tripEle.querySelector('.pu-zip').innerHTML,
            doAddress: tripEle.querySelector('.do-address').innerHTML,
            doCity: tripEle.querySelector('.do-city').innerHTML,
            doState: tripEle.querySelector('.do-state').innerHTML,
            doZip: tripEle.querySelector('.do-zip').innerHTML,
            date: tripEle.querySelector('.date').innerHTML,
            time: tripEle.querySelector('.time').innerHTML,
            mileage: tripEle.querySelector('.mileage').innerHTML
        }
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
        var uaChild = uaTripListEles[i].children[1].children[0];
        if(uaChild.children[2].innerHTML === tripEleId) {
            uaChild.children[3].classList.remove('disabled-div');
            i = uaTripListEles.length;
        }
    }
    tripEle.remove();
}

function clearRoute() {
    var assTripEles = document.querySelector('.selected-routes-wrapper').querySelectorAll('.trip-card-collection');
    var uaTripListEles = document.querySelector('.collection-list').querySelectorAll('.trip-card-collection');
    for(var i = 0; i < routeTrips.length; i++) {
        var currTripId = routeTrips[i].tripId;
        for(var j = 0; j < uaTripListEles.length; j++) {
            var uaChild = uaTripListEles[j].children[1].children[0];
            if(uaChild.children[2].innerHTML === currTripId) {
                uaChild.children[3].classList.remove('disabled-div');
                j = uaTripListEles.length + 1;
            }
        }
        for(var j = 0; j < assTripEles.length; j++) {
            var assTripEle = assTripEles[j];
            if(currTripId === assTripEle.querySelector('.content_card-trip-num').innerHTML) {
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
        confirmedTrips.push(routeTrips[i]);
        for(var j = 0; j < uaTripListEles.length; j++) {
            if(uaTripListEles[j].children[1].children[0].children[2].innerHTML === routeTrips[i].tripId) {
                uaTripListEles[j].classList.add('disabled-div');
                j = uaTripListEles.length + 1;
            }
        }
    }
    clearRoute();
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

function initMap() {
    dirService = new google.maps.DirectionsService();
    dirRenderer = new google.maps.DirectionsRenderer();
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