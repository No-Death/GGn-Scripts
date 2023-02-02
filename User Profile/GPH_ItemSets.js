// ==UserScript==
// @name         GazelleGames GPH Item Set Info
// @version      0.1.0
// @description  Calculates which item set to use by the amount of GPH you currently have.
// @author       Piitchyy
// @match        https://gazellegames.net/user.php?id=*
// @license      MIT
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';
  let lastFetch;
  const userID = new URLSearchParams(location.search).get('id');
  const myUserID = new URLSearchParams(
    document.body.querySelector('#nav_userinfo a.username').search
  ).get('id');
  let apiKey = GM_getValue('apiKey');
  if (userID !== myUserID) {
    return;
  }

  // Check if the API key exists and if its been more than 2 seconds since last call
  if (apiKey && lastFetch && Date.now() - lastFetch < 2000) {
    return;
  }

  // Get the API key from the user
  if (!apiKey) {
    apiKey = prompt('Enter your API key with the "USER" permission').trim();
    GM_setValue('apiKey', apiKey);
  }

  // Start the API request
  GM_xmlhttpRequest({
    method: 'GET',
    url: `https://gazellegames.net/api.php?request=user&id=${myUserID}`,
    headers: {
      'X-API-Key': GM_getValue('apiKey'),
    },

    onload: function (response) {
      const data = JSON.parse(response.responseText);
      const gph = data.response.community.hourlyGold;
      const buff = data.response.buffs.TorrentsGold;
      const baseGph = gph / buff;
      const box = document.querySelector('.box_gold .head');
      if (baseGph >= 980) {
        box.append('Empowered Amethyst Set!');
        let currentText = document.querySelector('.box_gold .head').innerHTML;
        document.querySelector('.box_gold .head').innerHTML =
          currentText + ' Empowered Amethyst Set!';
      } else if (baseGph >= 180) {
        box.append = 'Empowered Jade Set!';
        let currentText = document.querySelector('.box_gold .head').innerHTML;
        document.querySelector('.box_gold .head').innerHTML =
          currentText + ' Empowered Jade Set!';
      } else if (baseGph >= 20) {
        box.append = 'Empowered Quertz Set!';
        let currentText = document.querySelector('.box_gold .head').innerHTML;
        document.querySelector('.box_gold .head').innerHTML =
          currentText + ' Empowered Quertz Set!';
      } else {
        box.append = 'No sets needed!';
        console.log('No sets needed!');
      }
    },
    onerror: function (response) {
      // If the API returns 401, delete API key
      if (response.status === 401) {
        GM_deleteValue('apiKey');
        alert(
          `You entered the wrong API key for 'GazelleGames GPH Item Set Info' \n Make sure it uses the "USER" permissions.`
        );
        location.reload();
      }
      console.log('Something went wrong');
    },
  });
  // Set the time when the request was made
  GM_setValue('lastFetch', Date.now());
})();
