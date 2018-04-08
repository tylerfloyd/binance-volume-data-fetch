// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const firebase = require('firebase-admin');
firebase.initializeApp(functions.config().firebase);

// AJAX requests
const axios = require('axios');

// Utility for helper methods
const _ = require('lodash');

// load environment variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

exports.getData = functions.https.onRequest((request, response) => {
    const ref = firebase.app().database().ref();
    const coins = ref.child('coins');
    
    axios.get(functions.config().process.env.apiuri)
        .then((response) => {
            const result = {};
            let translatedCoin = {};
            console.log(response.data);
            if( response.status === 200){
                
                response.data.resu.pop();
                
                _.map(response.data.resu, (coin) => {
                    transalatedCoin = transalate( coin );
                    Object.assign(result, transalatedCoin );
                });
            }

            if(!_.isEmpty(result)){
                coins.update(result);
            }        

            response.send(response.status);
            return true;
        })
        .catch((error) => {
            console.log(error);
            response.send(JSON.stringify(error));
        });

    // Take the crappy strings that are handed back and translate into an object
    function transalate(coin){  
        const coinArray = _.split(coin,'|');
        let transalated = {};

        /**
         * index 0 - coin
         * index 1 - pings
         * index 2 - net vol btc
         * index 3 - net vol %
         * index 4 - total btc vol in last hour
         * index 5 - previous minute vol %
         * index 6 - previous minute net volume
         * index 7 - last update
         */

        if( coinArray.length > 1 ){
            transalated[coinArray[0]] = {
                coin: coinArray[0],
                pingCount: Number(coinArray[1]),
                netVol: Number(coinArray[2]),
                netVolPercent: coinArray[3],
                minuteVol: Number(coinArray[6]),
                minuteVolPercent: coinArray[5],
                updated: new Date().getTime()
            };
        }

        return transalated;
    }
});
