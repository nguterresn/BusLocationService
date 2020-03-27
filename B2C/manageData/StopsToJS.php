<?php require '../../db/connection.php';

    /**
     * Request From B2C/index.js 
     * Req.send(BusID);
     */
    if(!empty($_GET['BusID'])) {

        $get_id = $_GET['BusID'];

        $query = "SELECT * FROM stops WHERE BUSES='$get_id'"; 
        $result_query = mysqli_query($conn, $query);

        /* if fails to find BUS = ID */
        if (!$result_query) {


        } else {

            $row = mysqli_fetch_array($result_query);

            echo $row['STOPS'];
        }


    } //lse echo json_encode("No input number inserted!");

?>