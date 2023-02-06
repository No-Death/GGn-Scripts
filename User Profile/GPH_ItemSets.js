// ==UserScript==
// @name         GazelleGames GPH Item Set Info
// @version      0.1.3
// @description  Calculates which item set to use by the amount of GPH you currently have.
// @author       Piitchyy
// @namespace    https://github.com/No-Death/GGn-Scripts
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
  const lastFetch = GM_getValue('lastFetch');
  const userID = new URLSearchParams(location.search).get('id');
  const myUserID = new URLSearchParams(
    document.body.querySelector('#nav_userinfo a.username').search
  ).get('id');
  let apiKey = GM_getValue('apiKey');

  // Will only work on your own profile (So we dont spam the API)
  if (userID !== myUserID) {
    return;
  }

  // Check if the API key exists and if its been less than 2 seconds since last call
  if (apiKey && lastFetch && Date.now() - lastFetch < 2000) {
    console.log('Most likely Ratelimited');
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
      'X-API-Key': apiKey,
    },

    onload: function (response) {
      // If the API returns 401, delete API key
      if (response.status === 401) {
        GM_deleteValue('apiKey');
        alert(
          `You entered the wrong API key for 'GazelleGames GPH Item Set Info' \nMake sure it uses the "USER" permissions.`
        );
        location.reload();
      }
      // API was correct, continue.
      const data = JSON.parse(response.responseText);
      const gph = data.response.community.hourlyGold;
      const buff = data.response.buffs.TorrentsGold;
      const baseGph = gph / buff;
      const box = document.querySelector('.box_gold .head');
      let currentText = document.querySelector('.box_gold .head').innerHTML;
      if (baseGph >= 980) {
        document.querySelector('.box_gold .head').innerHTML =
          currentText + ' Empowered Amethyst Set!';
      } else if (baseGph >= 180) {
        document.querySelector('.box_gold .head').innerHTML =
          currentText + ' Empowered Jade Set!';
      } else if (baseGph >= 20) {
        document.querySelector('.box_gold .head').innerHTML =
          currentText + ' Empowered Quartz Set!';
      } else {
        document.querySelector('.box_gold .head').innerHTML =
          currentText + ' No set needed!';
      }
    },
    onerror: function (response) {
      console.log('Something went wrong');
    },
  });
  // Set the time when the request was made
  GM_setValue('lastFetch', Date.now());
})();
