const APIURL = "https://api.github.com/users/";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

const recentUsers = document.getElementById("recentUsers");
let usersHistory = ["hoangsonww"];

getUser("hoangsonww");

async function getUser(username) {
    showLoading();
    const resp = await fetch(APIURL + username);
    const respData = await resp.json();
    if (respData.message === "Not Found" || !respData.name) {
        displayNotFound();
        return;
    }
    createUserCard(respData);

    getRepos(username);
    hideLoading();
}

async function getRepos(username) {
    // Fetch up to 100 repositories, which increases the chance to include the most popular ones
    const resp = await fetch(APIURL + username + "/repos?per_page=100&sort=created");
    const respData = await resp.json();

    addReposToCard(respData);
}


function createUserCard(user) {
    let formattedBlogUrl = user.blog;
    if (formattedBlogUrl && !formattedBlogUrl.startsWith('http://') && !formattedBlogUrl.startsWith('https://')) {
        formattedBlogUrl = `https://${formattedBlogUrl}`;
    }

    const cardHTML = `
        <div class="card">
            <div>
                <a href="${user.html_url}" target="_blank">
                    <img class="avatar" src="${user.avatar_url}" alt="${user.name}" />
                </a> 
            </div>
            <div class="user-info">
                <h2>${user.name}</h2>
                <p>${user.bio}</p>
                <ul class="info">
                    <li style="margin-right: 20px">${user.followers}<strong>Followers</strong></li>
                    <li style="margin-right: 20px">${user.following}<strong>Following</strong></li>
                    <li style="margin-right: 20px">${user.public_repos}<strong>Repos</strong></li>
                    <li style="margin-right: 20px">${user.public_gists}<strong>Gists</strong></li>
                </ul>
                <li><strong>Email:</strong> ${user.email || 'Not provided'}</li>
                <li><strong>Location:</strong> ${user.location || 'Not provided'}</li>
                <li><strong>Company:</strong> ${user.company || 'Not provided'}</li>
                <li><strong>Website/Blog:</strong> <a href="${formattedBlogUrl}" target="_blank">${user.blog || 'Not provided'}</a></li>
                <li><strong>Twitter:</strong> ${user.twitter_username ? `<a href="https://twitter.com/${user.twitter_username}" target="_blank">@${user.twitter_username}</a>` : 'Not provided'}</li>
                <li><strong>Joined At:</strong> ${new Date(user.created_at).toLocaleDateString()}</li>
                <li><strong>Last Updated:</strong> ${new Date(user.updated_at).toLocaleDateString()}</li>
                <div style="margin-bottom: 10px"></div>
                <div id="repos"></div>
                <button onclick="saveToFavorites('${user.login}')">Add to Favorites</button>
            </div>
        </div>
    `;

    main.innerHTML = cardHTML;
}

function displayNotFound() {
    const notFoundHTML = `
        <div class="card">
            <h2>User not found</h2>
            <p>The GitHub user you searched for does not exist.</p>
            <button onclick="location.reload();" class="back-btn">Back to Main Page</button>
        </div>
    `;

    main.innerHTML = notFoundHTML;
}

function addReposToCard(repos) {
    const reposEl = document.getElementById("repos");

    repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 10).forEach((repo) => {
        const repoEl = document.createElement("a");
        repoEl.classList.add("repo");
        repoEl.href = repo.html_url;
        repoEl.target = "_blank";
        repoEl.innerText = `${repo.name} (${repo.stargazers_count} stars)`;

        reposEl.appendChild(repoEl);
    });
}


function navigateToAbout() {
    window.location.href = "src/about.html";
}

function updateUserHistory(username) {
    usersHistory = [username, ...new Set(usersHistory)];
    usersHistory = usersHistory.slice(0, 5);
    renderUserHistory();
}

function renderUserHistory() {
    recentUsers.innerHTML = "Recent Users: ";
    usersHistory.forEach(user => {
        const userLink = document.createElement('a');
        userLink.textContent = user;
        userLink.href = "#";
        userLink.onclick = function() {
            getUser(user);
        };
        recentUsers.appendChild(userLink);
        recentUsers.appendChild(document.createTextNode(' '));
    });
}

function showLoading() {
    document.getElementById("loadingSpinner").hidden = false;
}

function hideLoading() {
    document.getElementById("loadingSpinner").hidden = true;
}


form.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = search.value;

    if (user) {
        getUser(user);

        search.value = "";
    }

    updateUserHistory(user);
});

