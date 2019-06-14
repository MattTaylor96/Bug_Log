let bugForm = document.getElementById("bug-form");
let bugLog = JSON.parse(localStorage.getItem("BugLog"));
let bugSubject = document.getElementById("subject");
let bugDesc = document.getElementById("description");
let bugPriority =  document.getElementById("priority");
let bugDisplay = document.getElementById("open-issue-list");
let closedBugDisplay = document.getElementById("closed-issue-list");
let modal = document.getElementById("edit-details");

window.onload = init();

function init(){
	loadBugs();
	addEventListeners();
}

function loadBugs(){
	if(!bugLog){
		// If the local storage is empty, raise a new empty array
		bugLog = [];
	}
	let openCount = 1;
	let closedCount = 1;
	// Clear bugs display before populating
	bugDisplay.innerHTML = "<h3>Open Bugs</h3>";
	closedBugDisplay.innerHTML = "<h3>Closed Bugs</h3>";
	// Loop through all bugs in storage
	for(let i = 0; i < bugLog.length; i++){
		if(bugLog[i].status == "Open"){
			let bugContainer;
			// Create new container and assign class
			bugContainer = document.createElement("div");
			bugContainer.classList.add("bug-container");
			// Add bug ID as data attributes
			bugContainer.setAttribute('data-id', bugLog[i].bugID);
			// Assign content to container
			bugContainer.innerHTML = `<h4 class="bug-subject">${bugLog[i].subject}</h4>
			<h5 class="bug-id">${bugLog[i].bugID}</h5>
			<h5 class="bug-timestamp">${bugLog[i].time}</h5>
			<p class="bug-desc">${bugLog[i].description}</p>
			<h5 class="bug-priority">Bug Priority: ${bugLog[i].priority}</h5>
			<h5 class="bug-status">Bug Status: <span class="bug-open">${bugLog[i].status}</span></h5>
			<h5 class="bug-status">Last Update: ${bugLog[i].lastUpdate}</h5>
			<textarea class="resolution" placeholder="Enter Resolution Details Here..." data-id="${bugLog[i].bugID}"></textarea>
			<button type="button" class="bug-complete-btn" data-id="${bugLog[i].bugID}">Close Bug</button>
			<button type="button" class="bug-edit-btn" data-id="${bugLog[i].bugID}">Edit Bug</button>
			<button type="button" class="bug-delete-btn" data-id="${bugLog[i].bugID}">Delete Bug</button>
			<hr class="divider-two">`;
			// Add the container to the bug list
			bugDisplay.append(bugContainer);
		} else{
			let bugContainer;
			let resolution = bugLog[i].resolution;
			if(!resolution){
				resolution = "Awaiting Resolution...";
			}
			// Create new container and assign class
			bugContainer = document.createElement("div");
			bugContainer.classList.add("bug-container");
			// Add bug ID as data attributes
			bugContainer.setAttribute('data-id', bugLog[i].bugID);
			// Assign content to container
			bugContainer.innerHTML = `<h4 class="bug-subject">${bugLog[i].subject}</h4>
			<h5 class="bug-id">${bugLog[i].bugID}</h5>
			<h5 class="bug-timestamp">${bugLog[i].time}</h5>
			<p class="bug-desc">${bugLog[i].description}</p>
			<h5 class="bug-priority">Bug Priority: ${bugLog[i].priority}</h5>
			<h5 class="bug-status">Bug Status: <span class="bug-closed">${bugLog[i].status}</span></h5>
			<h5 class="bug-status">Last Update: ${bugLog[i].lastUpdate}</h5>
			<p class="bug-desc">Resolution: </p>
			<p class="bug-desc">${resolution}</p>
			<button type="button" class="bug-complete-btn" data-id="${bugLog[i].bugID}">Open Bug</button>`;
			// Add the container to the bug list
			closedBugDisplay.append(bugContainer);
		}
	}
}

function timestamp(){
	// Timestamp the export
	let date = new Date();
	let month = date.getMonth() + 1;
	if(month < 10){
		month = "0" + month;
	}
	date = date.toString();
	date = date.split(" ");
	date = `${date[2]}/${month}/${date[3]} ${date[4]}`
	return date;
}

function clearForm(){
	// Empty all form fields ready for the next input
	bugSubject.value = "";
	bugDesc.value = "";
	bugPriority.value = "";
}

