var gmarkers = [];
var companyDic = {};

function addMarker(props, map){
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(props.corrds.lat, props.corrds.lng),
        map:map,
    });
    if(props.iconImage){
        marker.setIcon(props.iconImage);
    }
    
    if(props.properties){
        var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h4 id="firstHeading" class="firstHeading">'+ props.properties.name +'</h4>'+
        '<div id="bodyContent">'+
        '<p> 분야 : ' + props.properties.type +'</br>'+
        '선정년도 : ' + props.properties.selection_year + '</br>'+
        '배정인원 : ' + props.properties.assignment + '</p>'
        '</div>'+
        '</div>';

        var infoWindow = new google.maps.InfoWindow({
        content:contentString
        });
        marker.addListener('click',function(){
        infoWindow.open(map,marker);
        });
    }
    return marker;
}
        
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {lat: 37.3947464, lng: 127.1090181}
    });
    window.map = map

    var oms = new OverlappingMarkerSpiderfier(map, { 
        markersWontMove: true,   // we promise not to move any markers, allowing optimizations
        markersWontHide: true,   // we promise not to change visibility of any markers, allowing optimizations
        basicFormatEvents: true  // allow the library to skip calculating advanced formatting information
    }); 

    var script = document.createElement('script')
    script.src = './trp.geojsonp'
    document.getElementsByTagName('head')[0].appendChild(script)

    window.ams_callback = function(results) {
        for (var i = 0; i < results.features.length; i++) {
            var coords = results.features[i].geometry.coordinates;
            iconString = "";
            if (results.features[i].properties.type === "중소기업부설연구소"){
                iconString = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            }else if (results.features[i].properties.type === "벤처기업부설연구소"){
                iconString = "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            }else if (results.features[i].properties.type === "대기업부설연구소"){
                iconString = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            }else if (results.features[i].properties.type === "중견기업부설연구소"){
                iconString = "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
            }else {
                iconString = "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            }
            var marker = {corrds: {lat : parseFloat(coords[0]), lng : parseFloat(coords[1])}, iconImage:iconString, properties:results.features[i].properties}
            mrk = addMarker(marker,map)
            gmarkers.push(mrk);
            oms.addMarker(mrk);
            companyDic[results.features[i].properties.name] = results.features[i]
        }
        // var markerCluster = new MarkerClusterer(map, gmarkers,{imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
    }  
}

function search(keyword){
    result = []
    Object.keys(companyDic).forEach(function(key){
        lowKey = key.toLowerCase()
        if (lowKey.includes(keyword)){
            result.push(companyDic[key])
        }
    })
    return result
}

var timer
$('#searchInput').keyup(function () {
    clearTimeout(timer);
    timer = setTimeout(function (event) {
        var text = $('#searchInput').val();
        if (text === ""){
            $("#searchResult").html("")
            return
        }
        result = search(text)
        if (result.length > 0){
            $("#searchResult").html("")
            tmpString = '<ul class="list-group">\n'
            for (var i = 0 ; i < result.length ; i++){
                tmpString += '<li class="list-group-item">'+ result[i].properties.name +'</li>\n'
            }
            tmpString += '</ul>'
            $('#searchResult').append(tmpString)

            $(".list-group-item").on("click", function(){
                toMove($(this).text())
            })

        }else{
            $("#searchResult").html("")
        }

    }, 500);
});

function toMove(keyword){
    center = new google.maps.LatLng(companyDic[keyword].geometry.coordinates[0], companyDic[keyword].geometry.coordinates[1])
    window.map.panTo(center)
    window.map.setZoom(20)
    timer = setTimeout(function (event) {
        window.map.setZoom(16)
    }, 750);
}