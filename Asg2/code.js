/*
	SENG 513 W17 B01
	Assignment #2
	Mary Dane (ID#000290075)
*/
function getStats(txt) {
    return {
        nChars: getCharCount(txt),
        nWords: getWordCount(txt),
        nLines: getNumLines(txt),
        nNonEmptyLines: getNumNonEmptyLines(txt),
        averageWordLength: getAvgWordLength(txt),
        maxLineLength: getMaxLineLength(txt),
        palindromes: getPalindromes(txt),
        longestWords: getLongestWords(txt),
        mostFrequentWords: getMostFrequentWords(txt)
    };
}

/* Will contain the total number of characters in the text, including all white spaces. */
function getCharCount(string) {
	var result = 0; //to be returned
	
	result = string.length;
	
	return (result);
}

/* Will contain the total number of words in the text. 
	Example, “Hello, World 1!” contains three words: “Hello”, “World” and “1”. */
function getWordCount(string) {
	var result = 0; //to be returned
	var modifiedString = string.replace("\n", " ").split(/\s/g);//split string by whitespace characters
	
	for (var i=0; i<modifiedString.length; i++) {
		if (modifiedString[i].length > 0){
			result++;
		}
	}
	
	return (result);
}

/* Will contain the number of lines in the text. The only time this will be ‘0’ is when the text is empty. */
function getNumLines(string) {
	var result = 0; //to be returned
	
	result = string.split("\n").length;
	
	if (string.length < 1){
			result = 0;
	}
	
	return (result);
}

/* Will contain the number of lines in the text containing at least one visible character. We will define
	visible character as any character other than whitespace. */
function getNumNonEmptyLines(string) {
	var result = 0; //to be returned
	var modifiedString = string.split("\n"); //split string by lines
	
	for (var i=0; i<modifiedString.length; i++) { //remove all whitespace characters
		modifiedString[i] = modifiedString[i].replace(/\s{2,}/g, '');
	}
	
	// check for empty lines (lines of length <1)
	for (var i=0; i<string.split("\n").length; i++) { 
		if (modifiedString[i].length >= 1) {
			result++;
		}
	}
	
	return (result);
}
	
/* Will contain the average word length in the text. 
	Example: text “Hello, World 1!” would have average word length equal to (5+5+1)/3 = 3.666666. */
function getAvgWordLength(string) {
	var result = 0; //to be returned
	var numWords = getWordCount(string);
	
	//find total number of non-whitespace characters
	result = string.replace(/\s/g, '').length;
	
	//find the average word length in the text
	result /= numWords;
	
	return (result);
}
	
/* Will contain the length of the longest line. Line length will be computed by counting the number of
	characters in the line, including any trailing white spaces, except newline ‘\n’. */
function getMaxLineLength(string) {
	var result = 0; //to be returned
	var splitString = string.split("\n"); //split string by lines
	
	for (var i=0; i<splitString.length; i++) {
		if (splitString[i].length > result) {
			result = splitString[i].length;
		}
	}
	
	return (result);
}

 
/* Will contain a list of unique palindromes in the text. Palindrome is a word with length > 2, which reads
	the same forward and backwards.
	Example: “Kayak, mom, MOM, XXx and 10z01 zz” contains 4 unique palindromes:
		[“kayak”, “mom”, “xxx”, “10x01”].
	Palindromes should be reported in the same order they appear in the text.  */
function getPalindromes(string) {
	var result = [];	//to be returned
	var checkPalindrome = "";
	var modifiedString = cleanupString(string).split(" "); //cleanup the text and split by the space character

	//for each word, check to see if it is a palindrome. If it is, add to the result array
	for (var i=0; i<modifiedString.length; i++) {
		if (modifiedString[i].length > 2) {
			checkPalindrome = modifiedString[i].split("").reverse().join(""); //reverse word for comparision
			if (modifiedString[i] === checkPalindrome) { //is a palindrome
				result.push(modifiedString[i]);
			}
		}
	}
	
	return result;
}
	
