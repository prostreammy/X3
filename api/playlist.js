// api/playlist.js
const channels = [
  {
    name: "Ria C",
    logo: "https://get.perfecttv.net/logo/ria.png",
    group: "MALAYSIA",
    number: "119",
    url: "https://load.perfecttv.net/rwt.mpd?username=vip_r92bmh1k&password=yb3IpqrB&channel=riahd",
    type: "dash",
    licenseKey: "d5249cb40505495494828f42c37087cb:d59f6a7bed00bd5348355ab5b3ee6aa0"
  },
  {
    name: "TV1 HD",
    logo: "https://get.perfecttv.net/logo/tv1.png",
    group: "MALAYSIA",
    number: "101",
    url: "https://get.perfecttv.net/dash2.mpd?username=vip_r92bmh1k&password=yb3IpqrB&channel=tv1",
    type: "dash",
    licenseKey: "912760c409eb5aff3e060422c502f410:bea2d0f89fb3fbafa1fc9f34ba8734a6"
  },
  {
    name: "TV3 HD",
    logo: "https://get.perfecttv.net/logo/tv3.png",
    group: "MALAYSIA",
    number: "103",
    url: "https://get.perfecttv.net/get_tonton_live.m3u8?username=vip_r92bmh1k&password=yb3IpqrB&episode_id=6420323&channel=tv3",
    type: "hls"
  },
  {
    name: "HBO",
    logo: "https://get.perfecttv.net/logo/hbohd.png",
    group: "MOVIES",
    number: "141",
    url: "https://get.perfecttv.net/dash2.mpd?username=vip_r92bmh1k&password=yb3IpqrB&channel=hbo",
    type: "dash",
    licenseKey: "a098896d2b11c5f3906a993c3ba5c610:f3f842c54cc96cbbd0bcb96a4cb8a813"
  },
  {
    name: "AXN",
    logo: "https://get.perfecttv.net/logo/axn.png",
    group: "ENTERTAINMENT",
    number: "168",
    url: "https://get.perfecttv.net/astro_10802.mpd?username=vip_r92bmh1k&password=yb3IpqrB&channel=axn",
    type: "dash",
    licenseKey: "c24a7811d9ab46b48b746a0e7e269210:c321afe1689b07d5b7e55bd025c483ce"
  },
  {
    name: "tvN HD",
    logo: "https://get.perfecttv.net/logo/tvn.png",
    group: "KOREAN",
    number: "201",
    url: "https://get.perfecttv.net/dash2.mpd?username=vip_r92bmh1k&password=yb3IpqrB&channel=tvn",
    type: "dash",
    licenseKey: "faf4d62bb898de503446c28fb1aa9210:19e80ecc5d337215c64004cb49c9cb01"
  }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'GET') {
    res.status(200).json(channels);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
