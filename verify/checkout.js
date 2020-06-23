var request = require('request');
var queryObject = window.location.search;
var urlParams = new URLSearchParams(queryObject);
var transactionId = urlParams.get('transaction_id');
  var options = {
    'method': 'GET',
    'url': `https://api.flutterwave.com/v3/transactions/${parseInt(transactionId)}/verify`,
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer FLWSECK_TEST-a0c7f66918bc15d9e7eb2a65146cbd79-X'
    }
  };
  request(options, function (error, response) { 
    if (error) throw new Error(error);
    var responseObject = JSON.parse(response.body);
    
    var totalAmt = urlParams.get('total');
    var ref = urlParams.get('tx_ref');
    console.log(totalAmt);
    console.log(ref);
    console.log(transactionId);
    console.log(responseObject);
    
    // if(responseObject.data.tx_ref == tx_ref){
    //   if(responseObject.status == 'success'){
    //     if(responseObject.data.amount == total){
    //       // window.location.href = '/success';
    //       console.log('hi');
    //     }
    //   }
    // }
  });
















