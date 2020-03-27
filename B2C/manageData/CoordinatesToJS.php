<?php require '../../db/connection.php';

	if(!empty($_GET['BusID'])) {

		$get_id = $_GET['BusID'];

		$query = "SELECT * FROM main WHERE BUSES='$get_id'"; 
		$result_query = mysqli_query($conn, $query);

		if (!$result_query) {
			# code...
		} else {

			$row = mysqli_fetch_array($result_query);

			$responseObject = array();

			$responseObject = array(
				'lat' => $row['LAT'], 
				'lng' => $row['LNG']
			);

			echo json_encode($responseObject);
			
		}

	} 

?>