function elizaResponse(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
        return "Hello! How can I assist you with GitHub profiles today?";
    } else if (lowerMessage.includes("how are you")) {
        return "I'm just lines of code, so I don't have feelings, but I'm here and ready to assist you!";
    } else if (lowerMessage.includes("search")) {
        return "To find a GitHub user, please type their username in the search box above.";
    } else if (lowerMessage.includes("thank")) {
        return "You're always welcome!";
    } else if (lowerMessage.includes("who are you")) {
        return "I'm the GitPeek Assistant, designed to make your GitHub profile searching experience smoother.";
    } else if (lowerMessage.includes("what can you do")) {
        return "I can guide you on how to use this platform, answer general questions, and provide insights about GitHub profiles.";
    } else if (lowerMessage.includes("github")) {
        return "GitHub is a platform for developers to collaborate on code. Interested in someone's profile? Just search above!";
    } else if (lowerMessage.includes("error") || lowerMessage.includes("problem")) {
        return "I apologize for the inconvenience. Could you provide more details about the issue?";
    } else if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
        return "Farewell! Don't hesitate to return if you have more questions. Happy coding!";
    } else if (lowerMessage.includes("help")) {
        return "Sure, I'm here to help! You can search for a GitHub user using the search bar above or ask me any other questions.";
    } else if (lowerMessage.includes("joke")) {
        return "Why did the programmer quit his job? Because he didn't get arrays!";
    } else if (lowerMessage.includes("repo") || lowerMessage.includes("repository")) {
        return "Repositories on GitHub contain all of a project's files and each file's revision history. Want to see someone's top repos? Just search for their profile!";
    } else if (lowerMessage.includes("love")) {
        return "I'm just a bot, so I don't have feelings. But I appreciate the positive vibes!";
    } else if (lowerMessage.includes("awesome") || lowerMessage.includes("great")) {
        return "Thank you for the kind words! How can I further assist you?";
    } else if (lowerMessage.includes("cool")) {
        return "Thank you! I'm here to make your experience better.";
    } else if (lowerMessage.includes("name")) {
        return "I'm the GitPeek Assistant. And you are?";
    } else if (lowerMessage.includes("age")) {
        return "In digital years, I'm quite young. In human years, I was born recently when this app was developed.";
    } else if (lowerMessage.includes("language") || lowerMessage.includes("programming")) {
        return "This platform is mainly built with HTML, CSS, and JavaScript. If you're referring to me, I'm scripted in JavaScript!";
    } else if (lowerMessage.includes("weather")) {
        return "I'm more of a GitHub expert than a weatherman. Maybe try a weather app?";
    } else if (lowerMessage.includes("music")) {
        return "While I can't play music, I can certainly chat about GitHub! Any questions?";
    } else if (lowerMessage.includes("how do I use this")) {
        return "Simply enter a GitHub username into the search box, and I'll fetch the user's profile details for you!";
    } else if (lowerMessage.includes("where are you")) {
        return "I live in the virtual world of this platform. Always here, always ready to assist!";
    } else if (lowerMessage.includes("open source")) {
        return "Yes, GitHub is a platform that champions open-source projects. You can search for any user and see their contributions!";
    } else if (lowerMessage.includes("your creator")) {
        return "I was developed by the creators of this app. They used JavaScript to bring me to life!";
    } else if (lowerMessage.includes("favorite color")) {
        return "I don't have preferences like humans do, but I've been designed with a theme of purples and blues.";
    } else if (lowerMessage.includes("fun fact")) {
        return "Did you know? The term 'bug' in programming is derived from an actual bug that was found in a computer in the 1940s!";
    } else if (lowerMessage.includes("coffee or tea")) {
        return "I don't consume beverages, but I've observed developers enjoy both!";
    } else if (lowerMessage.includes("tell me more about github")) {
        return "GitHub is a collaborative platform for developers. It's used for version control and collaboration, allowing multiple people to work on projects simultaneously.";
    } else {
        return "Sorry, I didn't catch that. Can you rephrase or ask another question?";
    }
}

const chatbotInput = document.getElementById("chatbotInput");
const chatbotBody = document.getElementById("chatbotBody");

chatbotInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage(chatbotInput.value);
        chatbotInput.value = "";
    }
});

function sendMessage(message) {
    chatbotBody.innerHTML += `
        <div style="text-align: right; margin-bottom: 10px; color: white;">${message}</div>
    `;
    let botReply = elizaResponse(message);
    setTimeout(() => {
        chatbotBody.innerHTML += `
            <div style="text-align: left; margin-bottom: 10px; color: #bbb;">${botReply}</div>
        `;
    }, 1000);
}

const surpriseMeBtn = document.createElement('button');
surpriseMeBtn.style.marginTop = '10px';
surpriseMeBtn.style.marginBottom = '30px';
surpriseMeBtn.textContent = 'Surprise Me!';
surpriseMeBtn.onclick = getRandomUser;
document.body.insertBefore(surpriseMeBtn, main);

const favoritesContainer = document.createElement('div');
favoritesContainer.id = 'favoritesContainer';
favoritesContainer.innerHTML = '<h3>Your Favorites:</h3>';
document.body.insertBefore(favoritesContainer, recentUsers.nextSibling);

function getRandomUser() {
    const randomNames = ["john", "jane", "james", "emma", "liam", "olivia", "david", "nate"];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];

    fetch(APIURL + randomName)
        .then(response => response.json())
        .then(data => {
            if (data && !data.message) {
                getUser(data.login);
            } else {
                getRandomUser();
            }
        })
        .catch(() => {
            displayNotFound();
        });
}

function saveToFavorites(username) {
    let favorites = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
    if (!favorites.includes(username)) {
        favorites.push(username);
        localStorage.setItem("favoriteUsers", JSON.stringify(favorites));
    }
    displayFavorites();
}

function removeFromFavorites(username) {
    let favorites = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
    favorites = favorites.filter(user => user !== username);
    localStorage.setItem("favoriteUsers", JSON.stringify(favorites));
    displayFavorites();
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
    const container = document.getElementById("favoritesContainer");
    container.innerHTML = "<h3>Your Favorites:</h3>";

    favorites.forEach(user => {
        const userLink = document.createElement('a');
        userLink.textContent = user;
        userLink.href = "#";
        userLink.onclick = function() {
            getUser(user);
        };

        const removeBtn = document.createElement('a');
        removeBtn.textContent = "Remove";
        removeBtn.href = "#";
        removeBtn.onclick = function(event) {
            event.preventDefault();
            removeFromFavorites(user);
        };

        container.appendChild(userLink);
        container.appendChild(document.createTextNode(' ')); // for spacing
        container.appendChild(removeBtn);
        container.appendChild(document.createElement('br')); // for a new line
    });
}

displayFavorites();
