(function RDStationIntegration() {
  var SERVER_ORIGIN = 'https://je5ypxtc6b.execute-api.us-west-2.amazonaws.com';
  var CLIENT_ID = '12051950-222a-4513-bf02-638364768099';
  var REDIRECT_URL = 'https://je5ypxtc6b.execute-api.us-west-2.amazonaws.com/dev/oauth/callback';
  var LEGACY_TOKENS_ENDPOINT = 'https://app-staging.rdstation.com.br/api/v2/legacy/tokens';
  var newWindowInstance = null;

  function oauthIntegration(message) {
    if (message.origin === SERVER_ORIGIN) {
      persist(message);

      if (newWindowInstance) {
        newWindowInstance.close();
      }
    }
  }

  function bindButton() {
    var button = document.querySelector('.rd-oauth-integration');

    button.addEventListener('click', function () {
      newWindowInstance = window.open('https://app-staging.rdstation.com.br/api/platform/auth?client_id=' + CLIENT_ID + '&;redirect_url=' + REDIRECT_URL, '_blank')
    })
  }

  function listenForMessage() {
    window.addEventListener('message', oauthIntegration);
  }

  function persist(message) {
    jQuery(document).ready(function ($) {
      var tokens = JSON.parse(message.data);
      var data = {
        action: 'rd-persist-tokens',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }

      jQuery.ajax({
        method: "POST",
        url: ajaxurl,
        data: data,
        success: function() {
          persistLegacyTokens(tokens.accessToken)
        }
      });
    });
  }

  function persistLegacyTokens(accessToken) {
    jQuery.ajax({
      url: LEGACY_TOKENS_ENDPOINT,
      headers: { 'Authorization':'Bearer ' + accessToken },
      method: 'GET',
      success: function(data){
        data.action = 'rd-persist-legacy-tokens';
        jQuery.post(ajaxurl, data);
      }
    });
  }

  function init() {
    bindButton();
    listenForMessage();
  }

  window.addEventListener('load', init);
})();
