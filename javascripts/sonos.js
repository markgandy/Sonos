var sonosSystem = (function () {
	var SOAP_ACTION_PREFIX = 'urn:schemas-upnp-org:service:AVTransport:1#';

	var PAUSED_PLAYBACK = 'PAUSED_PLAYBACK';
	var PLAYING = 'PLAYING';
	var STOPPED = 'STOPPED';

	var currentStatus = STOPPED;
	var currentAction;
	var track = {};

	return {
		play: function() {
			callAction('Play');
		},
		pause: function() {
			callAction('Pause');
		},
		next: function() {
			callAction('Next');
		},
		previous: function() {
			callAction('Previous');
		},
		getTransportInfo: function() {
			callAction('GetTransportInfo');
		},
		getPositionInfo: function() {
			callAction('GetPositionInfo');
		}
	}

	function callAction(action) {
		currentAction = action;
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
				'SOAPACTION' : SOAP_ACTION_PREFIX + action 
			},
			success: onSuccess, 
			error: onError
		});
	}

	function onSuccess(data, status, req) {
		console.log('success');
		currentStatus = $(req.responseXML).find('CurrentTransportState').text();

		if ('Play' === currentAction || 'Pause' === currentAction) {
			callAction('GetTransportInfo');
		}

		if('Next' === currentAction || 'Previous' === currentAction) {
			callAction('GetPositionInfo');
		}

		var metadata = $(req.responseXML).find('TrackMetaData').text();
		if (metadata) {
			track.title = $(metadata).find("dc\\:title").text(); //TODO: use namespace rather than hardcode
			track.artist = $(metadata).find("dc\\:creator").text(); //TODO: use namespace rather than hardcode
			track.album = $(metadata).find("upnp\\:album").text(); //TODO: use namespace rather than hardcode
		}

		updatePlayPause();
		updateCurrentPlaying();
		console.log(req.responseXML);
		console.log(currentStatus);
	}

	function onError(data) {
		console.log('error');
	}

	function updatePlayPause() {
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

	function updateCurrentPlaying() {
		$('#currentTrack').text(track.title);	
		$('#currentArtist').text(track.artist);	
		$('#currentAlbum').text(track.album);	
	}

}());

$(document).ready(function() {
	sonosSystem.getTransportInfo();
	sonosSystem.getPositionInfo();
});
