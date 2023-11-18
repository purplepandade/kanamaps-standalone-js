document.addEventListener('DOMContentLoaded', (event) => {
	//check if MapId is used
	if (!document.querySelector('#map')) {
		return;
	}

	((g) => {
		var h,
			a,
			k,
			p = 'The Google Maps JavaScript API',
			c = 'google',
			l = 'importLibrary',
			q = '__ib__',
			m = document,
			b = window;
		b = b[c] || (b[c] = {});
		var d = b.maps || (b.maps = {}),
			r = new Set(),
			e = new URLSearchParams(),
			u = () =>
				h ||
				(h = new Promise(async (f, n) => {
					await (a = m.createElement('script'));
					e.set('libraries', [...r] + '');
					for (k in g)
						e.set(
							k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()),
							g[k]
						);
					e.set('callback', c + '.maps.' + q);
					a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
					d[q] = f;
					a.onerror = () => (h = n(Error(p + ' could not load.')));
					a.nonce = m.querySelector('script[nonce]')?.nonce || '';
					m.head.append(a);
				}));
		d[l] ? console.warn(p + ' only loads once. Ignoring:', g) : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
	})({
		key: 'AIzaSyBb0ALD0brE5h8b3RXpzPs3kMjjzoxsQUQ',
		// Add other bootstrap parameters as needed, using camel case.
		// Use the 'v' parameter to indicate the version to load (alpha, beta, weekly, etc.)
	});

	let locations = [];

	let map;
	let markers = [];
	let infoWindows = [];

	async function initMap() {
		//@ts-ignore
		const { Map } = await google.maps.importLibrary('maps');

		map = new Map(document.querySelector('.map_map-holder'), {
			center: { lat: -34.397, lng: 150.644 },
			zoom: 8,
		});

		let locationDiv = document.querySelector('[c-el="all-apothecaries-list"]');
		let LocationNodes = locationDiv.querySelectorAll('[c-el="apothecary"]');
		LocationNodes.forEach((location) => {
			let locationData = JSON.parse(location.getAttribute('data-apothecary'));
			locationData.clickNode = location;
			locations.push(locationData);
		});

		let bounds = new google.maps.LatLngBounds();

		function openInfo(mapMarker, infowindow) {
			infoWindows.forEach((infowindow) => {
				infowindow.close();
			});
            map.panTo(mapMarker.getPosition());
			infowindow.open({
				anchor: mapMarker,
				map,
			});
		}

		locations.forEach((location, index) => {
			let marker = {};
			marker.lat = location._vendor.location.latitude;
			marker.lng = location._vendor.location.longitude;
			marker.latlng = new google.maps.LatLng(marker.lat, marker.lng);
            marker.htmlNode = location.clickNode;

			var mapMarker = new google.maps.Marker({
				position: marker.latlng,
			});

			let contentString = `<div style="text-align:center;"><b>${location._vendor.name}: </b>
                <br>
                <b>${location._vendor.strasse_und_nummer}</b>
                <br>
                <b>${location._vendor.PLZ} ${location._vendor.Stadt}</b>

                <br>
                <a href="${location._vendor.live_url}">Zur Website</a>
            </div>`;
			const infowindow = new google.maps.InfoWindow({
				content: contentString,
			});

			infoWindows.push(infowindow);

			mapMarker.addListener('click', () => {
				openInfo(mapMarker, infowindow);
			});

            marker.htmlNode.addEventListener('click', () => {
                openInfo(mapMarker, infowindow);
            })

			bounds.extend(marker.latlng);
			mapMarker.setMap(map);
		});
		map.fitBounds(bounds);
	}

	function checkKannaMaps() {
		if (window.KannaMaps) {
			console.log('window.KannaMaps exists:', window.KannaMaps);
			initMap();
		} else {
			console.log('window.KannaMaps does not exist yet. Retrying in 1000ms...');
			setTimeout(checkKannaMaps, 1000);
		}
	}

	checkKannaMaps();
});
