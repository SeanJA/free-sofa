<?php

require 'config.php';

if($_GET['key'] !== $config['key']){
	header("HTTP/1.0 404 Not Found");
	die();
}

$latitude = $_GET['latitude'];
$longitude = $_GET['longitude'];

$db = new PDO('mysql:host=localhost;dbname='.$config['db_name'].';charset=utf8', $config['username'], $config['password']);

$stmt = $db->prepare('SELECT longitude, latitude, ( 6371 * acos( cos( radians(:latitude) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(:longitude) ) + sin( radians(:latitude) ) * sin( radians( latitude ) ) ) ) AS distance
 FROM sofas 
 ORDER BY distance 
 LIMIT 0 , 10;');
$stmt->bindParam(':longitude', $longitude);
$stmt->bindParam(':latitude', $latitude);
$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($rows);