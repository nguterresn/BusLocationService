<?php require '../../db/connection.php';

    $query = "SELECT * FROM main"; 
    $result_insert = mysqli_query($conn, $query);

	/* necessary to initialize it outside the loop */
	$responseObject = array();

    while ($row = mysqli_fetch_array($result_insert)):

		$id = $row['BUSES'];
      	$lat = $row['LAT'];
		$lng = $row['LNG'];

		$responseObject[] = 
			array(
			'id' => $id, 
			'lat' => $lat, 
			'lng' => $lng
			);

	endwhile;
	
	/*
	{
		*   0: {id: "1", lat: "41.2837105", lng: "-8.5676966"}, 
		*   1: {id: "3", lat: "41.2837906", lng: "-8.5683556"}
	}
	*/

    echo json_encode($responseObject);

?>