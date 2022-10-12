"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.autoCompleteSave = void 0

const config_1 = require("../config")
const vscode_1 = require("vscode")
const node_fetch_1 = require("node-fetch")
/**
 *
 * @param {string} input
 * @returns {SearchMatchResult | undefined}
 */
var checkTime
var lastSentence = ""

async function autoCompleteSave(text, obj, userId) {
	const promise = new Promise(async (resolve, reject) => {
		if (text.length) {
			var addToStorage = false
			var acceptType = ''
			clearInterval(checkTime)

			var count = 0
			var sentence = ""
			for (const k in obj) {
				var lastLine = text
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
			var lastLine = text
			if (text.includes('\n')) lastLine = text.split('\n')[text.split('\n').length-1].trim()
			if (!sentence && lastLine.includes('?')==false && text.length>10){
				const response = await (0, node_fetch_1.default)('https://useblackbox.io/suggest', {
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
				const result = await response.json();
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
					acceptType: acceptType
				})
			} else {
				resolve({
					complete: false,
					save: addToStorage,
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
	return promise
}
exports.autoCompleteSave = autoCompleteSave