/* Will contain the 10 longest words in the text. In case of ties, the secondary sorting criteria should be
	alphabetical sorting.
	Example: “0, XXX, YYYY,  AAAA, BBB” will yield a list: [“yyyy”, “aaaa”, ”bbbb”,“xxx”, ”0”]. */
function getLongestWords(string) {
	var result = []; //to be returned
	var modifiedString = cleanupString(string).split(" "); //cleanup the text and split by the space character

	//remove any empty indices (typically a single space before the first word of the text)
	for (var i=0; i<modifiedString.length; i++) {
		if (modifiedString[i].length < 1) {
			modifiedString.splice(i, i+1);
		}
	}
	
	//sort by length and by dictionary order
	modifiedString.sort(compareLengthAlphabetical);
	
	//return top 10 (if possible) longest words
	var maxWords = 10;
	if (modifiedString.length < maxWords) {
		maxWords = modifiedString.length;
	}
	for (var i=0; i<maxWords; i++) {
		result.push(modifiedString[i]);
	}
	
	return result;
}
	
/* Will contain the 10 most frequent  words in the text, concatenated with their respective frequencies.
	Use alphabetic sorting to to resolve frequency ties. The results will include the corresponding
	frequencies appended to the actual words surrounded by brackets.
	Example: the text “The,the,THE,and,AND,and,it,IT” should yield a list [“and(3)”, “the(3)”, “it(2)”]. */
function getMostFrequentWords(string) {
	var result = []; //to be returned
	var modifiedString = cleanupString(string).split(" "); //cleanup the text and split by the space character
	var preResult = []; //will contain the full list of word frequencies
	
	//remove any empty indices (typically a single space before the first word of the text)
	for (var i=0; i<modifiedString.length; i++) {
		if (modifiedString[i].length < 1) {
			modifiedString.splice(i, i+1);
		}
	}
	
	//sort by length and by dictionary order
	modifiedString.sort(compareLengthAlphabetical);
	
	for (var i=0; i<modifiedString.length; i++) {
		if (!wordExists(preResult, modifiedString[i])) { //word does not already exist in preResult
			preResult.push({word:modifiedString[i], frequency:1});
		}
		else { //word already exists in preResult
			preResult = updateCounter(preResult, modifiedString[i]);
		}
	}
	
	//sort by descending word frequency
	preResult.sort(compareFrequencies);

	//copy top 10 (if possible) most frequent words into result array
	var maxWords = 10;
	if (preResult.length < maxWords) {
		maxWords = preResult.length;
	}
	for (var i=0; i<maxWords; i++) {
		result.push(preResult[i].word + "(" + preResult[i].frequency + ")");
	}
	
	return result;
}

/* Replaces special characters (except for \ and ') and removes extra white space characters. */
function cleanupString(string) {
	var modifiedString = string.toLowerCase().replace(/[^\sa-z0-9\\']+/g, " ").replace(/\s{1,}/g, " ");
	return (modifiedString);
}

/* Checks to see if a word exists in an object array already. */
function wordExists(preResult, theWord) {
	var result = false;
	
	for (var i=0; i<preResult.length; i++) {
		if (preResult[i].word == theWord) {
			result = true;
			break;
		}
	}
	
	return result;
}

/* Increments a specified word's frequency. */
function updateCounter(preResult, theWord) {
	for (var i=0; i<preResult.length; i++) {
		if (preResult[i].word === theWord) {
			preResult[i].frequency++;
			break;
		}
	}
	return (preResult);
}

/* For sorting by word length or alphabetical order. */
function compareLengthAlphabetical(a, b) {
	return (b.length - a.length || a.localeCompare(b))
}

/* For sorting by word frequency or alphabetical order. */
function compareFrequencies(a, b) {
	if (a.frequency < b.frequency) {
		return 1;
	}
	else if (a.frequency > b.frequency) {
		return -1;
	}
	else {
		return (a.word.localeCompare(b.word));
	}
}