function createUniqueID(){
	// Store the time in a new variable
	let date = new Date().getTime();
	// Replace 'x' and 'y' chracters with the results of function
	let uID = `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, function(c){
		// Generate a random number (r)
		let r = (date + Math.random() * 16) % 16 | 0;
		date = Math.floor(date / 16);
		// If character is 'x' replace with 'r', else replace with r&0x3 or 0x8 if r&0x3 is 0
		return(c == 'x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uID;
}

function updateLocalStorage(){
	// Set bug log in Local Storage
	localStorage.setItem("BugLog", JSON.stringify(bugLog));
	// Reset the form
	clearForm();
	// Update the bug list display
	loadBugs();
	addEventListeners();
}

function addNewBug(){
	// Define new bug object
	let bugDetails = {
		bugID: createUniqueID(),
		subject: toTitleCase(bugSubject.value),
		description: bugDesc.value,
		priority: bugPriority.value,
		time: timestamp(),
		status: "Open"
	};
	// Add new bug to list
	bugLog.push(bugDetails);
	updateLocalStorage();
}

function toggleStatus(){
	// Search the bug log for relative line
	let searchResult = searchArr(this.getAttribute("data-id"), bugLog);
	// Change status to closed
	if(searchResult[0].status == "Closed"){
		searchResult[0].status = "Open";
		searchResult[0].lastUpdate = timestamp();
	} else{
		let resolution = document.querySelector(`textarea[data-id="${searchResult[0].bugID}"`).value;
		if(!resolution){
			alert("Please Enter a Resolution.");
			return
		}
		searchResult[0].status = "Closed";
		searchResult[0].resolution = resolution;
		searchResult[0].lastUpdate = timestamp();
	}
	bugLog[searchResult[1]] = searchResult[0];
	updateLocalStorage();
}

function editBug(){
	let editSubject = document.getElementById("modal-subject");
	let editDescription = document.getElementById("modal-description");
	let editPriority = document.getElementById("modal-priority");
	let hiddenField = document.getElementById("bug-id");
	let modalTitle = document.getElementById("modal-title");
	let saveChanges = document.getElementById("save-changes-btn");
	// Display the modal
	showModal();
	// Set the values of input fields
	let searchResult = searchArr(this.getAttribute("data-id"), bugLog);
	modalTitle.innerHTML = `Bug ID: ${searchResult[0].bugID}`;
	editSubject.value = searchResult[0].subject;
	editDescription.value = searchResult[0].description;
	editPriority.value = searchResult[0].priority;
	hiddenField.value = searchResult[0].bugID;
	saveChanges.setAttribute("data-id", searchResult[0].bugID);
}

function saveChanges(){
	let editSubject = document.getElementById("modal-subject");
	let editDescription = document.getElementById("modal-description");
	let editPriority = document.getElementById("modal-priority");
	// Search for the bug in the list
	let searchResult = searchArr(this.getAttribute("data-id"), bugLog);
	// Create new bug 
	searchResult[0].subject = toTitleCase(editSubject.value);
	searchResult[0].description = editDescription.value;
	searchResult[0].priority = editPriority.value;
	searchResult[0].lastUpdate = timestamp();
	// Overwrite existing bug with new
	bugLog.splice(searchResult[1], 1, searchResult[0]);
	// Push to local storage
	updateLocalStorage();
	// Close modal on completion
	hideModal();
}

function deleteBug(){
	// Seach the bug log for the relative line
	let searchResult = searchArr(this.getAttribute("data-id"), bugLog);
	// Delete the record from the array and publish
	bugLog.splice(searchResult[1], 1);
	updateLocalStorage();
}

function searchArr(val, arr){
	// Loop through the array
	for(let i = 0; i < arr.length; i++){
		if(val == arr[i].bugID){
			return [arr[i], i];
		}
	}
}

function toTitleCase(str){
	// convert whole string to lower case
	str = str.toLowerCase();
	// Split into individual words and 
	str = str.split(" ").map(function(word){
		// Return capitalised first char and rest of word
		return (word.charAt(0).toUpperCase() + word.slice(1));
	}).join(" ");
	// Return the result
	return str;
}

function addEventListeners(){
	// Submit button
	let submitBtn = document.getElementById("submit-btn");
	submitBtn.addEventListener("click", addNewBug);
	// Close bug button
	let closeBugBtn = document.querySelectorAll(".bug-complete-btn");
	for(let i = 0; i < closeBugBtn.length; i++){
		closeBugBtn[i].addEventListener("click", toggleStatus);
	}
	// Delete bug button
	let deleteBugBtn = document.querySelectorAll(".bug-delete-btn");
	for(let j = 0; j < deleteBugBtn.length; j++){
		deleteBugBtn[j].addEventListener("click", deleteBug);
	}
	// Edit bug button
	let editBugBtn = document.querySelectorAll(".bug-edit-btn");
	for(let k = 0; k < deleteBugBtn.length; k++){
		editBugBtn[k].addEventListener("click", editBug);
	}
	// Save changes
	let saveChangesBtn = document.getElementById("save-changes-btn");
	saveChangesBtn.addEventListener("click", saveChanges);
	// Close modal button
	let closeBtn = document.getElementById("close-modal");
	closeBtn.addEventListener("click", hideModal);
	// Click behind modal when open
	window.onclick = function(event) {
		if (event.target == modal) {
			hideModal();
		}
	}
	// Hide modal on esc key
	document.addEventListener("keydown", function(e){
		if(e.keyCode == 27){
			hideModal();
		}
	});
}

function showModal() {
	modal.classList.add("show-modal");
}

function hideModal(){
	modal.classList.remove("show-modal");
}
