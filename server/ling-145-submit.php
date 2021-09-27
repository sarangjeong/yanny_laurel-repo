<?php
header("Access-Control-Allow-Origin: https://stanford.edu");

print_r($_POST);




$fp = fopen('data_ling145/ling-145-yannny_laurel-data.csv', 'a');

$part_id = bin2hex(mcrypt_create_iv(22, MCRYPT_DEV_URANDOM));

$i = 0;
foreach ($_POST['trials'] as $trial) {
    $trial = array_merge($trial, $_POST['subject_information'], array("condition" => $_POST['condition'], "trial" => $i++, "participant" => $part_id));
    fputcsv($fp, $trial);
}

fclose($fp);

?>
