<?php
$servername = "localhost";
$username = "root";
$password = "";
$db="BusGPS";

// Create connection
$conn = new MySQLi($servername, $username, $password, $db);

// Check connection
if ($conn->connect_error) {
    //echo "Connection error!";
    
    die("Connection failed: " . $conn->connect_error);
} 

?>