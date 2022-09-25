import fetch from "node-fetch";

export default async function (url) {
	return new Promise((resolve, reject) => {
		fetch(url, {
			"headers": {
				"accept": "text/html, */*; q=0.01",
				"accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
				"cache-control": "no-cache",
				"pragma": "no-cache",
				"sec-ch-ua": "\"Microsoft Edge\";v=\"107\", \"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"cookie": "cna=eY6BGb2h7yACAbSMsOm2vFG2; sca=5a4237a6; atpsida=6e052f524a88bc925aed09c0_1664038526_68",
				"Referer": url,
				"Referrer-Policy": "strict-origin-when-cross-origin"
			},
			"body": null,
			"method": "GET"
		}).then(res => {
			resolve(res.text());
		});
	});
}