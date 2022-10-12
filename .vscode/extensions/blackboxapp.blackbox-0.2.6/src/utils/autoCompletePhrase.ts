import fetch from 'node-fetch';
var lastSentence = ""

export async function autoCompleteSave(text: string, obj: any, userId: any): Promise<{complete: any, save: any, line: any, acceptType: any}> {
	const promise = new Promise<{complete: any, save: any, line: any, acceptType: any }>(async (resolve, reject) => {
		if (text.length) {
			var addToStorage = false
			var acceptType = ''

			var count = 0
			var sentence = ""
			for (const k in obj) {
				var lastLine: any = text
				if (text.includes('\n')) lastLine = text.split('\n')[text.split('\n').length-1].trim()
				if (k.startsWith(lastLine)) {
					if (count === 0) {
						count = obj[k].uses
						sentence = k
					} else {
						if (obj[k].uses > count) {
							count = obj[k].uses
							sentence = k
						}
					}
				}
			}
			if (sentence) {
				text = lastLine
				acceptType = 'Saved Line Or Snippet'
			}
			var lastLine: any = text
			if (text.includes('\n')) lastLine = text.split('\n')[text.split('\n').length-1].trim()
			if (!sentence && lastLine.includes('?')==false && text.length>10){
				const response = await fetch('https://useblackbox.io/suggest', {
					method: 'POST',
					body: JSON.stringify({
						inputCode: text,
						source: "visual studio",
						userId: userId
					}),
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
				});
				const result = await response.json()
				try{
					sentence = result['response']
					sentence = sentence.trim();
					acceptType = 'Code Complete'
				}catch(e){}
			}
			lastSentence = text
			if (sentence) {
				resolve({
					complete: sentence.slice(text.length, sentence.length),
					save: addToStorage,
					line: "",
					acceptType: acceptType
				})
			} else {
				resolve({
					complete: false,
					save: addToStorage,
					line: "",
					acceptType: ''
				})
			}
		} else {
			addToStorage = false
			if (obj[lastSentence] === undefined) {
				addToStorage = true
			}
			resolve({
				complete: false,
				save: addToStorage,
				line: lastSentence,
				acceptType: ''
			})
		}
	})
	return promise;
}