const APIURL = "https://api.github.com/users/";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

const recentUsers = document.getElementById("recentUsers");
let usersHistory = ["hoangsonww"];

getUser("hoangsonww");

async function getUser(username) {
    showLoading();
    try {
        const userResponse = await fetch(APIURL + username);
        if (!userResponse.ok) {
            throw new Error('User not found');
        }
        const userData = await userResponse.json();
        if (userData.message === "Not Found" || !userData.name) {
            displayNotFound();
            return;
        }

        const { totalStars, totalForks, totalWatchers } = await getRepositoryStats(username);

        createUserCard(userData, totalStars, totalForks, totalWatchers);
        getRepos(username);
    }
    catch (error) {
        console.error(error);
        displayNotFound();
    }
    finally {
        hideLoading();
    }
}

async function getRepositoryStats(username) {
    let page = 1;
    let stats = { totalStars: 0, totalForks: 0, totalWatchers: 0 };
    let fetchMore = true;

    while (fetchMore) {
        const reposResponse = await fetch(`${APIURL + username}/repos?per_page=100&page=${page}`);
        const repos = await reposResponse.json();
        repos.forEach(repo => {
            stats.totalStars += repo.stargazers_count;
            stats.totalForks += repo.forks_count;
        });

        if (repos.length < 100) {
            fetchMore = false;
        }
        else {
            page++;
        }
    }

    return stats;
}

async function getRepos(username) {
    const resp = await fetch(`${APIURL + username}/repos?per_page=100&sort=created`);
    const respData = await resp.json();
    addReposToCard(respData);
}

function createUserCard(user, totalStars, totalForks, totalWatchers) {
    let formattedBlogUrl = user.blog;
    if (formattedBlogUrl && !formattedBlogUrl.startsWith('http://') && !formattedBlogUrl.startsWith('https://')) {
        formattedBlogUrl = `https://${formattedBlogUrl}`;
    }

    const hireableStatus = user.hireable ? "Yes" : "No";
    const gistsUrl = `https://gist.github.com/${user.login}`;
    const followersUrl = `${user.html_url}?tab=followers`;
    const followingUrl = `${user.html_url}?tab=following`;
    const reposUrl = `${user.html_url}?tab=repositories`;

    const cardHTML = `
        <div class="card">
            <div>
                <a href="${user.html_url}" target="_blank" title="Click to view profile">
                    <img class="avatar" src="${user.avatar_url}" alt="${user.name}" />
                </a> 
            </div>
            <div class="user-info">
                <a href="${user.html_url}" target="_blank" style="color: white; text-decoration: none" title="Click to view profile">
                    <h2>${user.name}</h2>
                </a>
                <p><strong>Bio:</strong> ${user.bio}</p>
                <ul class="info">
                    <a style="text-decoration: none; color: white" href="${followersUrl}" target="_blank"><li style="margin-right: 20px">${user.followers}<strong>Followers</strong></li></a>
                    <a style="text-decoration: none; color: white" href="${followingUrl}" target="_blank"><li style="margin-right: 20px">${user.following}<strong>Following</strong></li></a>
                    <a style="text-decoration: none; color: white" href="${reposUrl}" target="_blank"><li style="margin-right: 20px">${user.public_repos}<strong>Repos</strong></li></a>
                    <a style="text-decoration: none; color: white" href="${gistsUrl}" target="_blank"><li style="margin-right: 20px">${user.public_gists}<strong>Gists</strong></li></a>
                    <li style="margin-right: 20px">${totalStars}<strong>Stars</strong></li>
                    <li style="margin-right: 20px">${totalForks}<strong>Forks</strong></li>
                </ul>
                <li><strong>Email:</strong> ${user.email || 'Not provided'}</li>
                <li><strong>Location:</strong> ${user.location || 'Not provided'}</li>
                <li><strong>Organization:</strong> ${user.company || 'Not provided'}</li>
                <li><strong>Website/Blog:</strong> <a id="webLink" href="${formattedBlogUrl}" target="_blank">${user.blog || 'Not provided'}</a></li>
                <li><strong>Twitter:</strong> ${user.twitter_username ? `<a style="color: white" href="https://twitter.com/${user.twitter_username}" target="_blank">@${user.twitter_username}</a>` : 'Not provided'}</li>
                <li><strong>Joined At:</strong> ${new Date(user.created_at).toLocaleDateString()}</li>
                <li><strong>Last Updated:</strong> ${new Date(user.updated_at).toLocaleDateString()}</li>
                <li><strong>Hireable:</strong> ${hireableStatus}</li>
                <li><strong>Gists:</strong> <a id="webLink1" href="${gistsUrl}" target="_blank">View Gists</a></li>
                <div style="margin-bottom: 10px"></div>
                <p><strong>Notable Repositories:</strong></p>
                <div id="repos"></div>
                <button onclick="saveToFavorites('${user.login}')">Add to Favorites</button>
            </div>
        </div>
    `;

    document.getElementById('main').innerHTML = cardHTML;
}

