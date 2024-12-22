document.addEventListener("DOMContentLoaded", () => {
    const tabsList = document.getElementById("tabs-list");

    // Creates li elements for an array of tab objs and adds them to ul 
    function createTabListEls(tabs) {
        tabs.forEach((tab) => {
            const li = document.createElement("li");
            li.textContent = tab.title;

            // "Switch" button
            const switchBtn = document.createElement("button");
            switchBtn.textContent = "Switch";
            switchBtn.addEventListener("click", () => {
                chrome.tabs.update(tab.id, { active: true });
            });

            // "Close" button
            const closeBtn = document.createElement("button");
            closeBtn.textContent = "Close";
            closeBtn.addEventListener("click", () => {
                chrome.tabs.remove(tab.id);
                li.remove(); // Remove the list item after closing
            });

            // "Duplicate" button
            const duplicatebtn = document.createElement("button");
            duplicatebtn.textContent = "Duplicate";
            duplicatebtn.addEventListener("click", () => {
                chrome.tabs.duplicate(tab.id);
            });

            li.appendChild(switchBtn);
            li.appendChild(closeBtn);
            li.appendChild(duplicatebtn);
            tabsList.appendChild(li);
        });
    }

    function createGroupedTabs(tabs) {
        // Create a map, basically a dict, and store arrays of tabs based on respective domain
        let groupedTabs = new Map();

        tabs.forEach((tab) => {
            const domain = new URL(tab.url).hostname;

            if (!groupedTabs.has(domain)) {
                groupedTabs.set(domain, []);
            }

            groupedTabs.get(domain).push(tab);
        });

        tabsList.innerHTML = ""; // Clear the list before appending new content

        // Now create the grouped tabs
        groupedTabs.forEach((tabGroup, domain) => {
            const hiddenTabs = document.createElement("details");
            const domainTitle = document.createElement("summary");

            domainTitle.textContent = domain;
            hiddenTabs.appendChild(domainTitle);

            const ul = document.createElement('ul');
            tabGroup.forEach((tab) => {
                const tabChild = document.createElement('li');
                tabChild.textContent = tab.title;
                ul.appendChild(tabChild);
            });
            hiddenTabs.appendChild(ul);
            tabsList.appendChild(hiddenTabs);
        });
    }

    // Fetch all tabs using chrome.tabs.query and pass them to createGroupedTabs
    chrome.tabs.query({}, (tabs) => {
        createGroupedTabs(tabs);
    });

    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    // Filters out all the tabs based on if the tab title includes the query
    // and displays the filtered tabs on the page 
    searchButton.addEventListener("click", () => {
        const query = searchInput.value.toLowerCase();
        tabsList.innerHTML = ""; // Clear the list
        chrome.tabs.query({}, (tabs) => {
            createTabListEls(tabs.filter(tab => tab.title.toLowerCase().includes(query)));
        });
    });
});
