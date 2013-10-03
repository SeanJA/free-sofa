<?php

require 'config.php';

if($_POST['key'] !== $config['key']){
	header("HTTP/1.0 404 Not Found");
	die();
}

$latitude = $_POST['latitude'];
$longitude = $_POST['longitude'];

$db = new PDO('mysql:host=localhost;dbname='.$config['db_name'].';charset=utf8', $config['username'], $config['password']);

$stmt = $db->prepare('INSERT INTO  sofas (
						id ,
						latitude ,
						longitude ,
						created
						)
						VALUES (
						NULL ,  :latitude,  :longitude, 
						CURRENT_TIMESTAMP
						);');
$stmt->bindParam(':longitude', $longitude);
$stmt->bindParam(':latitude', $latitude);
$stmt->execute();
return $db->lastInsertId();