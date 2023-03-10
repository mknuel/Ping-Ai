import bot from "./assets/robot.svg";
import user from "./assets/person.svg";
/* import bot from "./assets/bot.svg";
import user from "./assets/user.svg"; */

const form = document.getElementById("form");
const chatContainer = document.getElementById("chat_container");
let loading = false;
// load interval
let loadInterval;

// function that displays while pixie 'thinks'
const loader = (element) => {
	element.textContent = " ";

	loadInterval = setInterval(() => {
		element.textContent += ".";

		if (element.textContent.trim() === "....") {
			element.textContent = " ";
		}
	}, 300);
};
// check if an element contains another element
const elementContains = (parent, child) =>
	parent !== child && parent.contains(child);
// simulate typing effect for pixie
const typeText = (element, text) => {
	let index = 0;
	const cursor = document.getElementById("cursor");

	const blcursor = `<span class="blinking__cursor" ></span>`;

	console.log("typetext", element, text);

	let interval = setInterval(() => {
		chatContainer.scrollTop = chatContainer.scrollHeight;
		if (index < text.length) {
			console.log("index<dan");
			element.innerHTML += text.charAt(index);

			index++;
		} else {
			loading = false;
			clearInterval(interval);
		}
	}, 20);
};

// unique id generator
const generateUniqueId = () => {
	const timestamp = Date.now();
	const randomNumber = Math.random();
	const hexadecimalString = randomNumber.toString(16);

	return `id-${timestamp}-${hexadecimalString}`;
};

//
const chatStripe = (isAi, value, uniqueId) => {
	return `<div class="wrapper ${isAi && "ai"}">
            <div class="chat">
              <div class="profile">
                <img src="${isAi ? bot : user}"  alt="${
		isAi ? "bot" : "user"
	}"/>              </div>
              <div class="message" id="${uniqueId}">${value}</div>
            </div>
          </div>
    `;
};

const handleSubmit = async (e) => {
	e.preventDefault();
	const plContainer = document.getElementById("placeholder_container");
	if (plContainer) {
		console.log(plContainer);
		plContainer.parentElement.removeChild(plContainer);
	}
	if (loading) {
		return;
	}
	loading = true;

	const data = new FormData(form);

	// user's chat stripe
	chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

	form.reset();

	// bot's chat stripe
	const uniqueId = generateUniqueId();
	chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

	chatContainer.scrollTop = chatContainer.scrollHeight;

	const messageDiv = document.getElementById(uniqueId);

	loader(messageDiv);

	// fetch data from backend
	console.log(data.get("prompt"));
	const response = await fetch("https://ping-ai.onrender.com", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt: data.get("prompt"),
		}),
	});

	loading = false;
	clearInterval(loadInterval);
	messageDiv.innerHTML = "";

	if (response.ok) {
		const data = await response.json();
		const parsedData = data.bot.trim();

		typeText(messageDiv, parsedData);
	} else {
		const err = await response.text();
		messageDiv.textContent = "Something went wrong!";

		console.log(err);
	}
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
	if (e.keyCode === 13) {
		handleSubmit(e);
	}
});