function displayNotFound() {
    const notFoundHTML = `
        <div class="card">
            <h2>User not found</h2>
            <p>The GitHub user you searched for does not exist.</p>
            <button onclick="window.location.reload();" class="back-btn">Back to Main Page</button>
        </div>
    `;

    main.innerHTML = notFoundHTML;
}

function addReposToCard(repos) {
    const reposEl = document.getElementById("repos");

    repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 14).forEach((repo) => {
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

    const responses = [
        { patterns: ["hello", "hi", "hey"], response: "Hello! How can I assist you with GitHub profiles today?" },
        { patterns: ["how are you"], response: "I'm just lines of code, so I don't have feelings, but I'm here and ready to assist you!" },
        { patterns: ["search"], response: "To find a GitHub user, please type their username in the search box above." },
        { patterns: ["thank"], response: "You're always welcome!" },
        { patterns: ["who are you"], response: "I'm the GitPeek Assistant, designed to make your GitHub profile searching experience smoother." },
        { patterns: ["what can you do"], response: "I can guide you on how to use this platform, answer general questions, and provide insights about GitHub profiles." },
        { patterns: ["github"], response: "GitHub is a platform for developers to collaborate on code. Interested in someone's profile? Just search above!" },
        { patterns: ["error", "problem"], response: "I apologize for the inconvenience. Could you provide more details about the issue?" },
        { patterns: ["bye", "goodbye"], response: "Farewell! Don't hesitate to return if you have more questions. Happy coding!" },
        { patterns: ["help"], response: "Sure, I'm here to help! You can search for a GitHub user using the search bar above or ask me any other questions." },
        { patterns: ["joke"], response: "Why did the programmer quit his job? Because he didn't get arrays!" },
        { patterns: ["repo", "repository"], response: "Repositories on GitHub contain all of a project's files and each file's revision history. Want to see someone's top repos? Just search for their profile!" },
        { patterns: ["love"], response: "I'm just a bot, so I don't have feelings. But I appreciate the positive vibes!" },
        { patterns: ["awesome", "great"], response: "Thank you for the kind words! How can I further assist you?" },
        { patterns: ["cool"], response: "Thank you! I'm here to make your experience better." },
        { patterns: ["name"], response: "I'm the GitPeek Assistant. And you are?" },
        { patterns: ["age"], response: "In digital years, I'm quite young. In human years, I was born recently when this app was developed." },
        { patterns: ["language", "programming"], response: "This platform is mainly built with HTML, CSS, and JavaScript. If you're referring to me, I'm scripted in JavaScript!" },
        { patterns: ["weather"], response: "I'm more of a GitHub expert than a weatherman. Maybe try a weather app?" },
        { patterns: ["music"], response: "While I can't play music, I can certainly chat about GitHub! Any questions?" },
        { patterns: ["how do I use this"], response: "Simply enter a GitHub username into the search box, and I'll fetch the user's profile details for you!" },
        { patterns: ["where are you"], response: "I live in the virtual world of this platform. Always here, always ready to assist!" },
        { patterns: ["open source"], response: "Yes, GitHub is a platform that champions open-source projects. You can search for any user and see their contributions!" },
        { patterns: ["your creator"], response: "I was developed by Son Nguyen of this app. He used JavaScript to bring me to life!" },
        { patterns: ["favorite color"], response: "I don't have preferences like humans do, but I've been designed with a theme of purples and blues." },
        { patterns: ["fun fact"], response: "Did you know? The term 'bug' in programming is derived from an actual bug that was found in a computer in the 1940s!" },
        { patterns: ["coffee or tea"], response: "I don't consume beverages, but I've observed developers enjoy both!" },
        { patterns: ["tell me more about github"], response: "GitHub is a collaborative platform for developers. It's used for version control and collaboration, allowing multiple people to work on projects simultaneously." },
    ];

    for (const response of responses) {
        for (const pattern of response.patterns) {
            if (lowerMessage.includes(pattern)) {
                return response.response;
            }
        }
    }

    return "Sorry, I didn't catch that. Can you rephrase or ask another question?";
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
    const knownUsers = ["octocat", "torvalds", "mojombo", "defunkt", "pjhyett", "wycats", "ezmobius", "ivey", "vanpelt"];
    const randomIndex = Math.floor(Math.random() * knownUsers.length);
    const randomUser = knownUsers[randomIndex];

    getUser(randomUser);
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
        container.appendChild(document.createTextNode(' '));
        container.appendChild(removeBtn);
        container.appendChild(document.createElement('br'));
    });
}

displayFavorites();
