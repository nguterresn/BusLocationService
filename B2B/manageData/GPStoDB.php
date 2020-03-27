<? require '../../db/connection.php';

    if(!empty($_POST['lat']) && !empty($_POST['lng']) && !empty($_POST['id'])) {

        $lat = floatval($_POST['lat']);
        $lng = floatval($_POST['lng']);
        $id = $_POST['id'];

        $sql_check = "SELECT * FROM main WHERE BUSES='$id'"; 
        $result_check = mysqli_query($conn, $sql_check);

        /* Creates Row */
        if (mysqli_num_rows($result_check) < 1) {

            $sql_insert = "INSERT INTO `main` (`BUSES`, `LAT`, `LNG`) VALUES ('$id', '$lat', '$lng')";
            $result_insert = mysqli_query($conn, $sql_insert);

            //since this is an INSERT INTO, mysqli_query returns TRUE or FALSE
            if ($result_insert) {
                echo "Data inserted to ID: ".$id;
            } else {
                echo "Error inserting data to ID: ".$id;
            }

            mysqli_close($conn);

        } 
        /* Updates Row */
        else {

            $sql_update = "UPDATE main SET LAT='$lat', LNG='$lng' WHERE BUSES='$id'";
            $result_update = mysqli_query($conn, $sql_update);

            if ($result_update) {
                echo "Data updated to ID: ".$id;
            } else {
                echo "Error updating data to ID: ".$id;
            }

            mysqli_close($conn);

        }
    
    }

?> 