// ==UserScript==
// @name         GazelleGames GPH Item Set Info
// @version      0.2.0
// @description  Calculates which item set to use by the amount of GPH you currently have.
// @author       Piitchyy
// @namespace    https://github.com/No-Death/GGn-Scripts
// @match        https://gazellegames.net/user.php?action=equipment
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
  const myUserID = new URLSearchParams(
    document.body.querySelector('#nav_userinfo a.username').search
  ).get('id');
  let apiKey = GM_getValue('apiKey');

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
      const sidebar = document.getElementById('items_navigation');
      let newhtml = '';
      sidebar.innerHTML += '<br><h3>GPH Information</h3>';
      newhtml += `<tr><td>Base GPH:</td> <td>${Math.trunc(baseGph)}</td></tr>`;
      newhtml += `<tr><td>Buff GPH:</td> <td>${Math.trunc(gph)}</td></tr>`;
      if (baseGph >= 980) {
        newhtml += `<tr><td>Set to use:</td> <td><a href="https://gazellegames.net/shop.php?search=empowered%20amethyst%20fortune&item_type=%5B%5D&cost_type=all&cost_amount=&order_by=dateadded&order_way=desc&category=All">Amethyst Set!</a></td></tr>`;
      } else if (baseGph >= 180) {
        newhtml += `<tr><td>Set to use:</td> <td><a href="https://gazellegames.net/shop.php?search=empowered%20jade%20fortune&item_type=%5B%5D&cost_type=all&cost_amount=&order_by=dateadded&order_way=desc&category=All">Jade Set!</a></td></tr>`;
      } else if (baseGph >= 20) {
        newhtml += `<tr><td>Set to use:</td> <td><a href="https://gazellegames.net/shop.php?search=empowered%20quartz%20fortune&item_type=%5B%5D&cost_type=all&cost_amount=&order_by=dateadded&order_way=desc&category=All">Quartz Set!</a></td></tr>`;
      } else {
        newhtml += `<tr><td>Set to use:</td> <td>No set needed!</td></tr>`;
      }
      newhtml += `<tr><td><a href="https://gazellegames.net/shop.php?ItemID=2582">Baguette?:</a></td> <td>${
        baseGph >= 300 ? 'Yes' : 'No'
      }</td></tr>`;

      sidebar.innerHTML +=
        `<table id="ggn_gph_information">` + newhtml + `</table>`;
    },
    onerror: function (response) {
      console.log('Something went wrong');
    },
  });
  // Set the time when the request was made
  GM_setValue('lastFetch', Date.now());
})();
