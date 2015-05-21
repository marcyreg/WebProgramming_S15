function parse(){
	request = new XMLHttpRequest();
	request.open ("GET", "data.json", true);
	request.onreadystatechange = parseData;
	request.send();
}

function parseData(){
	if (request.readyState == 4 && request.status == 200){
		converted = JSON.parse(request.responseText);
		messagesDiv = document.getElementById("messages");
		for (i = 0; i < converted.length; i++){
			messagesDivHTML = "<p>" + (converted[i]["content"]) + "</p>";
			messagesDiv.innerHTML += messagesDivHTML;
		}
	}
}
