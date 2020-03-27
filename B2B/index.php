<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>B2B View</title>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
    <link rel="stylesheet" href="css/index.css">
    <script defer src="https://ajax.googleapis.com/ajax/libs/d3js/5.15.0/d3.min.js"></script>
    <script defer src="./B2B/js/index.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCaK8XfI5ZK3_Ylc5WmzhxxcthaHwIrGIA&libraries=visualization"
      async defer></script>

</head>
<body> 

    <div class="container-fluid">

        <div class="container">

        <div id="title">
            <h2 class="text-center">B2B View</h2>
        </div>

        <div class="row">

            <div class="col-9 map" id="map"></div>

            <div class="col simu rounded">

                <div class="row">
                        <select class="select-css" name="busnumber" id="busnumber" >
                            <option value="none" selected="selected"></option>
                            <option value="1">Bus1</option>
                            <option value="2">Bus2</option>
                            <option value="3">Bus3</option>
                            <option value="all">All</option>
                        </select>
                </div>

                <div class="row btnStyle">
                    <button class="btn btn-dark btn-sm btn-block" id="focus">Focus</button>
                </div>

                <div class="row btnStyle">
                        <button class="btn btn-dark btn-sm btn-block" id="hidemarkers">Show/Hide Markers</button>
                </div>

                <div class="row btnStyle">
                    <button class="btn btn-dark btn-sm btn-block" id="hideline">Show/Hide Lines</button>
                </div>

                <div class="row btnStyle">
                    <button class="btn btn-dark btn-sm btn-block" id="hidedetails">Show/Hide Details</button>
                </div>

                <div class="row btnStyle">
                    <button class="btn btn-dark btn-sm btn-block" id="hidedebug">Show/Hide Debug Message</button>
                </div>

            </div>

            </div>

            <div class="row details" id="details">
            <div class="col" id="lat">
                <p class="text-center"><strong>Latitude</strong></p>
                <p class="text-center" id="lat-text"> </p>
            </div>

            <div class="col" id="lng">
                <p class="text-center"><strong>Longitude</strong> </p>
                <p class="text-center" id="lng-text"></p>
            </div>

            <div class="col" id="distance">
                <p class="text-center"><strong>Distance</strong></p>
                <p class="text-center" id="distance-text"></p>
            </div>

            <div class="col" id="velocity">
                <p class="text-center"><strong>Velocity</strong></p>
                <p class="text-center" id="velocity-text"></p>
            </div>

            <div class="col" id="totalDistance">
                <p class="text-center"><strong>Total Distance</strong></p>
                <p class="text-center" id="totalDist"></p>
            </div>
            </div>

        
        </div>
    
    </div>

</body>
</html>
