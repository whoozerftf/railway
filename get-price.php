<?php
// Ganti dengan API Key WooCommerce Anda
$consumer_key = 'ck_4ed430706ce25363f8a632fae3b289c7b192f8a4';
$consumer_secret = 'cs_ac131f9611efe779900c96d552d5d09b30efeb6e';

// Ambil product_id dari query string
$product_id = isset($_GET['id']) ? $_GET['id'] : '';

if (!$product_id) {
    echo json_encode(['error' => 'Product ID required']);
    exit;
}

$url = "https://checkout.whoozer.xyz/wp-json/wc/v3/products/$product_id";

// Inisialisasi CURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, "$consumer_key:$consumer_secret");
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);

$response = curl_exec($ch);

$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

header('Content-Type: application/json');
if ($http_code == 200 && $response) {
    echo $response;
} else {
    echo json_encode([
        'error' => 'Product not found or API error',
        'http_code' => $http_code,
        'response' => $response
    ]);
}
?>