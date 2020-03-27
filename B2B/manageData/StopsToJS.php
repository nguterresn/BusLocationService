<?php require '../../db/connection.php';

    $query = "SELECT * FROM stops"; 
    $result_query = mysqli_query($conn, $query);

    /* necessary to initialize it outside the loop */
	$responseObject = array();

    while ($row = mysqli_fetch_array($result_query)):

		$id = $row['BUSES'];
      	$stops = json_decode($row['STOPS']);

		$responseObject[] = 
			array(
            'id' => $id,
			'stops' =>  $stops, 
			);

    endwhile;
    
    echo json_encode($responseObject);

?>