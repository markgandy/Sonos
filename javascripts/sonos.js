$(document).ready(function() {
	invokeSonos('GetTransportInfo', true);
	invokeSonos('GetPositionInfo', true);
});

var invokeSonos = function (action, processResponse) {
	var soapAction = 'urn:schemas-upnp-org:service:AVTransport:1#' + action;

	var soapRequest = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><s:Body><u:'
				+ action
				+ ' xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Speed>1</Speed></u:'
				+ action 
				+ '></s:Body></s:Envelope>';
	
	$.ajax({
		url: 'http://10.1.1.10:1400/MediaRenderer/AVTransport/Control', //TODO: discover IP address
		type: 'POST',
		dataType: 'xml',
		data: soapRequest,
		contentType: 'text/xml; charset="utf-8"',
		headers : {
			'CONNECTION' : 'close',
			'SOAPACTION' : soapAction 
		},
        success: onSuccess, 
        error: onError
	});

	function onSuccess(data, status, req) {
		console.log('success');
		if (processResponse) {
			var currentStatus = $(req.responseXML).find('CurrentTransportState').text();
			var track = new Array();
			var metadata = $(req.responseXML).find('TrackMetaData').text();
			track['title'] = $(metadata).find("dc\\:title").text(); //TODO: use namespace rather than hardcode
			track['artist'] = $(metadata).find("dc\\:creator").text(); //TODO: use namespace rather than hardcode
			track['album'] = $(metadata).find("upnp\\:album").text(); //TODO: use namespace rather than hardcode
			updateCurrentPlaying(track);
		}
		updatePlayPause(currentStatus);
		console.log(req.responseXML);
		console.log(currentStatus);
	}

	function onError(data) {
		console.log('error');
	}

	function updatePlayPause(currentStatus) {
		var PAUSED_PLAYBACK = 'PAUSED_PLAYBACK';
		var PLAYING = 'PLAYING';
		var STOPPED = 'STOPPED';
		if (currentStatus === PAUSED_PLAYBACK || currentStatus === STOPPED) {
			$('#playButton').show();	
			$('#pauseButton').hide();	
		} 
		if (currentStatus === PLAYING) {
			$('#pauseButton').show();	
			$('#playButton').hide();	
		} 
		//TODO: show stop button when radio is playing (not possible to pause a radio stream)
	}

	function updateCurrentPlaying(track) {
		$('#currentTrack').text(track['title']);	
		$('#currentArtist').text(track['artist']);	
		$('#currentAlbum').text(track['album']);	
	}

}
