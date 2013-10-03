<?php

require 'config.sample.php';

if($_POST['key'] !== $config['key']){
	header("HTTP/1.0 404 Not Found");
	die();
}

$db = new PDO('mysql:host=localhost;dbname='.$config['db_name'].';charset=utf8', $config['username'], $config['password']);

$db->exec("DELETE FROM sofas WHERE created < (NOW() - INTERVAL 1 DAY)");